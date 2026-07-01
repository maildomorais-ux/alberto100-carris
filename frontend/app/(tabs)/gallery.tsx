import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import ScreenHeader from "@/src/components/ScreenHeader";
import { COUNTRIES } from "@/src/data/countries";

type Place = { id: string; city: string; country_code: string; photos: string[]; video_url?: string };

const API = process.env.EXPO_PUBLIC_BACKEND_URL || "";

export default function Gallery() {
  const { lang, apiFetch } = useApp();
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch("/api/places");
      setPlaces(await r.json());
    } catch {}
  }, [apiFetch]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [load]);

  // Build flat gallery: every photo + fallback country image if no photo
  const items: { placeId: string; city: string; flag?: string; photo: string; hasVideo?: boolean }[] = [];
  for (const p of places) {
    const country = COUNTRIES.find((c) => c.code === p.country_code);
    if (p.photos && p.photos.length > 0) {
      p.photos.forEach((ph, i) => {
        const url = /^https?:\/\//.test(ph) ? ph : `${API}${ph}`;
        items.push({ placeId: p.id, city: p.city, flag: country?.flag, photo: url, hasVideo: i === 0 && !!p.video_url });
      });
    } else if (country?.image) {
      items.push({ placeId: p.id, city: p.city, flag: country.flag, photo: country.image, hasVideo: !!p.video_url });
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={lang === "pt" ? "Galeria" : "Gallery"} />
      <View style={styles.intro}>
        <Text style={styles.title}>{lang === "pt" ? "Fotografias & vídeos" : "Photos & videos"}</Text>
        <Text style={styles.sub}>{lang === "pt" ? "Toda a viagem em imagens." : "The whole journey in pictures."}</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(_, i) => `g-${i}`}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 140, gap: spacing.sm }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {lang === "pt" ? "Ainda sem fotografias. A viagem está a começar." : "No photos yet. The journey is starting."}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.cell} onPress={() => router.push(`/place/${item.placeId}`)} testID={`gallery-${item.placeId}`}>
            <Image source={{ uri: item.photo }} style={styles.img} />
            <View style={styles.overlay}>
              <Text style={styles.city} numberOfLines={1}>{item.flag ? `${item.flag}  ` : ""}{item.city}</Text>
            </View>
            {item.hasVideo && (
              <View style={styles.videoBadge}><Feather name="play" size={10} color={colors.surface} /></View>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  intro: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display },
  sub: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.base, marginTop: 4, fontStyle: "italic" },
  cell: { flex: 1, aspectRatio: 1, borderRadius: radius.sm, overflow: "hidden", marginBottom: 0 },
  img: { width: "100%", height: "100%" },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.sm, backgroundColor: "rgba(5,11,20,0.7)" },
  city: { color: colors.onSurface, fontFamily: fonts.display, fontSize: 13 },
  videoBadge: { position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  empty: { color: colors.onSurfaceTertiary, textAlign: "center", padding: spacing.xxxl, fontFamily: fonts.display, fontStyle: "italic" },
});
