import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

type Stats = {
  km_traveled: number;
  days: number;
  countries_visited: number;
  cities_visited: number;
  trains_used: number;
  hours_traveling: number;
};

export default function More() {
  const { lang, token, logout, apiFetch } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const r = await apiFetch("/api/stats");
      setStats(await r.json());
    } catch {}
  }, [apiFetch]);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));
  useEffect(() => { loadStats(); }, [loadStats]);

  const menu = [
    { key: "history", icon: "book", label: t(lang, "more_history"), onPress: () => router.push("/history") },
    { key: "gallery", icon: "image", label: t(lang, "more_gallery"), onPress: () => router.push("/gallery") },
    { key: "videos", icon: "video", label: t(lang, "more_videos"), onPress: () => router.push("/videos") },
    { key: "equipment", icon: "package", label: t(lang, "more_equipment"), onPress: () => router.push("/equipment") },
    { key: "about", icon: "user", label: t(lang, "more_about"), onPress: () => router.push("/about") },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title={t(lang, "tab_more")} />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsBlock}>
          <Text style={styles.sectionTitle}>{t(lang, "stats_title")}</Text>
          <View style={styles.statsGrid}>
            <StatTile big value={stats?.km_traveled ?? 0} label={t(lang, "stats_km")} testID="stat-km" />
            <StatTile value={stats?.days ?? 0} label={t(lang, "stats_days")} testID="stat-days" />
            <StatTile value={stats?.countries_visited ?? 0} label={t(lang, "stats_countries")} testID="stat-countries" />
            <StatTile value={stats?.cities_visited ?? 0} label={t(lang, "stats_cities")} testID="stat-cities" />
            <StatTile value={stats?.trains_used ?? 0} label={t(lang, "stats_trains")} testID="stat-trains" />
            <StatTile value={stats?.hours_traveling ?? 0} label={t(lang, "stats_hours")} testID="stat-hours" />
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuBlock}>
          {menu.map((m) => (
            <Pressable key={m.key} onPress={m.onPress} style={styles.menuRow} testID={`menu-${m.key}`}>
              <View style={styles.menuIcon}>
                <Feather name={m.icon as any} size={18} color={colors.brand} />
              </View>
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Feather name="chevron-right" size={18} color={colors.onSurfaceTertiary} />
            </Pressable>
          ))}

          {/* Auth */}
          {!token ? (
            <Pressable onPress={() => router.push("/login")} style={styles.menuRow} testID="menu-login">
              <View style={styles.menuIcon}>
                <Feather name="lock" size={18} color={colors.brand} />
              </View>
              <Text style={styles.menuLabel}>{t(lang, "more_login")}</Text>
              <Feather name="chevron-right" size={18} color={colors.onSurfaceTertiary} />
            </Pressable>
          ) : (
            <Pressable onPress={logout} style={styles.menuRow} testID="menu-logout">
              <View style={styles.menuIcon}>
                <Feather name="log-out" size={18} color={colors.error} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.error }]}>{t(lang, "more_logout")}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({ value, label, big, testID }: { value: number; label: string; big?: boolean; testID?: string }) {
  return (
    <View style={[styles.tile, big && styles.tileBig]} testID={testID}>
      <Text style={[styles.tileValue, big && styles.tileValueBig]}>
        {Number(value).toLocaleString("pt-PT")}
      </Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  statsBlock: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display, letterSpacing: 0.5, marginBottom: spacing.lg },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  tile: {
    flexBasis: "47%", flexGrow: 1, padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  tileBig: { flexBasis: "100%", paddingVertical: spacing.xl },
  tileValue: { color: colors.brand, fontFamily: fonts.display, fontSize: 32, letterSpacing: 0.5 },
  tileValueBig: { fontSize: 52 },
  tileLabel: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 },
  menuBlock: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl },
  menuRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.lg,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  menuIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, color: colors.onSurface, fontFamily: fonts.body, fontSize: type.lg },
});
