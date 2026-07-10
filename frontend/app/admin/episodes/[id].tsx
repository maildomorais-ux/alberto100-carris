import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import ScreenHeader from "@/src/components/ScreenHeader";
import VideoPlayer from "@/src/components/VideoPlayer";
import { pickAndUpload } from "@/src/utils/uploads";

const API = process.env.EXPO_PUBLIC_BACKEND_URL || "";
const resolve = (u?: string | null) => (!u ? undefined : /^https?:\/\//.test(u) ? u : `${API}${u}`);

export default function EditEpisode() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();
  const [ep, setEp] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<"" | "cover" | "video" | "gallery">("");

  useEffect(() => {
    (async () => {
      const r = await apiFetch(`/api/episodes/${id}`);
      if (r.ok) setEp(await r.json());
    })();
  }, [id, apiFetch]);

  if (!token) return <Redirect href="/login" />;
  if (!ep) return <View style={styles.container}><ScreenHeader showBack /><ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} /></View>;

  const set = (k: string, v: any) => setEp({ ...ep, [k]: v });

  const save = async () => {
    setSaving(true);
    try {
      const { id: _, created_at, updated_at, ...body } = ep;
      const r = await apiFetch(`/api/episodes/${id}`, { method: "PUT", body: JSON.stringify(body) });
      if (r.ok) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }
    } finally { setSaving(false); }
  };

  const remove = async () => {
    Alert.alert(lang === "pt" ? "Apagar episódio?" : "Delete episode?", "", [
      { text: lang === "pt" ? "Cancelar" : "Cancel", style: "cancel" },
      { text: lang === "pt" ? "Apagar" : "Delete", style: "destructive", onPress: async () => {
          await apiFetch(`/api/episodes/${id}`, { method: "DELETE" });
          router.back();
        } },
    ]);
  };

  const pick = async (kind: "cover" | "video" | "gallery") => {
    setBusy(kind);
    try {
      const result = await pickAndUpload(kind === "video" ? "video" : "image", token!);
      if (result) {
        if (kind === "cover") set("cover_photo", result.url);
        else if (kind === "video") set("video_url", result.url);
        else set("gallery", [...(ep.gallery || []), result.url]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e: any) {
      Alert.alert(lang === "pt" ? "Erro" : "Error", e?.message || String(e));
    } finally { setBusy(""); }
  };

  const removeGallery = (i: number) => set("gallery", (ep.gallery || []).filter((_: any, idx: number) => idx !== i));

  return (
    <View style={styles.container}>
      <ScreenHeader title={`#${String(ep.number).padStart(2, "0")}`} showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={64}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 160 }} keyboardShouldPersistTaps="handled">

          <Field label={lang === "pt" ? "Número" : "Number"} value={String(ep.number)} onChangeText={(v: string) => set("number", parseInt(v) || 1)} keyboardType="number-pad" />
          <Field label={lang === "pt" ? "Título (PT)" : "Title (PT)"} value={ep.title_pt} onChangeText={(v: string) => set("title_pt", v)} />
          <Field label={lang === "pt" ? "Título (EN)" : "Title (EN)"} value={ep.title_en} onChangeText={(v: string) => set("title_en", v)} />
          <Field label={lang === "pt" ? "Subtítulo (PT)" : "Subtitle (PT)"} value={ep.subtitle_pt || ""} onChangeText={(v: string) => set("subtitle_pt", v)} />
          <Field label={lang === "pt" ? "Subtítulo (EN)" : "Subtitle (EN)"} value={ep.subtitle_en || ""} onChangeText={(v: string) => set("subtitle_en", v)} />
          <Field label={lang === "pt" ? "Descrição (PT)" : "Description (PT)"} value={ep.description_pt} onChangeText={(v: string) => set("description_pt", v)} multiline />
          <Field label={lang === "pt" ? "Descrição (EN)" : "Description (EN)"} value={ep.description_en} onChangeText={(v: string) => set("description_en", v)} multiline />
          <Field label={lang === "pt" ? "País (código)" : "Country code"} value={ep.country_code || ""} onChangeText={(v: string) => set("country_code", v.toUpperCase())} autoCapitalize="characters" />
          <Field label={lang === "pt" ? "Cidade / localização" : "City / location"} value={ep.location} onChangeText={(v: string) => set("location", v)} />
          <Field label={lang === "pt" ? "Data (AAAA-MM-DD)" : "Date (YYYY-MM-DD)"} value={ep.date} onChangeText={(v: string) => set("date", v)} />
          <Field label={lang === "pt" ? "Duração (MM:SS)" : "Duration (MM:SS)"} value={ep.duration} onChangeText={(v: string) => set("duration", v)} />
          <Field label="Lat" value={ep.lat != null ? String(ep.lat) : ""} onChangeText={(v: string) => set("lat", v ? parseFloat(v) : null)} keyboardType="decimal-pad" />
          <Field label="Lng" value={ep.lng != null ? String(ep.lng) : ""} onChangeText={(v: string) => set("lng", v ? parseFloat(v) : null)} keyboardType="decimal-pad" />

          <Text style={styles.label}>{lang === "pt" ? "Fotografia de capa" : "Cover photo"}</Text>
          {ep.cover_photo ? <Image source={{ uri: resolve(ep.cover_photo) }} style={styles.cover} /> : null}
          <Pressable style={styles.uploadBtn} onPress={() => pick("cover")} disabled={busy === "cover"}>
            {busy === "cover" ? <ActivityIndicator color={colors.brand} /> : <Feather name="upload" size={16} color={colors.brand} />}
            <Text style={styles.uploadText}>{lang === "pt" ? "Carregar capa" : "Upload cover"}</Text>
          </Pressable>

          <Text style={styles.label}>{lang === "pt" ? "Vídeo" : "Video"}</Text>
          {ep.video_url ? <VideoPlayer url={ep.video_url} /> : null}
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Pressable style={[styles.uploadBtn, { flex: 1 }]} onPress={() => pick("video")} disabled={busy === "video"}>
              {busy === "video" ? <ActivityIndicator color={colors.brand} /> : <Feather name="upload" size={16} color={colors.brand} />}
              <Text style={styles.uploadText}>{lang === "pt" ? "Carregar do iPhone" : "Upload from device"}</Text>
            </Pressable>
          </View>
          <TextInput
            value={ep.video_url || ""} onChangeText={(v) => set("video_url", v)}
            placeholder={lang === "pt" ? "Ou cole URL do YouTube" : "Or paste YouTube URL"}
            placeholderTextColor={colors.onSurfaceTertiary} autoCapitalize="none" autoCorrect={false}
            style={styles.input}
          />

          <Text style={styles.label}>{lang === "pt" ? "Galeria" : "Gallery"}</Text>
          <View style={styles.galGrid}>
            {(ep.gallery || []).map((g: string, i: number) => (
              <Pressable key={i} onLongPress={() => removeGallery(i)} style={styles.galCell}>
                <Image source={{ uri: resolve(g) }} style={styles.galImg} />
                <View style={styles.trash}><Feather name="trash-2" size={11} color={colors.onSurface} /></View>
              </Pressable>
            ))}
            <Pressable style={styles.galAdd} onPress={() => pick("gallery")} disabled={busy === "gallery"}>
              {busy === "gallery" ? <ActivityIndicator color={colors.brand} /> : <Feather name="plus" size={22} color={colors.brand} />}
            </Pressable>
          </View>
          <Text style={styles.hint}>{lang === "pt" ? "Toque longo para apagar." : "Long press to delete."}</Text>

          <View style={styles.statusRow}>
            <Text style={styles.label}>{lang === "pt" ? "Publicado" : "Published"}</Text>
            <Switch value={ep.status === "published"} onValueChange={(v) => set("status", v ? "published" : "draft")}
              thumbColor={ep.status === "published" ? colors.brand : "#888"}
              trackColor={{ true: "rgba(230,195,101,0.4)", false: colors.surfaceTertiary }} />
          </View>

          <Pressable style={[styles.submit, saving && { opacity: 0.5 }]} onPress={save} disabled={saving} testID="save-episode">
            {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.submitText}>{lang === "pt" ? "Guardar" : "Save"}</Text>}
          </Pressable>

          <Pressable style={styles.deleteBtn} onPress={remove}>
            <Feather name="trash-2" size={14} color={colors.error} />
            <Text style={styles.deleteText}>{lang === "pt" ? "Apagar episódio" : "Delete episode"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, multiline, ...rest }: any) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        multiline={multiline}
        placeholderTextColor={colors.onSurfaceTertiary}
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: "top" }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  label: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: spacing.md, color: colors.onSurface, fontFamily: fonts.body, fontSize: type.base, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  cover: { width: "100%", height: 180, borderRadius: radius.md, marginBottom: spacing.sm },
  uploadBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderStyle: "dashed", borderColor: colors.brand, backgroundColor: colors.surfaceSecondary, marginBottom: spacing.sm },
  uploadText: { color: colors.brand, fontFamily: fonts.body, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  galGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  galCell: { width: "31%", aspectRatio: 1, borderRadius: radius.sm, overflow: "hidden" },
  galImg: { width: "100%", height: "100%" },
  trash: { position: "absolute", right: 4, top: 4, padding: 4, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.6)" },
  galAdd: { width: "31%", aspectRatio: 1, borderRadius: radius.sm, borderWidth: 1, borderStyle: "dashed", borderColor: colors.brand, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceSecondary },
  hint: { color: colors.onSurfaceTertiary, fontSize: 11, fontStyle: "italic", marginTop: 6 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  submit: { marginTop: spacing.xl, backgroundColor: colors.brand, paddingVertical: spacing.lg, borderRadius: radius.pill, alignItems: "center" },
  submitText: { color: colors.surface, fontFamily: fonts.body, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: spacing.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.error, borderRadius: radius.md },
  deleteText: { color: colors.error, fontFamily: fonts.body, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" },
});
