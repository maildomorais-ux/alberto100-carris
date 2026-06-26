import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, spacing } from "@/src/theme";
import LanguageToggle from "./LanguageToggle";
import SocialButtons from "./SocialButtons";

type Props = { title?: string; showBack?: boolean; transparent?: boolean };

export default function ScreenHeader({ title, showBack, transparent }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: insets.top + 8 },
        transparent ? styles.transparent : styles.solid,
      ]}
    >
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            style={styles.iconBtn}
            hitSlop={12}
            testID="header-back"
          >
            <Feather name="chevron-left" size={22} color={colors.onSurface} />
          </Pressable>
        ) : (
          <View style={styles.brandMark}>
            <Text style={styles.brandText}>A · 100</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title ?? ""}</Text>
      <View style={styles.right}>
        <SocialButtons />
        <LanguageToggle />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    zIndex: 5,
  },
  solid: { backgroundColor: "rgba(5,11,20,0.92)", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  transparent: { backgroundColor: "transparent" },
  left: { width: 64 },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  brandMark: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.brand,
    borderRadius: 4,
  },
  brandText: { color: colors.brand, fontFamily: fonts.display, fontSize: 12, letterSpacing: 2 },
  title: {
    flex: 1, textAlign: "center",
    color: colors.onSurface, fontFamily: fonts.display,
    fontSize: 18, letterSpacing: 1,
  },
});
