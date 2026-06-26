import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import { COUNTRIES } from "@/src/data/countries";
import ScreenHeader from "@/src/components/ScreenHeader";

type Place = { id: string; country_code: string; city: string; photos: string[]; video_url?: string | null };

export default function AdminPanel() {
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch("/api/places");
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
          return (
            <Pressable style={styles.row} onPress={() => router.push(`/admin/place/${item.id}`)} testID={`admin-place-${item.id}`}>
              <Text style={styles.flag}>{country?.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.city}>{item.city}</Text>
                <Text style={styles.meta}>
                  {item.photos.length} {lang === "pt" ? "fotos" : "photos"}
                  {item.video_url ? `  ·  ${lang === "pt" ? "vídeo" : "video"}` : ""}
                </Text>
              </View>
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
  meta: { color: colors.onSurfaceTertiary, fontFamily: fonts.body, fontSize: 11, marginTop: 3, letterSpacing: 1, textTransform: "uppercase" },
});
