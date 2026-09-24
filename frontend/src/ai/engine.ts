// Local offline AI engine — deterministic heuristics. No network.

export function tokenizeSentences(text: string): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const parts = t.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
  return parts.filter(Boolean);
}

export function tokenizeWords(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s']/gi, " ").split(/\s+/).filter(Boolean);
}

const STOP = new Set("a about above after again against all am an and any are as at be because been before being below between both but by can could did do does doing don down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not of off on once only or other ought our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why with would you your yours yourself yourselves".split(" "));

export function keywords(text: string, n = 8): string[] {
  const freq: Record<string, number> = {};
  for (const w of tokenizeWords(text)) {
    if (STOP.has(w) || w.length < 3) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map((x) => x[0]);
}

export function summarize(text: string, sentences = 3): string {
  const sents = tokenizeSentences(text);
  if (sents.length <= sentences) return text;
  const wordFreq: Record<string, number> = {};
  for (const s of sents) for (const w of tokenizeWords(s)) {
    if (STOP.has(w) || w.length < 3) continue;
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }
  const maxF = Math.max(1, ...Object.values(wordFreq));
  const scored = sents.map((s, i) => {
    const ws = tokenizeWords(s);
    const score = ws.reduce((acc, w) => acc + (wordFreq[w] || 0) / maxF, 0) / Math.max(1, ws.length);
    return { s, score: score + (i < 2 ? 0.15 : 0), i };
  });
  const top = scored.sort((a, b) => b.score - a.score).slice(0, sentences).sort((a, b) => a.i - b.i);
  return top.map((x) => x.s).join(" ");
}

export function outline(text: string, depth = 5): string[] {
  const sents = tokenizeSentences(text);
  const kws = keywords(text, 20);
  const points: string[] = [];
  for (const s of sents) {
    if (points.length >= depth) break;
    if (kws.some((k) => s.toLowerCase().includes(k))) points.push(s.length > 100 ? s.slice(0, 97) + "…" : s);
  }
  if (points.length < depth) for (const s of sents) {
    if (points.length >= depth) break;
    if (!points.includes(s)) points.push(s.length > 100 ? s.slice(0, 97) + "…" : s);
  }
  return points;
}

const GRAMMAR_RULES: [RegExp, string | ((m: string, ...args: any[]) => string)][] = [
  [/\bi\b/g, "I"],
  [/\s+([.,!?;:])/g, "$1"],
  [/\s{2,}/g, " "],
  [/\ba\s+([aeiouAEIOU])/g, "an $1"],
  [/\bteh\b/gi, "the"],
  [/\brecieve\b/gi, "receive"],
  [/\bdefinately\b/gi, "definitely"],
  [/\boccured\b/gi, "occurred"],
  [/\bseperate\b/gi, "separate"],
  [/\bwich\b/gi, "which"],
  [/\bthier\b/gi, "their"],
  [/\balot\b/gi, "a lot"],
];
export function grammarFix(text: string): { fixed: string; changes: number } {
  let out = text; let changes = 0;
  for (const [re, rep] of GRAMMAR_RULES) {
    const before = out;
    out = out.replace(re as any, rep as any);
    if (before !== out) changes++;
  }
  return { fixed: out, changes };
}

const TONES: Record<string, [RegExp, string][]> = {
  professional: [
    [/\bkinda\b/gi, "somewhat"], [/\bgonna\b/gi, "going to"], [/\bwanna\b/gi, "want to"],
    [/\bthanks\b/gi, "Thank you"], [/\bawesome\b/gi, "excellent"], [/\bcool\b/gi, "favorable"],
  ],
  friendly: [
    [/\bHello\b/gi, "Hi"], [/\bThank you\b/gi, "Thanks"], [/\bregards\b/gi, "cheers"],
    [/\butilize\b/gi, "use"],
  ],
  concise: [
    [/\bin order to\b/gi, "to"], [/\bdue to the fact that\b/gi, "because"],
    [/\bat this point in time\b/gi, "now"], [/\ba large number of\b/gi, "many"],
    [/\butilize\b/gi, "use"], [/\bimplement\b/gi, "do"],
  ],
  formal: [
    [/\bcan't\b/gi, "cannot"], [/\bwon't\b/gi, "will not"], [/\bdon't\b/gi, "do not"],
    [/\bit's\b/gi, "it is"], [/\bI'm\b/gi, "I am"], [/\bthey're\b/gi, "they are"],
  ],
  casual: [
    [/\bcannot\b/gi, "can't"], [/\bwill not\b/gi, "won't"], [/\bdo not\b/gi, "don't"], [/\bit is\b/gi, "it's"],
  ],
};
export function changeTone(text: string, tone: keyof typeof TONES): string {
  const rules = TONES[tone] || [];
  let out = text;
  for (const [re, rep] of rules) out = out.replace(re, rep);
  return out;
}

export function rewrite(text: string, mode: "expand" | "shorten" | "improve"): string {
  const sents = tokenizeSentences(text);
  if (mode === "shorten") return sents.slice(0, Math.max(1, Math.ceil(sents.length / 2))).join(" ");
  if (mode === "expand") return sents.map((s) => {
    const kws = keywords(s, 2);
    const suffix = kws.length ? ` This aspect is particularly relevant when considering ${kws.join(" and ")}.` : "";
    return s + suffix;
  }).join(" ");
  const filler = /\b(basically|actually|literally|very|just|really|kind of|sort of)\b/gi;
  return grammarFix(text.replace(filler, "").replace(/\s{2,}/g, " ")).fixed;
}

const DICTS: Record<string, Record<string, string>> = {
  es: { hello: "hola", world: "mundo", is: "es", are: "son", good: "bueno", morning: "mañana", night: "noche", yes: "sí", no: "no", please: "por favor", thanks: "gracias", welcome: "bienvenido", how: "cómo", what: "qué", when: "cuándo", where: "dónde", why: "por qué", who: "quién", you: "tú", we: "nosotros", they: "ellos", love: "amor", friend: "amigo", family: "familia", work: "trabajo", home: "casa", food: "comida", water: "agua", time: "tiempo", day: "día", year: "año", book: "libro", school: "escuela", document: "documento", office: "oficina" },
  fr: { hello: "bonjour", world: "monde", is: "est", are: "sont", good: "bon", morning: "matin", night: "nuit", yes: "oui", no: "non", please: "s'il vous plaît", thanks: "merci", welcome: "bienvenue", how: "comment", what: "quoi", when: "quand", where: "où", why: "pourquoi", who: "qui", you: "tu", we: "nous", they: "ils", love: "amour", friend: "ami", family: "famille", work: "travail", home: "maison", food: "nourriture", water: "eau", time: "temps", day: "jour", year: "année", book: "livre", school: "école", document: "document", office: "bureau" },
  hi: { hello: "नमस्ते", world: "दुनिया", is: "है", are: "हैं", good: "अच्छा", morning: "सुबह", night: "रात", yes: "हाँ", no: "नहीं", please: "कृपया", thanks: "धन्यवाद", welcome: "स्वागत", how: "कैसे", what: "क्या", when: "कब", where: "कहाँ", why: "क्यों", who: "कौन", you: "आप", we: "हम", they: "वे", love: "प्यार", friend: "दोस्त", family: "परिवार", work: "काम", home: "घर", food: "खाना", water: "पानी", time: "समय", day: "दिन", year: "साल", book: "किताब", school: "स्कूल", document: "दस्तावेज़", office: "कार्यालय" },
};
export function translate(text: string, lang: "es" | "fr" | "hi"): { translated: string; coverage: number } {
  const dict = DICTS[lang] || {};
  let hits = 0, total = 0;
  const translated = text.replace(/\b([a-zA-Z]+)\b/g, (m) => {
    total++;
    const k = m.toLowerCase();
    if (dict[k]) { hits++; return dict[k]; }
    return m;
  });
  return { translated, coverage: total ? hits / total : 0 };
}

export function suggestChart(_headers: string[], data: any[][]): { kind: string; reason: string }[] {
  const suggestions: { kind: string; reason: string }[] = [];
  if (data.length <= 8) suggestions.push({ kind: "pie", reason: "Small categorical breakdown" });
  suggestions.push({ kind: "column", reason: "Compare values across categories" });
  suggestions.push({ kind: "bar", reason: "Compare values across categories" });
  if (data.length > 5) suggestions.push({ kind: "line", reason: "Show trend across many points" });
  suggestions.push({ kind: "scatter", reason: "Show relationship between numeric fields" });
  return suggestions;
}

export function linearForecast(y: number[], periods = 3): number[] {
  const n = y.length;
  if (n < 2) return Array(periods).fill(y[0] ?? 0);
  const xs = y.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - meanX) * (y[i] - meanY); den += (xs[i] - meanX) ** 2; }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return Array.from({ length: periods }, (_, i) => intercept + slope * (n + i));
}

export function anomalies(y: number[], threshold = 2): number[] {
  const n = y.length; if (n < 3) return [];
  const mean = y.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(y.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  if (sd === 0) return [];
  return y.map((v, i) => (Math.abs((v - mean) / sd) >= threshold ? i : -1)).filter((i) => i >= 0);
}

export function detectTrend(y: number[]): "up" | "down" | "flat" | "volatile" {
  if (y.length < 2) return "flat";
  const [a, b] = [y[0], y[y.length - 1]];
  const change = (b - a) / Math.max(1, Math.abs(a));
  const mean = y.reduce((x, y) => x + y, 0) / y.length;
  const sd = Math.sqrt(y.reduce((s, v) => s + (v - mean) ** 2, 0) / y.length);
  if (mean !== 0 && sd / Math.abs(mean) > 0.5) return "volatile";
  if (change > 0.05) return "up";
  if (change < -0.05) return "down";
  return "flat";
}

export function duplicates<T>(rows: T[], keyFn: (r: T) => string): number[] {
  const seen = new Map<string, number>();
  const dups: number[] = [];
  rows.forEach((r, i) => { const k = keyFn(r); if (seen.has(k)) dups.push(i); else seen.set(k, i); });
  return dups;
}

export function missing(rows: (string | number | undefined)[][]): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = [];
  rows.forEach((r, ri) => r.forEach((c, ci) => { if (c === undefined || c === null || c === "") out.push({ row: ri, col: ci }); }));
  return out;
}

export function checkConsistency(blocks: { kind: string; text: string }[]): string[] {
  const issues: string[] = [];
  let last = 0;
  blocks.forEach((b, i) => {
    const level = b.kind === "h1" ? 1 : b.kind === "h2" ? 2 : b.kind === "h3" ? 3 : 0;
    if (level && last && level > last + 1) issues.push(`Heading jumps from H${last} to H${level} at block ${i + 1}`);
    if (level) last = level;
    if (b.text.length > 400) issues.push(`Very long paragraph at block ${i + 1}`);
  });
  return issues;
}

export function textToTable(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const delim = lines[0].includes("\t") ? "\t" : lines[0].includes("|") ? "|" : ",";
  return lines.map((l) => l.split(delim).map((c) => c.trim()));
}

export function extractTasks(text: string): string[] {
  return text.split(/\r?\n/)
    .filter((l) => /^\s*(TODO:|-|\*|\d+\.|\[ \])/i.test(l))
    .map((l) => l.replace(/^\s*(TODO:|-|\*|\d+\.|\[ \])\s*/i, "").trim())
    .filter(Boolean);
}

const CATEGORIES: Record<string, string[]> = {
  Finance: ["revenue", "profit", "loss", "budget", "cost", "expense", "sale", "sales", "income", "invoice"],
  HR: ["employee", "hire", "resign", "salary", "leave", "team", "interview"],
  Marketing: ["campaign", "brand", "audience", "content", "seo", "ads", "engagement"],
  Product: ["feature", "bug", "release", "launch", "user", "sprint"],
  Research: ["study", "paper", "hypothesis", "result", "finding"],
};
export function categorize(text: string): string {
  const words = new Set(tokenizeWords(text));
  let best = "General", bestScore = 0;
  for (const [cat, ks] of Object.entries(CATEGORIES)) {
    const s = ks.reduce((a, k) => a + (words.has(k) ? 1 : 0), 0);
    if (s > bestScore) { best = cat; bestScore = s; }
  }
  return best;
}
