import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, spacing } from "@/src/theme";
import SocialButtons from "./SocialButtons";

export default function Footer() {
  return (
    <View style={styles.wrap} testID="site-footer">
      <View style={styles.rule} />
      <Text style={styles.tagline}>Alberto 100 Carris</Text>
      <Text style={styles.sub}>Lagos → Singapura · por carril</Text>
      <View style={{ marginTop: spacing.lg }}>
        <SocialButtons variant="footer" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center", paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl,
  },
  rule: { width: 36, height: 1, backgroundColor: colors.brand, marginBottom: spacing.lg },
  tagline: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 20, letterSpacing: 0.5 },
  sub: { color: colors.onSurfaceTertiary, fontFamily: fonts.body, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 },
});
