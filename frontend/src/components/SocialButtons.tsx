import React from "react";
import { Pressable, StyleSheet, View, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
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
  return (
    <View style={[styles.row, isFooter && styles.rowFooter]}>
      <Pressable
        onPress={() => open(SOCIAL.instagram)}
        style={[styles.btn, isFooter && styles.btnFooter]}
        hitSlop={8}
        testID="social-instagram"
      >
        <Feather name="instagram" size={isFooter ? 18 : 16} color={colors.brand} />
      </Pressable>
      <Pressable
        onPress={() => open(SOCIAL.facebook)}
        style={[styles.btn, isFooter && styles.btnFooter]}
        hitSlop={8}
        testID="social-facebook"
      >
        <Feather name="facebook" size={isFooter ? 18 : 16} color={colors.brand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  rowFooter: { gap: 14, justifyContent: "center" },
  btn: {
    width: 32, height: 32, borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.brand,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(5,11,20,0.4)",
  },
  btnFooter: { width: 44, height: 44 },
});
