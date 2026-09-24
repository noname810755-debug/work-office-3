import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Rect, Circle, Polygon } from "react-native-svg";
import { AppText } from "./app-text";
import type { Slide, SlideElement, SlideTheme } from "@/src/storage/db";

const CANVAS_W = 720;
const CANVAS_H = 405;

export function SlideView({ slide, theme, width, height, selectedId, onSelectEl, onEditText, interactive = true }: {
  slide: Slide; theme: SlideTheme; width: number; height: number;
  selectedId?: string | null; onSelectEl?: (id: string | null) => void; onEditText?: (id: string, text: string) => void;
  interactive?: boolean;
}) {
  const sx = width / CANVAS_W;
  const sy = height / CANVAS_H;
  return (
    <View style={[styles.slide, { width, height, backgroundColor: slide.bg }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {slide.elements.filter((e) => e.kind === "shape").map((e) => {
          if (e.kind !== "shape") return null;
          if (e.shape === "circle") return <Circle key={e.id} cx={(e.x + e.w / 2) * sx} cy={(e.y + e.h / 2) * sy} r={Math.min(e.w, e.h) / 2 * Math.min(sx, sy)} fill={e.fill} stroke={e.stroke} />;
          if (e.shape === "triangle") return <Polygon key={e.id} points={`${e.x * sx},${(e.y + e.h) * sy} ${(e.x + e.w / 2) * sx},${e.y * sy} ${(e.x + e.w) * sx},${(e.y + e.h) * sy}`} fill={e.fill} />;
          return <Rect key={e.id} x={e.x * sx} y={e.y * sy} width={e.w * sx} height={e.h * sy} fill={e.fill} stroke={e.stroke} strokeWidth={e.stroke ? 1 : 0} />;
        })}
      </Svg>
      {slide.elements.filter((e) => e.kind === "text").map((e) => {
        if (e.kind !== "text") return null;
        const isSel = selectedId === e.id;
        return (
          <TouchableOpacity
            key={e.id}
            activeOpacity={interactive ? 0.7 : 1}
            onPress={() => interactive && onSelectEl?.(e.id)}
            style={{
              position: "absolute", left: e.x * sx, top: e.y * sy, width: e.w * sx, height: e.h * sy,
              padding: 2 * sx,
              borderWidth: isSel ? 1 : 0, borderColor: theme.primary, borderStyle: "dashed",
            }}
            testID={`el-${e.id}`}
          >
            <AppText
              style={{
                fontSize: Math.max(6, e.fontSize * Math.min(sx, sy)),
                fontWeight: e.bold ? "700" : "400",
                fontStyle: e.italic ? "italic" : "normal",
                color: e.color || theme.text,
                textAlign: (e.align || "left") as any,
              }}
              numberOfLines={0}
            >
              {e.text}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { overflow: "hidden", borderRadius: 4 },
});
