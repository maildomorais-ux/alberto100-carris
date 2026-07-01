import React, { useCallback, useEffect, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

type Stats = {
  km_traveled: number; days: number; countries_visited: number;
  cities_visited: number; trains_used: number; hours_traveling: number;
};

const ABOUT_PT = "Esta viagem nasceu de um sonho antigo: atravessar continentes por carris, desde Portugal até à Ásia. O projeto Alberto 100 Carris acompanha esta travessia de Lagos a Singapura, cidade a cidade, comboio a comboio, memória a memória.";
const ABOUT_EN = "This journey was born of an old dream: to cross continents by rail, from Portugal all the way to Asia. The Alberto 100 Carris project follows this crossing from Lagos to Singapore, city by city, train by train, memory by memory.";

export default function About() {
  const { lang, token, logout, apiFetch } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = useCallback(async () => {
    try { const r = await apiFetch("/api/stats"); setStats(await r.json()); } catch {}
  }, [apiFetch]);
  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));
  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1600" }}
          style={styles.hero}
        >
          <LinearGradient colors={["rgba(5,11,20,0.4)", "rgba(5,11,20,0)", "rgba(5,11,20,0.98)"]} style={StyleSheet.absoluteFill} />
          <ScreenHeader transparent title="" />
          <View style={styles.heroBody}>
            <Text style={styles.eyebrow}>{lang === "pt" ? "SOBRE A VIAGEM" : "ABOUT THE JOURNEY"}</Text>
            <Text style={styles.title}>Alberto 100 Carris</Text>
            <View style={styles.rule} />
          </View>
        </ImageBackground>

        <View style={styles.section}>
          <Text style={styles.body}>{lang === "pt" ? ABOUT_PT : ABOUT_EN}</Text>
        </View>

        <View style={styles.statsBlock}>
          <Text style={styles.label}>{t(lang, "stats_title")}</Text>
          <View style={styles.statsGrid}>
            <StatTile big value={stats?.km_traveled ?? 0} label={t(lang, "stats_km")} />
            <StatTile value={stats?.countries_visited ?? 0} label={t(lang, "stats_countries")} />
            <StatTile value={stats?.cities_visited ?? 0} label={t(lang, "stats_cities")} />
            <StatTile value={stats?.trains_used ?? 0} label={t(lang, "stats_trains")} />
            <StatTile value={stats?.hours_traveling ?? 0} label={t(lang, "stats_hours")} />
          </View>
        </View>

        <View style={styles.menu}>
          <MenuItem icon="book" label={t(lang, "more_history")} onPress={() => router.push("/history")} testID="menu-history" />
          <MenuItem icon="video" label={t(lang, "more_videos")} onPress={() => router.push("/videos")} testID="menu-videos" />
          <MenuItem icon="package" label={t(lang, "more_equipment")} onPress={() => router.push("/equipment")} testID="menu-equipment" />
          {!token ? (
            <MenuItem icon="lock" label={t(lang, "more_login")} onPress={() => router.push("/login")} testID="menu-login" />
          ) : (
            <>
              <MenuItem icon="settings" label={lang === "pt" ? "Administração" : "Admin"} onPress={() => router.push("/admin")} testID="menu-admin" />
              <MenuItem icon="log-out" label={t(lang, "more_logout")} onPress={logout} danger testID="menu-logout" />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({ value, label, big }: { value: number; label: string; big?: boolean }) {
  return (
    <View style={[styles.tile, big && styles.tileBig]}>
      <Text style={[styles.tileValue, big && styles.tileValueBig]}>{Number(value).toLocaleString("pt-PT")}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress, danger, testID }: any) {
  return (
    <Pressable onPress={onPress} style={styles.row} testID={testID}>
      <View style={styles.menuIcon}><Feather name={icon} size={16} color={danger ? colors.error : colors.brand} /></View>
      <Text style={[styles.menuLabel, danger && { color: colors.error }]}>{label}</Text>
      {!danger && <Feather name="chevron-right" size={16} color={colors.onSurfaceTertiary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 320 },
  heroBody: { flex: 1, justifyContent: "flex-end", padding: spacing.xl },
  eyebrow: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 3, textTransform: "uppercase" },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display, marginTop: 4 },
  rule: { width: 44, height: 2, backgroundColor: colors.brand, marginTop: spacing.md },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  body: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.lg, lineHeight: 28 },
  statsBlock: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl },
  label: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: spacing.md },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tile: { flexBasis: "48%", flexGrow: 1, padding: spacing.lg, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  tileBig: { flexBasis: "100%" },
  tileValue: { color: colors.brand, fontFamily: fonts.display, fontSize: 28 },
  tileValueBig: { fontSize: 48 },
  tileLabel: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 2 },
  menu: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  menuIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, color: colors.onSurface, fontFamily: fonts.body, fontSize: type.base },
});
