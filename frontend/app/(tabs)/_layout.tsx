import React from "react";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";

import { colors, fonts } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";

export default function TabsLayout() {
  const { lang } = useApp();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.onSurfaceTertiary,
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 0.4, textTransform: "uppercase" },
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.borderStrong,
          backgroundColor: Platform.OS === "android" ? "rgba(5,11,20,0.95)" : "transparent",
          elevation: 0,
          height: 78,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(5,11,20,0.95)" }]} />
          ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: lang === "pt" ? "Início" : "Home",
        tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="diary" options={{ title: lang === "pt" ? "Diário" : "Diary",
        tabBarIcon: ({ color, size }) => <Feather name="book-open" color={color} size={size} /> }} />
      <Tabs.Screen name="route" options={{ title: lang === "pt" ? "Percurso" : "Route",
        tabBarIcon: ({ color, size }) => <Feather name="map" color={color} size={size} /> }} />
      <Tabs.Screen name="about" options={{ title: lang === "pt" ? "Sobre" : "About",
        tabBarIcon: ({ color, size }) => <Feather name="info" color={color} size={size} /> }} />
      <Tabs.Screen name="gallery" options={{ title: lang === "pt" ? "Galeria" : "Gallery",
        tabBarIcon: ({ color, size }) => <Feather name="image" color={color} size={size} /> }} />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
  );
}
