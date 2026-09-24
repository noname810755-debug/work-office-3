import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#F5F6F8",
  onSurface: "#1C1C1E",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#1C1C1E",
  surfaceTertiary: "#EFEFF4",
  onSurfaceTertiary: "#3A3A3C",
  surfaceInverse: "#1C1C1E",
  onSurfaceInverse: "#FFFFFF",
  muted: "#8E8E93",

  brand: "#FF5E00",
  onBrand: "#FFFFFF",
  brandPrimary: "#FF5E00",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#FF6600",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#FFE8D9",
  onBrandTertiary: "#B84200",

  success: "#22C55E",
  onSuccess: "#FFFFFF",
  warning: "#F59E0B",
  onWarning: "#FFFFFF",
  error: "#EF4444",
  onError: "#FFFFFF",
  info: "#3B82F6",
  onInfo: "#FFFFFF",

  border: "#E5E5EA",
  borderStrong: "#D1D1D6",
  divider: "#E5E5EA",
};

const dark: typeof light = {
  surface: "#0B0B0F",
  onSurface: "#F2F2F7",
  surfaceSecondary: "#1C1C1E",
  onSurfaceSecondary: "#F2F2F7",
  surfaceTertiary: "#2C2C2E",
  onSurfaceTertiary: "#E5E5EA",
  surfaceInverse: "#FFFFFF",
  onSurfaceInverse: "#1C1C1E",
  muted: "#8E8E93",

  brand: "#FF5E00",
  onBrand: "#FFFFFF",
  brandPrimary: "#FF6A17",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#FF7A2E",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#3A2418",
  onBrandTertiary: "#FFB893",

  success: "#22C55E",
  onSuccess: "#FFFFFF",
  warning: "#F59E0B",
  onWarning: "#1C1C1E",
  error: "#F87171",
  onError: "#FFFFFF",
  info: "#60A5FA",
  onInfo: "#FFFFFF",

  border: "#2C2C2E",
  borderStrong: "#3A3A3C",
  divider: "#2C2C2E",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light, dark };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(null);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999 };
