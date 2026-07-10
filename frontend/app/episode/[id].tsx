import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import ScreenHeader from "@/src/components/ScreenHeader";
import VideoPlayer from "@/src/components/VideoPlayer";

const API = process.env.EXPO_PUBLIC_BACKEND_URL || "";
const resolve = (u?: string | null) => (!u ? undefined : /^https?:\/\//.test(u) ? u : `${API}${u}`);

export default function EpisodeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, apiFetch } = useApp();
  const [ep, setEp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch(`/api/episodes/${id}`);
      if (r.ok) setEp(await r.json());
    } finally { setLoading(false); }
  }, [id, apiFetch]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={styles.container}><ScreenHeader showBack /><ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} /></View>;
  if (!ep) return <View style={styles.container}><ScreenHeader showBack /></View>;

  const title = lang === "pt" ? ep.title_pt : ep.title_en;
  const subtitle = lang === "pt" ? ep.subtitle_pt : ep.subtitle_en;
  const description = lang === "pt" ? ep.description_pt : ep.description_en;
  const cover = resolve(ep.cover_photo);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {cover ? (
          <View style={styles.hero}>
            <Image source={{ uri: cover }} style={StyleSheet.absoluteFillObject} />
            <LinearGradient colors={["rgba(5,11,20,0.4)", "rgba(5,11,20,0)", "rgba(5,11,20,0.98)"]} style={StyleSheet.absoluteFill} />
            <ScreenHeader transparent showBack />
            <View style={styles.heroBody}>
              <Text style={styles.eyebrow}>{ep.duration || "—"}</Text>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
        ) : <ScreenHeader title={title} showBack />}

        <View style={styles.section}>
          {ep.video_url ? <VideoPlayer url={ep.video_url} /> : (
            <Text style={styles.hint}>{lang === "pt" ? "Ainda sem vídeo carregado." : "No video uploaded yet."}</Text>
          )}
        </View>

        {description ? (
          <View style={styles.section}>
            <Text style={styles.body}>{description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.metaGrid}>
            {ep.location ? <Meta icon="map-pin" text={ep.location} /> : null}
            {ep.date ? <Meta icon="calendar" text={ep.date} /> : null}
            {ep.country_code ? <Meta icon="flag" text={ep.country_code} /> : null}
          </View>
        </View>

        {ep.gallery?.length > 0 && (
          <View style={styles.section}>
            <FlatList
              data={ep.gallery} horizontal keyExtractor={(_, i) => `g-${i}`}
              contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.xl }}
              renderItem={({ item }) => <Image source={{ uri: resolve(item) }} style={styles.galleryItem} />}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Meta({ icon, text }: any) {
  return <View style={styles.meta}><Feather name={icon} size={12} color={colors.brand} /><Text style={styles.metaText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { width: "100%", height: 380 },
  heroBody: { flex: 1, justifyContent: "flex-end", padding: spacing.xl },
  eyebrow: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 3, textTransform: "uppercase" },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display, marginTop: 4 },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: 14, marginTop: 4, fontStyle: "italic" },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  body: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.lg, lineHeight: 26 },
  hint: { color: colors.onSurfaceTertiary, textAlign: "center", padding: spacing.xl, fontStyle: "italic" },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: 12 },
  galleryItem: { width: 220, height: 160, borderRadius: radius.md },
});
