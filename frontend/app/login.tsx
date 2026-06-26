import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { colors, fonts, radius, spacing, type } from "@/src/theme";
import { useApp } from "@/src/contexts/AppContext";
import { t } from "@/src/i18n";
import ScreenHeader from "@/src/components/ScreenHeader";

export default function Login() {
  const { lang, login } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("alberto");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null); setLoading(true);
    try {
      await login(username, password);
      router.back();
    } catch {
      setError(t(lang, "login_error"));
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t(lang, "login_title")} showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.body}>
          <Text style={styles.subtitle}>{t(lang, "login_subtitle")}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t(lang, "login_user")}</Text>
            <TextInput
              value={username} onChangeText={setUsername}
              autoCapitalize="none" autoCorrect={false}
              placeholderTextColor={colors.onSurfaceTertiary}
              style={styles.input}
              testID="login-username"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t(lang, "login_pass")}</Text>
            <TextInput
              value={password} onChangeText={setPassword}
              secureTextEntry autoCapitalize="none"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={styles.input}
              testID="login-password"
            />
          </View>

          {error && <Text style={styles.error} testID="login-error">{error}</Text>}

          <Pressable onPress={submit} style={styles.submit} disabled={loading} testID="login-submit">
            {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.submitText}>{t(lang, "login_submit")}</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, padding: spacing.xl, justifyContent: "center" },
  subtitle: { color: colors.onSurfaceSecondary, fontFamily: fonts.display, fontStyle: "italic", fontSize: type.lg, marginBottom: spacing.xxl },
  field: { marginBottom: spacing.lg },
  label: { color: colors.brand, fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.md,
    padding: spacing.lg, color: colors.onSurface, fontFamily: fonts.body, fontSize: type.lg,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  error: { color: colors.error, textAlign: "center", fontFamily: fonts.body, marginVertical: spacing.md },
  submit: { backgroundColor: colors.brand, paddingVertical: spacing.lg, borderRadius: radius.pill, alignItems: "center", marginTop: spacing.lg },
  submitText: { color: colors.surface, fontFamily: fonts.body, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
});
