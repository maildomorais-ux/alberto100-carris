import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter, Redirect } from "expo-router";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

export default function NewEntry() {
  const { lang, token, apiFetch } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("PT");
  const [distance, setDistance] = useState("");
  const [weather, setWeather] = useState("");
  const [photo, setPhoto] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) return <Redirect href="/login" />;

  const save = async () => {
    if (!title || !text || !location) {
      setError("required");
      return;
    }
    setSaving(true); setError(null);
    try {
      const r = await apiFetch("/api/entries", {
        method: "POST",
        body: JSON.stringify({
          title, text, location,
          country_code: country.toUpperCase(),
          date: "",
          distance_km: parseFloat(distance) || 0,
          weather: weather || null,
          photos: photo ? [photo] : [],
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      router.replace("/(tabs)/diary");
    } catch (e: any) {
      setError(e.message || "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t(lang, "more_new_entry")} showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={64}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
          <Field label={t(lang, "new_title")} value={title} onChangeText={setTitle} testID="new-title" />
          <Field label={t(lang, "new_text")} value={text} onChangeText={setText} multiline testID="new-text" />
          <Field label={t(lang, "new_location")} value={location} onChangeText={setLocation} testID="new-location" />
          <Field label={t(lang, "new_country")} value={country} onChangeText={setCountry} testID="new-country" autoCapitalize="characters" />
          <Field label={t(lang, "new_distance")} value={distance} onChangeText={setDistance} keyboardType="decimal-pad" testID="new-distance" />
          <Field label={t(lang, "new_weather")} value={weather} onChangeText={setWeather} testID="new-weather" />
          <Field label={t(lang, "new_photo")} value={photo} onChangeText={setPhoto} autoCapitalize="none" testID="new-photo" />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable onPress={save} disabled={saving} style={[styles.submit, saving && { opacity: 0.6 }]} testID="new-save">
            {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.submitText}>{t(lang, "new_save")}</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field(props: any) {
  const { label, multiline, ...rest } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...rest}
        multiline={multiline}
        placeholderTextColor={colors.onSurfaceTertiary}
        style={[styles.input, multiline && { minHeight: 120, textAlignVertical: "top" }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  field: { marginBottom: spacing.lg },
  fieldLabel: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md, padding: spacing.lg,
    color: colors.onSurface, fontFamily: fonts.body, fontSize: type.lg,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  submit: { backgroundColor: colors.brand, paddingVertical: spacing.lg, borderRadius: radius.pill, alignItems: "center", marginTop: spacing.xl },
  submitText: { color: colors.surface, fontFamily: fonts.body, fontWeight: "700", fontSize: 14, letterSpacing: 2, textTransform: "uppercase" },
  error: { color: colors.error, textAlign: "center", marginVertical: spacing.md, fontFamily: fonts.body },
});
