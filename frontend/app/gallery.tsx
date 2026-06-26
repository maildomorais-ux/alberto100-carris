import React from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { colors, spacing } from "@/src/theme";
import { COUNTRIES } from "@/src/data/countries";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

export default function Gallery() {
  const { lang } = useApp();
  const router = useRouter();
  return (
    <View style={styles.container}>
      <ScreenHeader title={t(lang, "gallery_title")} showBack />
      <FlatList
        data={COUNTRIES}
        keyExtractor={(c) => c.code}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.tile}
            onPress={() => router.push(`/country/${item.code}`)}
            testID={`gallery-tile-${item.code}`}
          >
            <Image source={{ uri: item.image }} style={styles.img} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  tile: { flex: 1, aspectRatio: 1, overflow: "hidden", borderRadius: 8 },
  img: { width: "100%", height: "100%" },
});
