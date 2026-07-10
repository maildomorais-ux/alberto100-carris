import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

type Episode = {
  id: string;
  number: number;
  title_pt: string;
  title_en: string;
  subtitle_pt?: string | null;
  subtitle_en?: string | null;
  duration: string;
  cover_photo?: string | null;
  video_url?: string | null;
  status: string;
};

const API = process.env.EXPO_PUBLIC_BACKEND_URL || "";

function resolveUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  return /^https?:\/\//.test(u) ? u : `${API}${u}`;
}

export default function Videos() {
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch("/api/episodes");
      setEpisodes(await r.json());
    } catch { setEpisodes([]); }
    finally { setLoading(false); }
  }, [apiFetch]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.container}>
      <ScreenHeader title={t(lang, "videos_title")} showBack />
      <FlatList
        data={episodes}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100, gap: spacing.lg }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} />
          ) : (
            <Text style={styles.empty}>
              {lang === "pt" ? "Ainda sem episódios publicados." : "No published episodes yet."}
            </Text>
          )
        }
        renderItem={({ item }) => {
          const title = lang === "pt" ? item.title_pt : item.title_en;
          const subtitle = lang === "pt" ? item.subtitle_pt : item.subtitle_en;
          const cover = resolveUrl(item.cover_photo);
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/episode/${item.id}`)} testID={`video-${item.number}`}>
              {cover ? <Image source={{ uri: cover }} style={styles.thumb} /> : <View style={[styles.thumb, styles.thumbEmpty]} />}
              <View style={styles.playBadge}><Feather name="play" size={20} color={colors.surface} /></View>
              <View style={styles.body}>
                <Text style={styles.duration}>{item.duration || "—"}</Text>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
            </Pressable>
          );
        }}
      />
      {token && (
        <Pressable style={styles.fab} onPress={() => router.push("/admin/episodes")} testID="episodes-admin-fab">
          <Feather name="settings" size={20} color={colors.surface} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  card: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  thumb: { width: "100%", height: 200 },
  thumbEmpty: { backgroundColor: colors.surfaceTertiary },
  playBadge: { position: "absolute", left: 14, top: 14, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  body: { padding: spacing.lg },
  duration: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.xl, marginTop: 4 },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: 13, marginTop: 4, fontStyle: "italic" },
  empty: { textAlign: "center", padding: spacing.xxxl, color: colors.onSurfaceTertiary, fontFamily: fonts.display, fontStyle: "italic" },
  fab: { position: "absolute", right: spacing.xl, bottom: 24, width: 52, height: 52, borderRadius: 26, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", elevation: 6 },
});
