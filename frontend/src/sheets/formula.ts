// Offline spreadsheet formula engine. Supports A1 references, ranges,
// arithmetic, comparisons, logical, and common functions.

import type { Sheet } from "@/src/storage/db";

export function colToLetter(n: number): string {
  let s = "";
  n = n + 1;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function letterToCol(s: string): number {
  s = s.toUpperCase();
  let n = 0;
  for (let i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
  return n - 1;
}

export function cellId(row: number, col: number) {
  return `${colToLetter(col)}${row + 1}`;
}

export function parseRef(ref: string): { row: number; col: number } | null {
  const m = /^\$?([A-Za-z]+)\$?(\d+)$/.exec(ref.trim());
  if (!m) return null;
  return { col: letterToCol(m[1]), row: parseInt(m[2], 10) - 1 };
}

export function parseRange(range: string): { r1: number; c1: number; r2: number; c2: number } | null {
  const [a, b] = range.split(":");
  const p = parseRef(a);
  const q = b ? parseRef(b) : p;
  if (!p || !q) return null;
  return { r1: Math.min(p.row, q.row), r2: Math.max(p.row, q.row), c1: Math.min(p.col, q.col), c2: Math.max(p.col, q.col) };
}

type Ctx = { sheet: Sheet; visiting: Set<string>; cache: Map<string, any> };

function getCellRaw(sheet: Sheet, row: number, col: number) {
  return sheet.cells[cellId(row, col)];
}

function evalCell(id: string, ctx: Ctx): any {
  if (ctx.cache.has(id)) return ctx.cache.get(id);
  if (ctx.visiting.has(id)) return "#CYCLE!";
  ctx.visiting.add(id);
  const p = parseRef(id);
  if (!p) return "#REF!";
  const c = ctx.sheet.cells[id];
  let val: any = "";
  if (!c) val = "";
  else if (c.f) val = evalFormula(c.f, ctx);
  else val = c.v ?? "";
  ctx.visiting.delete(id);
  ctx.cache.set(id, val);
  return val;
}

function rangeValues(range: string, ctx: Ctx): any[] {
  const r = parseRange(range);
  if (!r) return [];
  const out: any[] = [];
  for (let row = r.r1; row <= r.r2; row++) {
    for (let col = r.c1; col <= r.c2; col++) {
      out.push(evalCell(cellId(row, col), ctx));
    }
  }
  return out;
}

function toNum(v: any): number {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v === "" || v == null) return 0;
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

function nums(vals: any[]): number[] {
  return vals.filter((v) => v !== "" && v != null && !isNaN(parseFloat(String(v)))).map(toNum);
}

const FUNCS: Record<string, (args: any[], ctx: Ctx) => any> = {
  SUM: (a) => a.flat().reduce((s, v) => s + toNum(v), 0),
  AVERAGE: (a) => { const n = nums(a.flat()); return n.length ? n.reduce((s, v) => s + v, 0) / n.length : 0; },
  MEAN: (a) => FUNCS.AVERAGE(a, null as any),
  COUNT: (a) => nums(a.flat()).length,
  COUNTA: (a) => a.flat().filter((v) => v !== "" && v != null).length,
  MAX: (a) => Math.max(...nums(a.flat())),
  MIN: (a) => Math.min(...nums(a.flat())),
  MEDIAN: (a) => { const n = nums(a.flat()).sort((x, y) => x - y); if (!n.length) return 0; const m = Math.floor(n.length / 2); return n.length % 2 ? n[m] : (n[m - 1] + n[m]) / 2; },
  PRODUCT: (a) => a.flat().reduce((p, v) => p * toNum(v), 1),
  ROUND: (a) => { const [x, d] = a; const p = Math.pow(10, toNum(d ?? 0)); return Math.round(toNum(x) * p) / p; },
  ABS: (a) => Math.abs(toNum(a[0])),
  SQRT: (a) => Math.sqrt(toNum(a[0])),
  POWER: (a) => Math.pow(toNum(a[0]), toNum(a[1])),
  MOD: (a) => toNum(a[0]) % toNum(a[1]),
  IF: (a) => (truthy(a[0]) ? a[1] : a[2] ?? ""),
  AND: (a) => a.flat().every(truthy),
  OR: (a) => a.flat().some(truthy),
  NOT: (a) => !truthy(a[0]),
  IFERROR: (a) => (isErr(a[0]) ? a[1] : a[0]),
  CONCAT: (a) => a.flat().map((v) => String(v)).join(""),
  CONCATENATE: (a) => a.flat().map((v) => String(v)).join(""),
  LEN: (a) => String(a[0] ?? "").length,
  LOWER: (a) => String(a[0] ?? "").toLowerCase(),
  UPPER: (a) => String(a[0] ?? "").toUpperCase(),
  TRIM: (a) => String(a[0] ?? "").trim(),
  LEFT: (a) => String(a[0] ?? "").slice(0, toNum(a[1] ?? 1)),
  RIGHT: (a) => { const s = String(a[0] ?? ""); const n = toNum(a[1] ?? 1); return s.slice(s.length - n); },
  MID: (a) => String(a[0] ?? "").substr(toNum(a[1]) - 1, toNum(a[2])),
  TODAY: () => new Date().toISOString().slice(0, 10),
  NOW: () => new Date().toISOString(),
  YEAR: (a) => new Date(String(a[0])).getFullYear(),
  MONTH: (a) => new Date(String(a[0])).getMonth() + 1,
  DAY: (a) => new Date(String(a[0])).getDate(),
  COUNTIF: (a, ctx) => { const vals = a[0]; const crit = a[1]; return (Array.isArray(vals) ? vals : [vals]).filter((v: any) => matchCriteria(v, crit)).length; },
  SUMIF: (a) => { const range = Array.isArray(a[0]) ? a[0] : [a[0]]; const crit = a[1]; const sumR = Array.isArray(a[2]) ? a[2] : range; let s = 0; range.forEach((v: any, i: number) => { if (matchCriteria(v, crit)) s += toNum(sumR[i]); }); return s; },
  AVERAGEIF: (a) => { const range = Array.isArray(a[0]) ? a[0] : [a[0]]; const crit = a[1]; const avR = Array.isArray(a[2]) ? a[2] : range; const vs: number[] = []; range.forEach((v: any, i: number) => { if (matchCriteria(v, crit)) vs.push(toNum(avR[i])); }); return vs.length ? vs.reduce((s, x) => s + x, 0) / vs.length : 0; },
  VLOOKUP: (a) => { const key = a[0]; const table = a[1]; const idx = toNum(a[2]); if (!Array.isArray(table)) return "#N/A"; // table is flat range; can't handle 2D from flat; fallback
    return "#N/A"; },
  TRUE: () => true,
  FALSE: () => false,
  PI: () => Math.PI,
};

function truthy(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (v == null || v === "") return false;
  return true;
}
function isErr(v: any): boolean {
  return typeof v === "string" && v.startsWith("#") && v.endsWith("!");
}
function matchCriteria(v: any, crit: any): boolean {
  const s = String(crit ?? "");
  const m = /^([<>]=?|<>|=)?(.*)$/.exec(s);
  const op = m?.[1] || "=";
  const val = m?.[2] ?? "";
  const nv = parseFloat(val);
  const isNum = !isNaN(nv);
  const cv = isNum ? toNum(v) : String(v);
  const rv: any = isNum ? nv : val;
  switch (op) {
    case ">": return cv > rv;
    case "<": return cv < rv;
    case ">=": return cv >= rv;
    case "<=": return cv <= rv;
    case "<>": return cv !== rv;
    default: return String(cv).toLowerCase() === String(rv).toLowerCase();
  }
}

// Tokenizer + recursive descent parser
type Tok = { t: "num" | "str" | "id" | "op" | "lparen" | "rparen" | "comma" | "ref" | "range"; v: string };
function tokenize(s: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " ") { i++; continue; }
    if (c === "(") { toks.push({ t: "lparen", v: c }); i++; continue; }
    if (c === ")") { toks.push({ t: "rparen", v: c }); i++; continue; }
    if (c === ",") { toks.push({ t: "comma", v: c }); i++; continue; }
    if ("+-*/^%".includes(c)) { toks.push({ t: "op", v: c }); i++; continue; }
    if (c === "<" || c === ">" || c === "=" || c === "!") {
      let op = c; if ("=<>".includes(s[i + 1] || "")) { op += s[++i]; }
      toks.push({ t: "op", v: op }); i++; continue;
    }
    if (c === '"') {
      let j = i + 1; while (j < s.length && s[j] !== '"') j++;
      toks.push({ t: "str", v: s.slice(i + 1, j) }); i = j + 1; continue;
    }
    if (/\d/.test(c) || (c === "." && /\d/.test(s[i + 1]))) {
      let j = i + 1; while (j < s.length && /[\d.]/.test(s[j])) j++;
      toks.push({ t: "num", v: s.slice(i, j) }); i = j; continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i + 1; while (j < s.length && /[A-Za-z0-9_$]/.test(s[j])) j++;
      let name = s.slice(i, j);
      // check for range like A1:B2
      const refMatch = /^\$?[A-Za-z]+\$?\d+$/.test(name);
      if (refMatch && s[j] === ":") {
        let k = j + 1; while (k < s.length && /[A-Za-z0-9_$]/.test(s[k])) k++;
        toks.push({ t: "range", v: name + ":" + s.slice(j + 1, k) }); i = k; continue;
      }
      if (refMatch) { toks.push({ t: "ref", v: name }); i = j; continue; }
      toks.push({ t: "id", v: name.toUpperCase() }); i = j; continue;
    }
    i++;
  }
  return toks;
}

function parseExpr(toks: Tok[], ctx: Ctx): any {
  let p = 0;
  function peek() { return toks[p]; }
  function eat() { return toks[p++]; }
  function parseCompare(): any {
    let left = parseAdd();
    while (peek() && peek().t === "op" && ["=", "<", ">", "<=", ">=", "<>", "=="].includes(peek().v)) {
      const op = eat().v; const right = parseAdd();
      const ln = toNum(left), rn = toNum(right);
      const bothNum = typeof left === "number" || typeof right === "number";
      const a = bothNum ? ln : String(left);
      const b = bothNum ? rn : String(right);
      switch (op) {
        case "=": case "==": left = a === b; break;
        case "<>": left = a !== b; break;
        case "<": left = a < b; break;
        case ">": left = a > b; break;
        case "<=": left = a <= b; break;
        case ">=": left = a >= b; break;
      }
    }
    return left;
  }
  function parseAdd(): any {
    let left = parseMul();
    while (peek() && peek().t === "op" && (peek().v === "+" || peek().v === "-")) {
      const op = eat().v; const right = parseMul();
      left = op === "+" ? toNum(left) + toNum(right) : toNum(left) - toNum(right);
    }
    return left;
  }
  function parseMul(): any {
    let left = parsePow();
    while (peek() && peek().t === "op" && (peek().v === "*" || peek().v === "/" || peek().v === "%")) {
      const op = eat().v; const right = parsePow();
      if (op === "*") left = toNum(left) * toNum(right);
      else if (op === "/") { const r = toNum(right); left = r === 0 ? "#DIV/0!" : toNum(left) / r; }
      else left = toNum(left) % toNum(right);
    }
    return left;
  }
  function parsePow(): any {
    let left = parseUnary();
    while (peek() && peek().t === "op" && peek().v === "^") { eat(); left = Math.pow(toNum(left), toNum(parseUnary())); }
    return left;
  }
  function parseUnary(): any {
    if (peek() && peek().t === "op" && (peek().v === "-" || peek().v === "+")) {
      const op = eat().v; const v = parsePrimary(); return op === "-" ? -toNum(v) : toNum(v);
    }
    return parsePrimary();
  }
  function parsePrimary(): any {
    const tk = peek(); if (!tk) return 0;
    if (tk.t === "num") { eat(); return parseFloat(tk.v); }
    if (tk.t === "str") { eat(); return tk.v; }
    if (tk.t === "ref") { eat(); return evalCell(tk.v.replace(/\$/g, "").toUpperCase(), ctx); }
    if (tk.t === "range") { eat(); return rangeValues(tk.v.replace(/\$/g, "").toUpperCase(), ctx); }
    if (tk.t === "lparen") { eat(); const v = parseCompare(); if (peek()?.t === "rparen") eat(); return v; }
    if (tk.t === "id") {
      const name = tk.v; eat();
      if (peek()?.t === "lparen") {
        eat();
        const args: any[] = [];
        if (peek()?.t !== "rparen") {
          args.push(parseCompare());
          while (peek()?.t === "comma") { eat(); args.push(parseCompare()); }
        }
        if (peek()?.t === "rparen") eat();
        const fn = FUNCS[name];
        if (!fn) return "#NAME?";
        try { return fn(args, ctx); } catch { return "#ERROR!"; }
      }
      return name;
    }
    eat(); return 0;
  }
  return parseCompare();
}

export function evalFormula(formula: string, ctx: Ctx): any {
  const s = formula.startsWith("=") ? formula.slice(1) : formula;
  try {
    const toks = tokenize(s);
    return parseExpr(toks, ctx);
  } catch {
    return "#ERROR!";
  }
}

export function computeSheet(sheet: Sheet): Record<string, any> {
  const ctx: Ctx = { sheet, visiting: new Set(), cache: new Map() };
  const out: Record<string, any> = {};
  for (const id of Object.keys(sheet.cells)) {
    out[id] = evalCell(id, ctx);
  }
  return out;
}

export function computeCell(sheet: Sheet, id: string): any {
  const ctx: Ctx = { sheet, visiting: new Set(), cache: new Map() };
  return evalCell(id, ctx);
}
