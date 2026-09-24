import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useTheme } from "@/src/theme";

type Variant = "h1" | "h2" | "h3" | "title" | "body" | "muted" | "caption" | "label" | "button";

export function AppText({ variant = "body", style, color, ...rest }: TextProps & { variant?: Variant; color?: string }) {
  const { colors } = useTheme();
  const base: any = {
    h1: { fontSize: 32, fontWeight: "800", color: colors.onSurface },
    h2: { fontSize: 24, fontWeight: "700", color: colors.onSurface },
    h3: { fontSize: 18, fontWeight: "700", color: colors.onSurface },
    title: { fontSize: 16, fontWeight: "600", color: colors.onSurface },
    body: { fontSize: 15, fontWeight: "400", color: colors.onSurface },
    muted: { fontSize: 13, fontWeight: "400", color: colors.muted },
    caption: { fontSize: 12, fontWeight: "500", color: colors.muted },
    label: { fontSize: 13, fontWeight: "600", color: colors.onSurface },
    button: { fontSize: 15, fontWeight: "600", color: colors.onBrandPrimary },
  }[variant];
  return <Text {...rest} style={StyleSheet.flatten([base, color ? { color } : null, style])} />;
}
