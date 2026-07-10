import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import ScreenHeader from "@/src/components/ScreenHeader";

type Episode = { id: string; number: number; title_pt: string; title_en: string; status: string; duration: string };

export default function AdminEpisodes() {
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch("/api/episodes/all");
      setEpisodes(await r.json());
    } finally { setLoading(false); }
  }, [apiFetch]);
  useEffect(() => { load(); }, [load]);

  if (!token) return <Redirect href="/login" />;

  const createNew = async () => {
    const next = (episodes.reduce((m, e) => Math.max(m, e.number), 0) || 0) + 1;
    const r = await apiFetch("/api/episodes", {
      method: "POST",
      body: JSON.stringify({
        number: next,
        title_pt: `Episódio ${String(next).padStart(2, "0")}`,
        title_en: `Episode ${String(next).padStart(2, "0")}`,
        status: "draft",
      }),
    });
    if (r.ok) {
      const created = await r.json();
      router.push(`/admin/episodes/${created.id}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={lang === "pt" ? "Episódios" : "Episodes"} showBack />
      <View style={styles.intro}>
        <Text style={styles.title}>{lang === "pt" ? "Episódios" : "Episodes"}</Text>
        <Text style={styles.subtitle}>
          {lang === "pt"
            ? "Toque num episódio para editar. Novos episódios ficam automaticamente na lista pública quando publicados."
            : "Tap an episode to edit. New episodes appear in the public list once published."}
        </Text>
      </View>
      <FlatList
        data={episodes}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 120 }}
        ListEmptyComponent={loading ? <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} /> : null}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/admin/episodes/${item.id}`)} testID={`admin-episode-${item.id}`}>
            <View style={styles.numBadge}><Text style={styles.numText}>{String(item.number).padStart(2, "0")}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>{lang === "pt" ? item.title_pt : item.title_en}</Text>
              <View style={styles.rowMeta}>
                <Text style={[styles.badge, item.status === "published" ? styles.badgePub : styles.badgeDraft]}>
                  {item.status === "published" ? (lang === "pt" ? "PUBLICADO" : "PUBLISHED") : (lang === "pt" ? "RASCUNHO" : "DRAFT")}
                </Text>
                {item.duration ? <Text style={styles.dur}>{item.duration}</Text> : null}
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.onSurfaceTertiary} />
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={createNew} testID="new-episode-fab">
        <Feather name="plus" size={22} color={colors.surface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  intro: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: 13, marginTop: 4, lineHeight: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  numBadge: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  numText: { color: colors.brand, fontFamily: fonts.display, fontSize: 15, letterSpacing: 1 },
  rowTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 15 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 3 },
  badge: { fontFamily: fonts.body, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  badgePub: { color: colors.brand, backgroundColor: "rgba(230,195,101,0.15)" },
  badgeDraft: { color: colors.onSurfaceTertiary, backgroundColor: colors.surfaceTertiary },
  dur: { color: colors.onSurfaceTertiary, fontFamily: fonts.body, fontSize: 11 },
  fab: { position: "absolute", right: spacing.xl, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", elevation: 6 },
});
