import React from "react";
import { Platform, StyleSheet, View, Text, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { colors, fonts } from "@/src/theme";

// Extract YouTube ID from any YouTube URL (or assume raw ID if no slashes)
export function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const s = input.trim();
  if (!s) return null;
  if (!s.includes("/") && !s.includes("?") && s.length <= 15) return s;
  try {
    const url = new URL(s);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) => p === "embed" || p === "shorts");
      if (i >= 0 && parts[i + 1]) return parts[i + 1];
    }
  } catch {}
  const m = s.match(/[a-zA-Z0-9_-]{11}/);
  return m ? m[0] : null;
}

export default function VideoPlayer({ url }: { url?: string | null }) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  const width = Dimensions.get("window").width - 32;
  const height = (width * 9) / 16;
  const embed = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
  return (
    <View style={[styles.wrap, { width, height }]}>
      {Platform.OS === "web" ? (
        // @ts-ignore — iframe on web
        <iframe
          src={embed}
          style={{ width: "100%", height: "100%", border: 0, borderRadius: 12 }}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ) : (
        <WebView
          source={{ uri: embed }}
          style={{ flex: 1, backgroundColor: "#000", borderRadius: 12 }}
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
        />
      )}
      <Text style={styles.hint}>Toque no vídeo para ver em ecrã inteiro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "center", marginVertical: 16, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  hint: { position: "absolute", bottom: -22, left: 4, color: colors.onSurfaceTertiary, fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.5 },
});
