import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import { COUNTRIES } from "@/src/data/countries";
import ScreenHeader from "@/src/components/ScreenHeader";

type Place = { id: string; country_code: string; city: string; photos: string[]; video_url?: string | null; status?: string };

export default function AdminPanel() {
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch("/api/places/all");
      setPlaces(await r.json());
    } finally { setLoading(false); }
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  if (!token) return <Redirect href="/login" />;

  return (
    <View style={styles.container}>
      <ScreenHeader title={lang === "pt" ? "Administração" : "Admin"} showBack />
      <View style={styles.intro}>
        <Text style={styles.title}>{lang === "pt" ? "Cidades" : "Cities"}</Text>
        <Text style={styles.subtitle}>{lang === "pt"
          ? "Toque numa cidade para adicionar fotografias, vídeo, descrição e a sua experiência."
          : "Tap a city to add photos, video, description and your experience."}</Text>
      </View>
      <FlatList
        data={places}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 140 }}
        ListEmptyComponent={loading ? <ActivityIndicator color={colors.brand} style={{ marginTop: 40 }} /> : null}
        renderItem={({ item }) => {
          const country = COUNTRIES.find((c) => c.code === item.country_code);
          const isDraft = item.status === "draft";
          const move = async (dir: -1 | 1) => {
            const idx = places.findIndex((p) => p.id === item.id);
            const swap = places[idx + dir];
            if (!swap) return;
            const newOrder = [...places];
            newOrder[idx] = swap; newOrder[idx + dir] = item;
            setPlaces(newOrder);
            await apiFetch("/api/places/reorder", {
              method: "POST",
              body: JSON.stringify({ ids: newOrder.map((p) => p.id) }),
            });
          };
          return (
            <Pressable style={styles.row} onPress={() => router.push(`/admin/place/${item.id}`)} testID={`admin-place-${item.id}`}>
              <Text style={styles.flag}>{country?.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.city}>{item.city}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <Text style={[styles.pill, isDraft ? styles.pillDraft : styles.pillPub]}>
                    {isDraft ? (lang === "pt" ? "RASCUNHO" : "DRAFT") : (lang === "pt" ? "PUBLICADO" : "PUBLISHED")}
                  </Text>
                  <Text style={styles.meta}>
                    {item.photos.length} {lang === "pt" ? "fotos" : "photos"}
                    {item.video_url ? `  ·  ${lang === "pt" ? "vídeo" : "video"}` : ""}
                  </Text>
                </View>
              </View>
              <Pressable onPress={(e) => { e.stopPropagation(); move(-1); }} hitSlop={8} style={styles.arrow}><Feather name="chevron-up" size={16} color={colors.onSurfaceTertiary} /></Pressable>
              <Pressable onPress={(e) => { e.stopPropagation(); move(1); }} hitSlop={8} style={styles.arrow}><Feather name="chevron-down" size={16} color={colors.onSurfaceTertiary} /></Pressable>
              <Feather name="chevron-right" size={18} color={colors.onSurfaceTertiary} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  intro: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.base, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  flag: { fontSize: 28 },
  city: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.lg },
  meta: { color: colors.onSurfaceTertiary, fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
  pill: { fontFamily: fonts.body, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  pillPub: { color: colors.brand, backgroundColor: "rgba(230,195,101,0.15)" },
  pillDraft: { color: colors.onSurfaceTertiary, backgroundColor: colors.surfaceTertiary },
  arrow: { padding: 6 },
});
