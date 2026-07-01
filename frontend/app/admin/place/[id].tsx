import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { COUNTRIES } from "@/src/data/countries";
import ScreenHeader from "@/src/components/ScreenHeader";
import VideoPlayer from "@/src/components/VideoPlayer";
import { pickAndUpload } from "@/src/utils/uploads";

export default function EditPlace() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();
  const [place, setPlace] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [distance, setDistance] = useState("0");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await apiFetch(`/api/places/${id}`);
    if (r.ok) {
      const p = await r.json();
      setPlace(p);
      setDescription(p.description || "");
      setExperience(p.experience || "");
      setVideoUrl(p.video_url || "");
      setDistance(String(p.distance_km || 0));
    }
  }, [id, apiFetch]);

  useEffect(() => { load(); }, [load]);

  if (!token) return <Redirect href="/login" />;
  if (!place) return <View style={styles.container}><ScreenHeader showBack /><ActivityIndicator color={colors.brand} style={{ marginTop: 60 }} /></View>;

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/places/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          country_code: place.country_code,
          city: place.city,
          order: place.order,
          description,
          experience,
          photos: place.photos,
          video_url: videoUrl || null,
          lat: place.lat, lng: place.lng,
          distance_km: parseFloat(distance) || 0,
          is_air_link: place.is_air_link,
        }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally { setSaving(false); }
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        lang === "pt" ? "Sem permissão" : "Permission required",
        lang === "pt" ? "Conceda acesso à galeria nas definições." : "Grant gallery access in settings."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const dataUri = asset.base64
      ? `data:image/jpeg;base64,${asset.base64}`
      : asset.uri;
    setBusy(true);
    try {
      const r = await apiFetch(`/api/places/${id}/photo`, {
        method: "POST",
        body: JSON.stringify({ photo: dataUri }),
      });
      if (r.ok) setPlace(await r.json());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally { setBusy(false); }
  };

  const removePhoto = async (index: number) => {
    Alert.alert(
      lang === "pt" ? "Apagar fotografia?" : "Delete photo?",
      "",
      [
        { text: lang === "pt" ? "Cancelar" : "Cancel", style: "cancel" },
        {
          text: lang === "pt" ? "Apagar" : "Delete", style: "destructive",
          onPress: async () => {
            const r = await apiFetch(`/api/places/${id}/photo/${index}`, { method: "DELETE" });
            if (r.ok) setPlace(await r.json());
          },
        },
      ],
    );
  };

  const pickVideo = async () => {
    setBusy(true);
    try {
      const result = await pickAndUpload("video", token!);
      if (result) {
        setVideoUrl(result.url);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e: any) {
      Alert.alert(
        lang === "pt" ? "Erro" : "Error",
        e?.message === "permission_denied"
          ? (lang === "pt" ? "Conceda acesso à galeria." : "Grant gallery access.")
          : (lang === "pt" ? "Não foi possível carregar o vídeo." : "Could not upload video."),
      );
    } finally { setBusy(false); }
  };

  const country = COUNTRIES.find((c) => c.code === place.country_code);

  return (
    <View style={styles.container}>
      <ScreenHeader title={place.city} showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={64}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>{country?.flag}  {country?.name_pt}</Text>
          <Text style={styles.title}>{place.city}</Text>

          {/* Photos */}
          <Text style={styles.label}>{lang === "pt" ? "Fotografias" : "Photos"}</Text>
          <View style={styles.photoGrid}>
            {place.photos?.map((p: string, i: number) => (
              <Pressable key={i} style={styles.photoCell} onLongPress={() => removePhoto(i)} testID={`photo-${i}`}>
                <Image source={{ uri: p }} style={styles.photoImg} />
                <View style={styles.photoOverlay}>
                  <Feather name="trash-2" size={12} color={colors.onSurface} />
                </View>
              </Pressable>
            ))}
            <Pressable style={styles.addCell} onPress={pickPhoto} testID="add-photo">
              {busy ? <ActivityIndicator color={colors.brand} /> : <Feather name="plus" size={24} color={colors.brand} />}
              <Text style={styles.addLabel}>{lang === "pt" ? "Carregar" : "Upload"}</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>{lang === "pt" ? "Mantenha pressionado para apagar." : "Long press to delete."}</Text>

          {/* Video */}
          <Text style={[styles.label, { marginTop: spacing.xxl }]}>{lang === "pt" ? "Vídeo" : "Video"}</Text>
          <View style={styles.videoControls}>
            <Pressable onPress={pickVideo} style={styles.videoUploadBtn} disabled={busy} testID="upload-video">
              {busy ? <ActivityIndicator color={colors.brand} /> : <Feather name="upload" size={16} color={colors.brand} />}
              <Text style={styles.videoUploadText}>{lang === "pt" ? "Carregar do iPhone" : "Upload from device"}</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>{lang === "pt" ? "Ou cole um link do YouTube:" : "Or paste a YouTube link:"}</Text>
          <TextInput
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://youtube.com/watch?v=... ou /api/uploads/..."
            placeholderTextColor={colors.onSurfaceTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            testID="video-url"
          />
          {videoUrl ? <VideoPlayer url={videoUrl} /> : null}

          {/* Description */}
          <Text style={[styles.label, { marginTop: spacing.xxl }]}>{lang === "pt" ? "Descrição da cidade" : "City description"}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder={lang === "pt" ? "Sobre esta cidade…" : "About this city…"}
            placeholderTextColor={colors.onSurfaceTertiary}
            style={[styles.input, styles.multiline]}
            testID="description"
          />

          {/* Experience */}
          <Text style={[styles.label, { marginTop: spacing.lg }]}>{lang === "pt" ? "A minha experiência" : "My experience"}</Text>
          <TextInput
            value={experience}
            onChangeText={setExperience}
            multiline
            placeholder={lang === "pt" ? "O que aconteceu, sentiu, comeu, viu…" : "What happened, felt, ate, saw…"}
            placeholderTextColor={colors.onSurfaceTertiary}
            style={[styles.input, styles.multiline]}
            testID="experience"
          />

          {/* Distance */}
          <Text style={[styles.label, { marginTop: spacing.lg }]}>{lang === "pt" ? "Distância percorrida (km)" : "Distance travelled (km)"}</Text>
          <TextInput
            value={distance}
            onChangeText={setDistance}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.onSurfaceTertiary}
            style={styles.input}
            testID="distance"
          />

          <Pressable onPress={save} disabled={saving} style={[styles.submit, saving && { opacity: 0.5 }]} testID="save">
            {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.submitText}>{lang === "pt" ? "Guardar" : "Save"}</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  eyebrow: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 3, textTransform: "uppercase" },
  title: { color: colors.onSurface, fontFamily: fonts.display, fontSize: type.display, marginTop: 4, marginBottom: spacing.xl },
  label: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: spacing.sm },
  input: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: spacing.lg, color: colors.onSurface, fontFamily: fonts.body, fontSize: type.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  hint: { color: colors.onSurfaceTertiary, fontFamily: fonts.body, fontSize: 11, marginTop: 6, fontStyle: "italic" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  photoCell: { width: "31%", aspectRatio: 1, borderRadius: radius.sm, overflow: "hidden" },
  photoImg: { width: "100%", height: "100%" },
  photoOverlay: { position: "absolute", right: 4, top: 4, padding: 4, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.55)" },
  addCell: { width: "31%", aspectRatio: 1, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.brand, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 4 },
  addLabel: { color: colors.brand, fontFamily: fonts.body, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" },
  videoControls: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  videoUploadBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderStyle: "dashed", borderColor: colors.brand, backgroundColor: colors.surfaceSecondary },
  videoUploadText: { color: colors.brand, fontFamily: fonts.body, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  submit: { marginTop: spacing.xl, backgroundColor: colors.brand, paddingVertical: spacing.lg, borderRadius: radius.pill, alignItems: "center" },
  submitText: { color: colors.surface, fontFamily: fonts.body, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
});
