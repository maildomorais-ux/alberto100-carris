import React from "react";
import { Pressable, StyleSheet, View, Linking } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { colors, radius } from "@/src/theme";
import { SOCIAL } from "@/src/config/social";

type Props = { variant?: "header" | "footer" };

export default function SocialButtons({ variant = "header" }: Props) {
  const open = async (url: string) => {
    Haptics.selectionAsync();
    try { await Linking.openURL(url); } catch {}
  };
  const isFooter = variant === "footer";
  const size = isFooter ? 18 : 14;
  return (
    <View style={[styles.row, isFooter && styles.rowFooter]}>
      <Pressable onPress={() => open(SOCIAL.instagram)} style={[styles.btn, isFooter && styles.btnFooter]} hitSlop={6} testID="social-instagram">
        <Feather name="instagram" size={size} color={colors.brand} />
      </Pressable>
      <Pressable onPress={() => open(SOCIAL.facebook)} style={[styles.btn, isFooter && styles.btnFooter]} hitSlop={6} testID="social-facebook">
        <Feather name="facebook" size={size} color={colors.brand} />
      </Pressable>
      <Pressable onPress={() => open(SOCIAL.youtube)} style={[styles.btn, isFooter && styles.btnFooter]} hitSlop={6} testID="social-youtube">
        <Feather name="youtube" size={size} color={colors.brand} />
      </Pressable>
      <Pressable onPress={() => open(SOCIAL.tiktok)} style={[styles.btn, isFooter && styles.btnFooter]} hitSlop={6} testID="social-tiktok">
        <FontAwesome name="music" size={size - 2} color={colors.brand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  rowFooter: { gap: 14, justifyContent: "center" },
  btn: {
    width: 28, height: 28, borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.brand,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(5,11,20,0.4)",
  },
  btnFooter: { width: 44, height: 44 },
});
