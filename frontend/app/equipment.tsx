import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

const ITEMS = [
  { icon: "briefcase", pt: "Mochila de 45L", en: "45L backpack" },
  { icon: "camera", pt: "Câmara mirrorless + 35mm", en: "Mirrorless body + 35mm" },
  { icon: "smartphone", pt: "iPhone com cartão eSIM global", en: "iPhone with global eSIM" },
  { icon: "book", pt: "Caderno Moleskine vermelho", en: "Red Moleskine notebook" },
  { icon: "watch", pt: "Relógio mecânico sem bateria", en: "Mechanical watch (no battery)" },
  { icon: "headphones", pt: "Auscultadores com cancelamento de ruído", en: "Noise-cancelling headphones" },
  { icon: "zap", pt: "Power bank 20.000 mAh", en: "20,000 mAh power bank" },
  { icon: "globe", pt: "Mapa de papel da Eurásia", en: "Paper map of Eurasia" },
];

export default function Equipment() {
  const { lang } = useApp();
  return (
    <View style={styles.container}>
      <ScreenHeader title={t(lang, "equipment_title")} showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}>
        {ITEMS.map((it, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.icon}><Feather name={it.icon as any} size={18} color={colors.brand} /></View>
            <Text style={styles.label}>{lang === "pt" ? it.pt : it.en}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  icon: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  label: { color: colors.onSurface, fontFamily: fonts.body, fontSize: type.lg, flex: 1 },
});
