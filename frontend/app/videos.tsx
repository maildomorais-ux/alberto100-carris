import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

const EPISODES = [
  { id: 1, title: { pt: "Episódio 01 — Lagos", en: "Episode 01 — Lagos" }, duration: "12:24", thumb: "https://images.unsplash.com/photo-1608649944716-228404a0a8bb?w=1200" },
  { id: 2, title: { pt: "Episódio 02 — Atravessar Espanha", en: "Episode 02 — Crossing Spain" }, duration: "18:02", thumb: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200" },
  { id: 3, title: { pt: "Episódio 03 — Bósforo", en: "Episode 03 — The Bosphorus" }, duration: "14:48", thumb: "https://images.unsplash.com/photo-1719082993979-c4a36d62efad?w=1200" },
  { id: 4, title: { pt: "Episódio 04 — Transiberiano", en: "Episode 04 — Trans-Siberian" }, duration: "22:11", thumb: "https://images.unsplash.com/photo-1514970746-d4a465d514d0?w=1200" },
];

export default function Videos() {
  const { lang } = useApp();
  return (
    <View style={styles.container}>
      <ScreenHeader title={t(lang, "videos_title")} showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100, gap: spacing.lg }}>
        {EPISODES.map((e) => (
          <View key={e.id} style={styles.card} testID={`video-${e.id}`}>
            <Image source={{ uri: e.thumb }} style={styles.thumb} />
            <View style={styles.playBadge}><Feather name="play" size={20} color={colors.surface} /></View>
            <View style={styles.body}>
              <Text style={styles.duration}>{e.duration}</Text>
              <Text style={styles.title}>{e.title[lang]}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  card: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  thumb: { width: "100%", height: 200 },
  playBadge: { position: "absolute", left: 14, top: 14, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  body: { padding: spacing.lg },
  duration: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.xl, marginTop: 4 },
});
