import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

export default function DiaryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch(`/api/entries/${id}`);
        if (r.ok) setEntry(await r.json());
      } finally { setLoading(false); }
    })();
  }, [id, apiFetch]);

  const remove = async () => {
    Alert.alert(t(lang, "delete"), entry?.title ?? "", [
      { text: "Cancel", style: "cancel" },
      {
        text: t(lang, "delete"), style: "destructive",
        onPress: async () => {
          await apiFetch(`/api/entries/${id}`, { method: "DELETE" });
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader showBack transparent />
        <ActivityIndicator color={colors.brand} style={{ marginTop: spacing.xxxl }} />
      </View>
    );
  }
  if (!entry) return <View style={styles.container}><ScreenHeader showBack /></View>;

  const photo = entry.photos?.[0];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.hero}>
          {photo ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFillObject} resizeMode="cover" /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceSecondary }]} />}
          <LinearGradient colors={["rgba(5,11,20,0.5)", "rgba(5,11,20,0)", "rgba(5,11,20,0.98)"]} style={StyleSheet.absoluteFill} />
          <ScreenHeader showBack transparent />
          <View style={styles.heroBody}>
            <Text style={styles.date}>{entry.country_code}</Text>
            <Text style={styles.title}>{entry.title}</Text>
            <View style={styles.metaRow}>
              <Meta icon="map-pin" text={entry.location} />
              {entry.distance_km > 0 && <Meta icon="navigation-2" text={`${Math.round(entry.distance_km)} km`} />}
              {entry.distance_km > 0 && <Meta icon="clock" text={`≈ ${Math.max(1, Math.round(entry.distance_km / 80))} h`} />}
              {entry.weather && !/\?/.test(entry.weather) && <Meta icon="cloud" text={entry.weather} />}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.text}>{entry.text}</Text>

          {entry.photos?.length > 1 && (
            <View style={styles.gallery}>
              {entry.photos.slice(1).map((p: string, i: number) => (
                <Image key={i} source={{ uri: p }} style={styles.galleryItem} />
              ))}
            </View>
          )}

          {token && (
            <Pressable onPress={remove} style={styles.dangerBtn} testID="diary-delete">
              <Feather name="trash-2" size={16} color={colors.error} />
              <Text style={styles.dangerText}>{t(lang, "delete")}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Meta({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.meta}>
      <Feather name={icon} size={11} color={colors.brand} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { width: "100%", height: 460 },
  heroBody: { flex: 1, justifyContent: "flex-end", paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  date: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: spacing.md },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display, letterSpacing: 0.5, lineHeight: type.display + 4 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.lg },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: 12 },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  text: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.lg, lineHeight: 28 },
  gallery: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xxl },
  galleryItem: { width: "48%", aspectRatio: 1, borderRadius: radius.sm },
  dangerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, marginTop: spacing.xxxl, paddingVertical: spacing.lg, borderWidth: 1, borderColor: colors.error, borderRadius: radius.md },
  dangerText: { color: colors.error, fontFamily: fonts.body, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" },
});
