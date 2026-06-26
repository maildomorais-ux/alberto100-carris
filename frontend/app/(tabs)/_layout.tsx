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
        tabBarLabelStyle: {
          fontFamily: fonts.body,
          fontSize: 11,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        },
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
      <Tabs.Screen
        name="index"
        options={{
          title: t(lang, "tab_home"),
          tabBarIcon: ({ color, size }) => <Feather name="compass" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          title: t(lang, "tab_route"),
          tabBarIcon: ({ color, size }) => <Feather name="map" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: t(lang, "tab_diary"),
          tabBarIcon: ({ color, size }) => <Feather name="book-open" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t(lang, "tab_more"),
          tabBarIcon: ({ color, size }) => <Feather name="more-horizontal" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
