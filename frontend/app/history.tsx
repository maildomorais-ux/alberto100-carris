import React from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

export default function History() {
  const { lang } = useApp();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: "https://images.pexels.com/photos/11461447/pexels-photo-11461447.jpeg?w=1600" }} style={styles.hero}>
          <LinearGradient colors={["rgba(5,11,20,0.5)", "rgba(5,11,20,0)", "rgba(5,11,20,0.98)"]} style={StyleSheet.absoluteFill} />
          <ScreenHeader transparent showBack />
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>I.</Text>
            <Text style={styles.title}>{t(lang, "history_title")}</Text>
            <View style={styles.rule} />
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <Text style={styles.p}>{t(lang, "history_p1")}</Text>
          <Text style={styles.p}>{t(lang, "history_p2")}</Text>
          <Text style={styles.pEm}>{t(lang, "history_p3")}</Text>

          <View style={styles.sep} />

          <Text style={styles.eyebrow}>II.</Text>
          <Text style={styles.title2}>{t(lang, "why_title")}</Text>
          <View style={styles.rule} />
          <Text style={styles.p}>{t(lang, "why_body")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 360 },
  heroContent: { flex: 1, justifyContent: "flex-end", padding: spacing.xl },
  eyebrow: { color: colors.brand, fontFamily: fonts.display, fontSize: type.xl, letterSpacing: 4 },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.hero, marginTop: spacing.sm },
  title2: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display, marginTop: spacing.sm },
  rule: { width: 48, height: 2, backgroundColor: colors.brand, marginVertical: spacing.lg },
  body: { padding: spacing.xl },
  p: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.lg, lineHeight: 28, marginBottom: spacing.lg },
  pEm: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.xl, lineHeight: 30, fontStyle: "italic", marginBottom: spacing.lg },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xxl },
});
