import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../src/lib/auth";
import { colors, spacing } from "../src/lib/theme";
import { t } from "../src/lib/i18n";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setError("");
    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(
        result.error === "INVALID_CREDENTIALS"
          ? t("Invalid credentials")
          : result.error === "RATE_LIMITED"
          ? t("Rate limited")
          : t("Connection error")
      );
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.header}>
          <Text style={s.logo}>COSTERA</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>{t("MOBILE_MONITOR")}</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.title}>{t("Sign In")}</Text>
          <Text style={s.subtitle}>{t("Sign in with your web account")}</Text>

          {error !== "" && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Text style={s.label}>{t("Email")}</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@restoran.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            accessibilityLabel={t("Email")}
          />

          <Text style={s.label}>{t("Password")}</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            editable={!loading}
            onSubmitEditing={handleLogin}
            accessibilityLabel={t("Password")}
          />

          <TouchableOpacity
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={s.buttonText}>{t("Sign In")}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>{t("Read-only footer")}</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  container: { flex: 1, justifyContent: "center", padding: spacing.xl },
  header: { alignItems: "center", marginBottom: spacing.xxl },
  logo: { fontSize: 28, fontWeight: "800", letterSpacing: 4, color: colors.white },
  badge: {
    marginTop: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 2, color: colors.gold },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: 9,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.navy,
    borderRadius: 9,
    padding: 15,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
    borderRadius: 6,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: { fontSize: 13, color: colors.red },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginTop: spacing.xl,
  },
});
