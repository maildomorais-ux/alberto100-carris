import React from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, fonts, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

export default function About() {
  const { lang } = useApp();
  const pt = "Chamo-me Alberto. Há quarenta anos sonho com esta viagem. Não sou jornalista, não sou influencer — sou apenas alguém que acredita que o melhor de qualquer lugar está entre estações.\n\nViajo de comboio porque o comboio obriga a olhar pela janela. Obriga a parar. Obriga a falar com quem ainda fala.\n\nEsta app é o lugar onde guardo tudo o que vou encontrando — para mim, e para quem quiser embarcar.";
  const en = "My name is Alberto. For forty years I've dreamt of this journey. I'm not a journalist, I'm not an influencer — I'm just someone who believes the best of any place is found between stations.\n\nI travel by train because trains force you to look out of the window. Force you to stop. Force you to talk to those still talking.\n\nThis app is where I keep what I find — for me, and for whoever wants to come along.";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <ImageBackground source={{ uri: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600" }} style={styles.hero}>
          <LinearGradient colors={["rgba(5,11,20,0.5)", "rgba(5,11,20,0)", "rgba(5,11,20,0.98)"]} style={StyleSheet.absoluteFill} />
          <ScreenHeader transparent showBack />
          <View style={styles.heroBody}>
            <Text style={styles.eyebrow}>{lang === "pt" ? "O VIAJANTE" : "THE TRAVELLER"}</Text>
            <Text style={styles.name}>Alberto</Text>
          </View>
        </ImageBackground>
        <View style={styles.body}>
          <Text style={styles.p}>{lang === "pt" ? pt : en}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 360 },
  heroBody: { flex: 1, justifyContent: "flex-end", padding: spacing.xl },
  eyebrow: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 4 },
  name: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.hero, marginTop: 4 },
  body: { padding: spacing.xl },
  p: { color: colors.onSurfaceSecondary, fontFamily: fonts.body, fontSize: type.lg, lineHeight: 28 },
});
