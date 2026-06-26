import React from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { COUNTRIES } from "@/src/data/countries";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

export default function CountryDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { lang } = useApp();
  const country = COUNTRIES.find((c) => c.code === code);

  if (!country) {
    return (
      <View style={styles.container}>
        <ScreenHeader showBack />
        <Text style={styles.notFound}>—</Text>
      </View>
    );
  }

  const curiosities = lang === "pt" ? country.curiosities_pt : country.curiosities_en;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <ImageBackground source={{ uri: country.image }} style={styles.hero}>
          <LinearGradient colors={["rgba(5,11,20,0.5)", "rgba(5,11,20,0)", "rgba(5,11,20,0.98)"]} style={StyleSheet.absoluteFill} />
          <ScreenHeader transparent showBack />
          <View style={styles.heroContent}>
            <Text style={styles.flag}>{country.flag}</Text>
            <Text style={styles.countryName} testID={`country-name-${country.code}`}>
              {lang === "pt" ? country.name_pt : country.name_en}
            </Text>
            <View style={styles.rule} />
            <View style={styles.heroMeta}>
              <Feather name="map-pin" size={12} color={colors.brand} />
              <Text style={styles.heroMetaText}>{country.cities.join(" · ")}</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <Text style={styles.label}>{t(lang, "cities")}</Text>
          <View style={styles.cityRow}>
            {country.cities.map((c) => (
              <View key={c} style={styles.cityChip}>
                <Text style={styles.cityChipText}>{c}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: spacing.xxl }]}>{t(lang, "curiosities")}</Text>
          {curiosities.map((c, i) => (
            <View key={i} style={styles.curiosity}>
              <Text style={styles.curiosityIndex}>{String(i + 1).padStart(2, "0")}</Text>
              <Text style={styles.curiosityText}>{c}</Text>
            </View>
          ))}

          <CitiesList countryCode={country.code} />
        </View>
      </ScrollView>
    </View>
  );
}

function CitiesList({ countryCode }: { countryCode: string }) {
  const { lang, apiFetch } = useApp();
  const router = useRouter();
  const [places, setPlaces] = React.useState<any[]>([]);
  React.useEffect(() => {
    apiFetch("/api/places").then((r) => r.json()).then((all) =>
      setPlaces((all || []).filter((p: any) => p.country_code === countryCode))
    ).catch(() => {});
  }, [countryCode, apiFetch]);
  if (places.length === 0) return null;
  return (
    <View>
      <Text style={[styles.label, { marginTop: spacing.xxl }]}>
        {lang === "pt" ? "Cidades nesta etapa" : "Cities in this leg"}
      </Text>
      {places.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => router.push(`/place/${p.id}`)}
          style={styles.cityRow}
          testID={`place-link-${p.id}`}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cityRowName}>{p.city}</Text>
            <Text style={styles.cityRowMeta}>
              {p.photos.length} {lang === "pt" ? "fotos" : "photos"}{p.video_url ? `  ·  ${lang === "pt" ? "vídeo" : "video"}` : ""}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.brand} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { width: "100%", height: 420 },
  heroContent: { flex: 1, justifyContent: "flex-end", paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  flag: { fontSize: 40, marginBottom: spacing.sm },
  countryName: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.hero, letterSpacing: 1 },
  rule: { width: 48, height: 2, backgroundColor: colors.brand, marginVertical: spacing.lg },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  heroMetaText: { color: colors.brand, fontFamily: fonts.body, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  label: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: spacing.md },
  cityRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  cityChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.borderStrong,
  },
  cityChipText: { color: colors.onSurface, fontFamily: fonts.body, fontSize: 13 },
  curiosity: { flexDirection: "row", marginBottom: spacing.lg, gap: spacing.lg },
  cityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  cityRowName: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.lg },
  cityRowMeta: { color: colors.onSurfaceTertiary, fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 },
  curiosityIndex: { color: colors.brand, fontFamily: fonts.display, fontSize: type.xxl, width: 36 },
  curiosityText: { flex: 1, color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.lg, lineHeight: 26 },
  notFound: { color: colors.onSurface, padding: spacing.xl, fontFamily: fonts.display, fontSize: type.xl },
});
