import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts, radius, spacing } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";

export default function LanguageToggle() {
  const { lang, setLang } = useApp();
  const choose = (l: "pt" | "en") => {
    Haptics.selectionAsync();
    setLang(l);
  };
  return (
    <View style={styles.wrap} testID="language-toggle">
      <Pressable
        onPress={() => choose("pt")}
        style={[styles.pill, lang === "pt" && styles.pillActive]}
        testID="language-pt"
      >
        <Text style={[styles.label, lang === "pt" && styles.labelActive]}>PT</Text>
      </Pressable>
      <Pressable
        onPress={() => choose("en")}
        style={[styles.pill, lang === "en" && styles.pillActive]}
        testID="language-en"
      >
        <Text style={[styles.label, lang === "en" && styles.labelActive]}>EN</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "rgba(5,11,20,0.55)",
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pillActive: { backgroundColor: colors.brand },
  label: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
  },
  labelActive: { color: colors.surface },
});
