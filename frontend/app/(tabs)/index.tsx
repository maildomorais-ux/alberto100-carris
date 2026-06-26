import React from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import LanguageToggle from "@/src/components/LanguageToggle";
import SocialButtons from "@/src/components/SocialButtons";
import Footer from "@/src/components/Footer";

// Travessia cinematográfica — comboio em paisagem dramática (Lagos → Singapura)
const HERO = "https://images.unsplash.com/photo-1581262208435-41726149a759?w=1600";
const STORY_IMG = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600";
const WHY_IMG = "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1600";

export default function Home() {
  const router = useRouter();
  const { lang } = useApp();
  const insets = useSafeAreaInsets();

  const startJourney = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/route");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* HERO */}
      <ImageBackground source={{ uri: HERO }} style={styles.hero} resizeMode="cover">
        <LinearGradient
          colors={["rgba(5,11,20,0.55)", "rgba(5,11,20,0.2)", "rgba(5,11,20,0.95)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.heroTop, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.brandMark}>
            <Text style={styles.brandText}>A · 100</Text>
          </View>
          <View style={styles.heroTopRight}>
            <SocialButtons />
            <LanguageToggle />
          </View>
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.eyebrow}>{lang === "pt" ? "UMA VIAGEM COM SONHOS" : "A JOURNEY MADE OF DREAMS"}</Text>
          <Text
            style={styles.heroTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            testID="hero-title"
          >
            {t(lang, "app_title")}
          </Text>
          <View style={styles.heroRule} />
          <Text style={styles.heroLine}>{t(lang, "app_subtitle_1")}</Text>
          <Text style={styles.heroLineSoft}>{t(lang, "app_subtitle_2")}</Text>
          <Text style={styles.heroLineSoft}>{t(lang, "app_subtitle_3")}</Text>
          <Pressable onPress={startJourney} style={styles.cta} testID="cta-start-journey">
            <Text style={styles.ctaText}>{t(lang, "cta_start")}</Text>
            <Feather name="arrow-right" size={16} color={colors.surface} />
          </Pressable>
        </View>
      </ImageBackground>

      {/* HISTORY */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>I.</Text>
        <Text style={styles.sectionTitle}>{t(lang, "history_title")}</Text>
        <View style={styles.divider} />
        <Text style={styles.body}>{t(lang, "history_p1")}</Text>
        <ImageBackground source={{ uri: STORY_IMG }} style={styles.storyImage} imageStyle={{ borderRadius: radius.md }}>
          <LinearGradient colors={["transparent", "rgba(5,11,20,0.6)"]} style={StyleSheet.absoluteFill} />
        </ImageBackground>
        <Text style={styles.body}>{t(lang, "history_p2")}</Text>
        <Text style={styles.bodyEm}>{t(lang, "history_p3")}</Text>
      </View>

      {/* WHY */}
      <ImageBackground source={{ uri: WHY_IMG }} style={styles.whyHero}>
        <LinearGradient colors={["rgba(5,11,20,0.85)", "rgba(5,11,20,0.9)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.whyContent}>
          <Text style={styles.sectionEyebrow}>II.</Text>
          <Text style={styles.sectionTitle}>{t(lang, "why_title")}</Text>
          <View style={styles.divider} />
          <Text style={styles.bodyLarge}>{t(lang, "why_body")}</Text>
        </View>
      </ImageBackground>

      {/* QUICK NAV */}
      <View style={styles.quickNav}>
        <NavCard icon="map" label={t(lang, "tab_route")} onPress={() => router.push("/(tabs)/route")} testID="nav-route" />
        <NavCard icon="book-open" label={t(lang, "tab_diary")} onPress={() => router.push("/(tabs)/diary")} testID="nav-diary" />
        <NavCard icon="bar-chart-2" label={t(lang, "stats_title")} onPress={() => router.push("/(tabs)/more")} testID="nav-stats" />
        <NavCard icon="user" label={t(lang, "more_about")} onPress={() => router.push("/about")} testID="nav-about" />
      </View>

      <Footer />
    </ScrollView>
  );
}

function NavCard({ icon, label, onPress, testID }: { icon: any; label: string; onPress: () => void; testID: string }) {
  return (
    <Pressable onPress={onPress} style={styles.navCard} testID={testID}>
      <Feather name={icon} size={22} color={colors.brand} />
      <Text style={styles.navLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { width: "100%", minHeight: 640 },
  heroTop: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  heroTopRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.brand, borderRadius: 4 },
  brandText: { color: colors.brand, fontFamily: fonts.display, fontSize: 12, letterSpacing: 2 },
  heroContent: { flex: 1, justifyContent: "flex-end", paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  eyebrow: {
    color: colors.brand, fontFamily: fonts.body, letterSpacing: 4,
    fontSize: 11, fontWeight: "600", marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.onSurface, fontFamily: fonts.display, fontSize: 34,
    lineHeight: 40, letterSpacing: 0.3,
  },
  heroRule: { width: 48, height: 2, backgroundColor: colors.brand, marginVertical: spacing.lg },
  heroLine: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.xxl, marginBottom: 4, letterSpacing: 0.4 },
  heroLineSoft: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.base, marginBottom: 2, lineHeight: 22 },
  cta: {
    marginTop: spacing.xl, alignSelf: "flex-start",
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.brand, paddingHorizontal: spacing.xl, paddingVertical: 14,
    borderRadius: radius.pill,
  },
  ctaText: { color: colors.surface, fontFamily: fonts.body, fontSize: 14, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xl },
  sectionEyebrow: { color: colors.brand, fontFamily: fonts.display, fontSize: type.xl, letterSpacing: 4, marginBottom: spacing.sm },
  sectionTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display, letterSpacing: 0.5 },
  divider: { width: 36, height: 1.5, backgroundColor: colors.brand, marginVertical: spacing.lg },
  body: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.lg, lineHeight: 26, marginBottom: spacing.lg },
  bodyEm: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.xl, lineHeight: 30, fontStyle: "italic" },
  bodyLarge: { color: colors.onSurface, fontFamily: fonts.body, fontSize: type.lg, lineHeight: 28 },
  storyImage: { width: "100%", height: 220, marginBottom: spacing.lg, borderRadius: radius.md, overflow: "hidden" },
  whyHero: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  whyContent: {},
  quickNav: {
    flexDirection: "row", flexWrap: "wrap", gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingTop: spacing.xl,
  },
  navCard: {
    flexBasis: "47%", flexGrow: 1, paddingVertical: spacing.xl,
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    alignItems: "center", gap: spacing.sm,
  },
  navLabel: { color: colors.onSurface, fontFamily: fonts.body, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" },
});
