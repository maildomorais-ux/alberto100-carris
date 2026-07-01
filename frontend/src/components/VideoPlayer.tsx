import React from "react";
import { Platform, StyleSheet, View, Text, Dimensions, Pressable, Linking } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import { colors, fonts } from "@/src/theme";

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

function isYouTube(url: string): boolean {
  return /youtu\.?be/.test(url);
}

function resolveUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.EXPO_PUBLIC_BACKEND_URL || "";
  return `${base}${url}`;
}

// Native mp4/mov player using expo-video
function NativeVideo({ url }: { url: string }) {
  const player = useVideoPlayer(resolveUrl(url), (p) => { p.loop = false; });
  const width = Dimensions.get("window").width - 32;
  return (
    <VideoView
      player={player}
      style={{ width, height: (width * 9) / 16, alignSelf: "center", borderRadius: 12, backgroundColor: "#000" }}
      contentFit="cover"
      allowsFullscreen
      allowsPictureInPicture
      nativeControls
    />
  );
}

export default function VideoPlayer({ url }: { url?: string | null }) {
  if (!url) return null;

  // YouTube (embed via iframe or WebView)
  if (isYouTube(url)) {
    const id = extractYouTubeId(url);
    if (!id) return null;
    const width = Dimensions.get("window").width - 32;
    const height = (width * 9) / 16;
    const embed = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
    return (
      <View style={[styles.wrap, { width, height }]}>
        {Platform.OS === "web" ? (
          // @ts-ignore
          <iframe src={embed} style={{ width: "100%", height: "100%", border: 0, borderRadius: 12 }}
            allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" />
        ) : (
          <WebView source={{ uri: embed }} style={{ flex: 1, backgroundColor: "#000", borderRadius: 12 }}
            allowsFullscreenVideo javaScriptEnabled mediaPlaybackRequiresUserAction={false} />
        )}
      </View>
    );
  }

  // Native uploaded video (mp4/mov). On web, use <video> tag.
  const src = resolveUrl(url);
  if (Platform.OS === "web") {
    const width = Dimensions.get("window").width - 32;
    return (
      <View style={[styles.wrap, { width, height: (width * 9) / 16 }]}>
        {/* @ts-ignore */}
        <video src={src} controls playsInline
          style={{ width: "100%", height: "100%", borderRadius: 12, background: "#000" }} />
      </View>
    );
  }
  try {
    return <NativeVideo url={url} />;
  } catch {
    // Fallback: open externally
    const width = Dimensions.get("window").width - 32;
    return (
      <Pressable style={[styles.wrap, styles.fallback, { width, height: (width * 9) / 16 }]}
        onPress={() => Linking.openURL(src)}>
        <Feather name="play-circle" size={44} color={colors.brand} />
        <Text style={styles.fallbackText}>Toque para reproduzir</Text>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "center", marginVertical: 12, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  fallback: { alignItems: "center", justifyContent: "center", gap: 8 },
  fallbackText: { color: colors.brand, fontFamily: fonts.body, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" },
});
