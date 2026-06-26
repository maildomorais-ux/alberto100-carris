import { Platform } from "react-native";

export const colors = {
  surface: "#050B14",
  surfaceSecondary: "#0E1A34",
  surfaceTertiary: "#172A52",
  border: "#172A52",
  borderStrong: "#283C66",
  onSurface: "#FFFFFF",
  onSurfaceSecondary: "#B3C0D6",
  onSurfaceTertiary: "#8A9BB8",
  brand: "#E6C365",
  brandSoft: "#D4AF37",
  brandDeep: "#283C66",
  success: "#2D6A4F",
  error: "#C0504D",
  glass: "rgba(14,26,52,0.55)",
  glassStrong: "rgba(5,11,20,0.78)",
  scrim: "rgba(5,11,20,0.85)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = { sm: 6, md: 12, lg: 20, pill: 999 };

export const fonts = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" })!,
  body: Platform.select({ ios: "Helvetica Neue", android: "sans-serif", default: "Helvetica" })!,
};

export const type = {
  xs: 11,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  display: 32,
  hero: 44,
};
