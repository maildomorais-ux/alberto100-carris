import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ImageBackground, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

type Entry = {
  id: string;
  title: string;
  text: string;
  location: string;
  country_code: string;
  date: string;
  distance_km: number;
  weather?: string;
  photos: string[];
};

export default function Diary() {
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await apiFetch("/api/entries");
      const data = await r.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiFetch]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t(lang, "diary_title")} />
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Text style={styles.introSub}>{t(lang, "diary_subtitle")}</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.brand} style={{ marginTop: spacing.xxxl }} />
          ) : (
            <View style={styles.empty}>
              <Feather name="book" size={36} color={colors.brand} />
              <Text style={styles.emptyText}>{t(lang, "diary_empty")}</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/diary/${item.id}`)}
            style={styles.card}
            testID={`diary-entry-${item.id}`}
          >
            <ImageBackground
              source={{ uri: item.photos[0] || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200" }}
              style={styles.cardImage}
              imageStyle={{ borderRadius: radius.md }}
            >
              <LinearGradient colors={["rgba(5,11,20,0)", "rgba(5,11,20,0.95)"]} style={StyleSheet.absoluteFill} />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardDate}>{item.country_code}</Text>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Feather name="map-pin" size={11} color={colors.brand} />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                  {item.distance_km > 0 && (
                    <View style={styles.metaItem}>
                      <Feather name="navigation-2" size={11} color={colors.brand} />
                      <Text style={styles.metaText}>{Math.round(item.distance_km)} km</Text>
                    </View>
                  )}
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        )}
      />
      {token && (
        <Pressable
          onPress={() => router.push("/diary/new")}
          style={styles.fab}
          testID="diary-fab-new"
        >
          <Feather name="plus" size={24} color={colors.surface} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  intro: { paddingBottom: spacing.lg },
  introSub: { color: colors.onSurfaceSecondary, fontFamily: fonts.display, fontSize: type.lg, fontStyle: "italic" },
  card: {
    marginBottom: spacing.lg, height: 240,
    borderRadius: radius.md, overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.borderStrong,
  },
  cardImage: { flex: 1, justifyContent: "flex-end" },
  cardOverlay: { padding: spacing.lg },
  cardDate: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: spacing.sm },
  cardTitle: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.xxl, lineHeight: type.xxl + 4 },
  cardMeta: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.md, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: 12 },
  empty: { alignItems: "center", paddingVertical: spacing.xxxl, gap: spacing.lg },
  emptyText: { color: colors.onSurfaceSecondary, fontFamily: fonts.display, fontSize: type.lg, textAlign: "center", paddingHorizontal: spacing.xl, fontStyle: "italic" },
  fab: {
    position: "absolute", right: spacing.xl, bottom: 96,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brand, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
