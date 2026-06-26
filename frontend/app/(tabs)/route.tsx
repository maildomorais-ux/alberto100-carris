import React from "react";
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { COUNTRIES, Country } from "@/src/data/countries";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

export default function RouteScreen() {
  const { lang } = useApp();
  const router = useRouter();

  const open = (c: Country) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/country/${c.code}`);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t(lang, "route_title")} />
      <FlatList
        data={COUNTRIES}
        keyExtractor={(c) => c.code}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: spacing.lg }}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Text style={styles.introSub}>{t(lang, "route_subtitle")}</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <CountryItem
            country={item}
            isLast={index === COUNTRIES.length - 1}
            isFirst={index === 0}
            lang={lang}
            onPress={() => open(item)}
          />
        )}
      />
    </View>
  );
}

function CountryItem({
  country, isLast, isFirst, lang, onPress,
}: { country: Country; isLast: boolean; isFirst: boolean; lang: "pt" | "en"; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      testID={`country-${country.code}`}
    >
      {/* Rail line */}
      <View style={styles.railColumn}>
        <View style={[styles.railSegment, isFirst && styles.railSegmentHidden]} />
        <View style={[styles.dot, country.isAirLink && styles.dotAir]}>
          <View style={styles.dotInner} />
        </View>
        <View style={[styles.railSegment, isLast && styles.railSegmentHidden]} />
      </View>

      {/* Country card */}
      <ImageBackground source={{ uri: country.image }} style={styles.card} imageStyle={styles.cardImage}>
        <LinearGradient colors={["rgba(5,11,20,0.2)", "rgba(5,11,20,0.92)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.cardContent}>
          <View style={styles.cardHead}>
            <Text style={styles.flag}>{country.flag}</Text>
            {country.isAirLink && (
              <View style={styles.airBadge}>
                <Feather name="navigation" size={10} color={colors.brand} />
                <Text style={styles.airBadgeText}>{t(lang, "air_link")}</Text>
              </View>
            )}
          </View>
          <Text style={styles.countryName}>{lang === "pt" ? country.name_pt : country.name_en}</Text>
          <Text style={styles.cityLine}>{country.cities.join(" · ")}</Text>
          <View style={styles.cardFoot}>
            <Text style={styles.arrival}>{country.cities[0]}</Text>
            <Feather name="chevron-right" size={16} color={colors.brand} />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  intro: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  introSub: { color: colors.onSurfaceSecondary, fontFamily: fonts.display, fontSize: type.lg, fontStyle: "italic" },
  row: { flexDirection: "row", paddingHorizontal: spacing.lg },
  railColumn: { width: 28, alignItems: "center" },
  railSegment: { width: 2, flex: 1, backgroundColor: colors.brand, opacity: 0.55 },
  railSegmentHidden: { opacity: 0 },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 2, borderColor: colors.brand,
    alignItems: "center", justifyContent: "center", marginVertical: 2,
  },
  dotAir: { borderStyle: "dashed" },
  dotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand },
  card: {
    flex: 1, marginLeft: spacing.md, marginVertical: spacing.sm,
    height: 140, borderRadius: radius.md, overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.borderStrong,
  },
  cardImage: { borderRadius: radius.md },
  cardContent: { flex: 1, padding: spacing.lg, justifyContent: "space-between" },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  flag: { fontSize: 24 },
  airBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: "rgba(5,11,20,0.7)", borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.brand,
  },
  airBadgeText: { color: colors.brand, fontSize: 9, fontFamily: fonts.body, letterSpacing: 0.8, textTransform: "uppercase" },
  countryName: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.xl, letterSpacing: 0.5 },
  cityLine: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  cardFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  arrival: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" },
});
