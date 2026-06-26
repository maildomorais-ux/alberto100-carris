import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, ImageBackground, Pressable, ScrollView, Share, StyleSheet, Text, View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import { COUNTRIES } from "@/src/data/countries";
import ScreenHeader from "@/src/components/ScreenHeader";
import VideoPlayer from "@/src/components/VideoPlayer";
import SocialButtons from "@/src/components/SocialButtons";

type Place = {
  id: string;
  country_code: string;
  city: string;
  description: string;
  experience: string;
  photos: string[];
  video_url?: string | null;
  lat?: number; lng?: number;
  distance_km: number;
};

const W = Dimensions.get("window").width;

export default function PlaceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch(`/api/places/${id}`);
      if (r.ok) setPlace(await r.json());
    } finally { setLoading(false); }
  }, [id, apiFetch]);

  useEffect(() => { load(); }, [load]);

  const share = async () => {
    if (!place) return;
    Haptics.selectionAsync();
    try {
      await Share.share({
        title: `${place.city} — Alberto 100 Carris`,
        message: `${place.city}, ${place.country_code} — uma etapa da viagem Alberto 100 Carris (Lagos → Singapura).`,
      });
    } catch {}
  };

  if (loading) return <View style={styles.container}><ScreenHeader showBack /><ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} /></View>;
  if (!place) return <View style={styles.container}><ScreenHeader showBack /></View>;

  const country = COUNTRIES.find((c) => c.code === place.country_code);
  const heroImage = place.photos[0] || country?.image;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: heroImage }} style={styles.hero}>
          <LinearGradient colors={["rgba(5,11,20,0.5)", "rgba(5,11,20,0)", "rgba(5,11,20,0.98)"]} style={StyleSheet.absoluteFill} />
          <ScreenHeader transparent showBack />
          <View style={styles.heroBody}>
            <Text style={styles.flag}>{country?.flag}</Text>
            <Text style={styles.city}>{place.city}</Text>
            <View style={styles.rule} />
            <Text style={styles.country}>{lang === "pt" ? country?.name_pt : country?.name_en}</Text>
          </View>
        </ImageBackground>

        <View style={styles.actions}>
          <Pressable style={styles.iconBtn} onPress={share} testID="share-place">
            <Feather name="share-2" size={16} color={colors.brand} />
            <Text style={styles.iconBtnText}>{lang === "pt" ? "Partilhar" : "Share"}</Text>
          </Pressable>
          <SocialButtons />
          {token && (
            <Pressable style={styles.iconBtn} onPress={() => router.push(`/admin/place/${place.id}`)} testID="edit-place">
              <Feather name="edit-2" size={16} color={colors.brand} />
              <Text style={styles.iconBtnText}>{lang === "pt" ? "Editar" : "Edit"}</Text>
            </Pressable>
          )}
        </View>

        {place.description ? (
          <View style={styles.section}>
            <Text style={styles.label}>{lang === "pt" ? "SOBRE" : "ABOUT"}</Text>
            <Text style={styles.body}>{place.description}</Text>
          </View>
        ) : null}

        {place.experience ? (
          <View style={styles.section}>
            <Text style={styles.label}>{lang === "pt" ? "A MINHA EXPERIÊNCIA" : "MY EXPERIENCE"}</Text>
            <Text style={styles.bodyEm}>{place.experience}</Text>
          </View>
        ) : null}

        {place.video_url ? (
          <View style={[styles.section, { paddingBottom: 28 }]}>
            <Text style={styles.label}>{lang === "pt" ? "VÍDEO" : "VIDEO"}</Text>
            <VideoPlayer url={place.video_url} />
          </View>
        ) : null}

        {place.photos.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.label}>{lang === "pt" ? "GALERIA" : "GALLERY"}</Text>
            <FlatList
              data={place.photos}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => `p-${i}`}
              contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.xl }}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.galleryImg} />
              )}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.empty}>
              <Feather name="image" size={28} color={colors.onSurfaceTertiary} />
              <Text style={styles.emptyText}>
                {lang === "pt"
                  ? "Ainda sem conteúdo. O Alberto está a caminho."
                  : "No content yet. Alberto is on his way."}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>{lang === "pt" ? "LOCALIZAÇÃO" : "LOCATION"}</Text>
          <View style={styles.mapCard}>
            <Feather name="map-pin" size={16} color={colors.brand} />
            <Text style={styles.mapText}>
              {place.lat?.toFixed(3)}, {place.lng?.toFixed(3)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { width: "100%", height: 420 },
  heroBody: { flex: 1, justifyContent: "flex-end", paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  flag: { fontSize: 36 },
  city: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.hero, marginTop: 4, letterSpacing: 0.5 },
  rule: { width: 48, height: 2, backgroundColor: colors.brand, marginVertical: spacing.md },
  country: { color: colors.brand, fontFamily: fonts.body, fontSize: 12, letterSpacing: 3, textTransform: "uppercase" },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md, flexWrap: "wrap" },
  iconBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.brand },
  iconBtnText: { color: colors.brand, fontFamily: fonts.body, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  label: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: spacing.md },
  body: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.lg, lineHeight: 26 },
  bodyEm: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.lg, lineHeight: 28, fontStyle: "italic" },
  galleryImg: { width: W * 0.7, height: W * 0.55, borderRadius: radius.md },
  empty: { alignItems: "center", padding: spacing.xl, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary, gap: 8 },
  emptyText: { color: colors.onSurfaceTertiary, fontFamily: fonts.display, fontStyle: "italic", fontSize: 14, textAlign: "center" },
  mapCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  mapText: { color: colors.onSurface, fontFamily: fonts.body, fontSize: 13, letterSpacing: 1 },
});
