import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line, Polyline, Path, Circle, G, Text as SvgText } from "react-native-svg";
import { AppText } from "@/src/components/app-text";
import { useTheme } from "@/src/theme";
import type { ChartConfig, Sheet } from "@/src/storage/db";
import { parseRange, cellId, computeCell } from "@/src/sheets/formula";

type Point = { label: string; value: number };

function extractSeries(sheet: Sheet, range: string): { labels: string[]; series: number[][]; seriesNames: string[] } {
  const r = parseRange(range);
  if (!r) return { labels: [], series: [], seriesNames: [] };
  const rows: any[][] = [];
  for (let row = r.r1; row <= r.r2; row++) {
    const rowVals: any[] = [];
    for (let col = r.c1; col <= r.c2; col++) {
      const c = sheet.cells[cellId(row, col)];
      let v: any = "";
      if (c?.f) v = computeCell(sheet, cellId(row, col));
      else v = c?.v ?? "";
      rowVals.push(v);
    }
    rows.push(rowVals);
  }
  // If first row seems like header (any non-number), use as series names
  const firstRowHeader = rows.length > 1 && rows[0].some((v) => typeof v === "string" && v !== "" && isNaN(parseFloat(v)));
  const firstColHeader = rows.every((r) => typeof r[0] === "string" && r[0] !== "" && isNaN(parseFloat(r[0])));

  let dataRows = rows;
  let seriesNames: string[] = [];
  let labels: string[] = [];

  if (firstRowHeader) {
    seriesNames = rows[0].slice(firstColHeader ? 1 : 0).map((v) => String(v));
    dataRows = rows.slice(1);
  }
  if (firstColHeader) {
    labels = dataRows.map((r) => String(r[0]));
    dataRows = dataRows.map((r) => r.slice(1));
  } else {
    labels = dataRows.map((_, i) => String(i + 1));
  }
  if (!seriesNames.length) seriesNames = dataRows[0] ? dataRows[0].map((_, i) => `Series ${i + 1}`) : ["Series 1"];

  const series: number[][] = seriesNames.map((_, i) => dataRows.map((row) => {
    const v = row[i];
    if (typeof v === "number") return v;
    const n = parseFloat(String(v));
    return isNaN(n) ? 0 : n;
  }));

  return { labels, series, seriesNames };
}

const PALETTE = ["#FF5E00", "#22C55E", "#3B82F6", "#A855F7", "#EAB308", "#EC4899", "#06B6D4", "#F97316"];

export function ChartView({ chart, sheet, width = 320, height = 200 }: { chart: ChartConfig; sheet: Sheet; width?: number; height?: number }) {
  const { colors } = useTheme();
  const { labels, series, seriesNames } = extractSeries(sheet, chart.range);
  const w = chart.w ?? width, h = chart.h ?? height;
  const padL = 32, padR = 12, padT = 24, padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const values = series.flat();
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const range = max - min || 1;
  const yScale = (v: number) => padT + plotH - ((v - min) / range) * plotH;
  const xFor = (i: number, n: number) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);

  const renderBars = (horizontal = false) => {
    const groupCount = labels.length;
    const seriesCount = series.length;
    const groupSlot = plotW / Math.max(1, groupCount);
    const barW = Math.max(4, (groupSlot / Math.max(1, seriesCount)) - 2);
    return series.flatMap((s, si) => s.map((v, i) => {
      const gx = padL + i * groupSlot;
      const x = gx + si * barW;
      const y = yScale(Math.max(0, v));
      const barH = Math.abs(yScale(v) - yScale(0));
      if (horizontal) {
        const hy = padT + i * groupSlot + si * barW;
        const hx = padL;
        const hw = ((v - min) / range) * plotW;
        return <Rect key={`${si}-${i}`} x={hx} y={hy} width={Math.max(1, hw)} height={Math.max(2, barW - 2)} fill={PALETTE[si % PALETTE.length]} />;
      }
      return <Rect key={`${si}-${i}`} x={x} y={y} width={barW - 2} height={Math.max(2, barH)} fill={PALETTE[si % PALETTE.length]} />;
    }));
  };

  const renderLine = (fill = false) => series.map((s, si) => {
    const pts = s.map((v, i) => `${xFor(i, s.length)},${yScale(v)}`).join(" ");
    if (fill) {
      const path = `M ${xFor(0, s.length)},${yScale(0)} L ${pts.replace(/,/g, " ").split(" ").reduce((acc, _, idx, arr) => acc, pts)} L ${xFor(s.length - 1, s.length)},${yScale(0)} Z`;
      const d = `M ${xFor(0, s.length)} ${yScale(0)} ` + s.map((v, i) => `L ${xFor(i, s.length)} ${yScale(v)}`).join(" ") + ` L ${xFor(s.length - 1, s.length)} ${yScale(0)} Z`;
      return <G key={si}><Path d={d} fill={PALETTE[si % PALETTE.length]} opacity={0.2} /><Polyline points={pts} fill="none" stroke={PALETTE[si % PALETTE.length]} strokeWidth={2} /></G>;
    }
    return <Polyline key={si} points={pts} fill="none" stroke={PALETTE[si % PALETTE.length]} strokeWidth={2} />;
  });

  const renderScatter = () => series.flatMap((s, si) => s.map((v, i) => (
    <Circle key={`${si}-${i}`} cx={xFor(i, s.length)} cy={yScale(v)} r={4} fill={PALETTE[si % PALETTE.length]} />
  )));

  const renderPie = (doughnut = false) => {
    const s = series[0] || [];
    const total = s.reduce((a, b) => a + Math.abs(b), 0) || 1;
    const cx = padL + plotW / 2, cy = padT + plotH / 2;
    const r = Math.min(plotW, plotH) / 2 - 4;
    let start = -Math.PI / 2;
    return s.map((v, i) => {
      const angle = (Math.abs(v) / total) * 2 * Math.PI;
      const end = start + angle;
      const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
      const large = angle > Math.PI ? 1 : 0;
      const d = doughnut
        ? `M ${cx + r * 0.5 * Math.cos(start)} ${cy + r * 0.5 * Math.sin(start)} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${cx + r * 0.5 * Math.cos(end)} ${cy + r * 0.5 * Math.sin(end)} A ${r * 0.5} ${r * 0.5} 0 ${large} 0 ${cx + r * 0.5 * Math.cos(start)} ${cy + r * 0.5 * Math.sin(start)} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
      const p = <Path key={i} d={d} fill={PALETTE[i % PALETTE.length]} />;
      start = end;
      return p;
    });
  };

  const axisLabels = () => (
    <G>
      <Line x1={padL} y1={yScale(0)} x2={padL + plotW} y2={yScale(0)} stroke={colors.border} strokeWidth={1} />
      <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke={colors.border} strokeWidth={1} />
      {labels.map((lb, i) => (
        <SvgText key={i} x={xFor(i, labels.length)} y={padT + plotH + 16} fontSize={9} fill={colors.muted} textAnchor="middle">{lb}</SvgText>
      ))}
      <SvgText x={padL - 6} y={padT + 8} fontSize={9} fill={colors.muted} textAnchor="end">{max.toFixed(0)}</SvgText>
      <SvgText x={padL - 6} y={yScale(min)} fontSize={9} fill={colors.muted} textAnchor="end">{min.toFixed(0)}</SvgText>
    </G>
  );

  return (
    <View style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary, width: w, height: h + 40 }]} testID={`chart-view-${chart.id}`}>
      <AppText variant="label" style={{ marginBottom: 4 }}>{chart.title}</AppText>
      <Svg width={w} height={h}>
        {chart.kind === "pie" || chart.kind === "doughnut" ? null : axisLabels()}
        {chart.kind === "bar" ? renderBars(true) : null}
        {chart.kind === "column" ? renderBars(false) : null}
        {chart.kind === "line" ? renderLine(false) : null}
        {chart.kind === "area" ? renderLine(true) : null}
        {chart.kind === "scatter" ? renderScatter() : null}
        {chart.kind === "pie" ? renderPie(false) : null}
        {chart.kind === "doughnut" ? renderPie(true) : null}
        {chart.kind === "combo" ? [renderBars(false), renderLine(false)] : null}
      </Svg>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
        {seriesNames.map((n, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 10, height: 10, backgroundColor: PALETTE[i % PALETTE.length], borderRadius: 2 }} />
            <AppText variant="caption">{n}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 12, padding: 10 },
});
