import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWaiter } from "../../src/lib/waiter-auth";
import { colors, spacing } from "../../src/lib/theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const MAX_PIN = 6;

const MESSAGES: Record<string, string> = {
  PIN_REJECTED: "PIN tanınmadı.",
  NOT_A_WAITER: "Bu PIN sipariş alamaz.",
  TOO_MANY_ATTEMPTS: "Çok fazla deneme. Biraz bekleyin.",
  DEVICE_UNKNOWN: "Bu telefonun kaydı iptal edilmiş.",
};

/** Per-shift sign-in. The PIN is never shown back and never stored. */
export default function PinScreen() {
  const waiter = useWaiter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (value: string) => {
    setBusy(true);
    const result = await waiter.signIn(value);
    setBusy(false);
    setPin("");
    if (!result.ok) setError(MESSAGES[result.error ?? ""] ?? "Giriş yapılamadı.");
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.body}>
        <Text style={s.title}>PIN kodunuz</Text>

        <View style={s.dots}>
          {Array.from({ length: MAX_PIN }).map((_, i) => (
            <View key={i} style={[s.dot, i < pin.length && s.dotOn]} />
          ))}
        </View>

        {error && <Text style={s.error}>{error}</Text>}

        <View style={s.keys}>
          {KEYS.map((key) => (
            <TouchableOpacity
              key={key}
              style={s.key}
              disabled={busy}
              onPress={() => {
                setError(null);
                setPin((prev) => (prev.length >= MAX_PIN ? prev : prev + key));
              }}
            >
              <Text style={s.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[s.key, s.keyGhost]}
            disabled={busy || pin.length === 0}
            onPress={() => setPin((prev) => prev.slice(0, -1))}
          >
            <Text style={s.keyText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.key}
            disabled={busy}
            onPress={() => {
              setError(null);
              setPin((prev) => (prev.length >= MAX_PIN ? prev : prev + "0"));
            }}
          >
            <Text style={s.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.key, s.keyGo, pin.length < 4 && s.keyOff]}
            disabled={busy || pin.length < 4}
            onPress={() => submit(pin)}
          >
            <Text style={[s.keyText, s.keyGoText]}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.forget} onPress={() => waiter.forgetDevice()}>
          <Text style={s.forgetText}>Bu telefonun kaydını sil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy },
  body: { flex: 1, padding: spacing.xl, justifyContent: "center" },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: spacing.lg },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.25)",
  },
  dotOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  error: {
    color: "#ffc4be",
    textAlign: "center",
    marginBottom: spacing.md,
    fontSize: 14,
  },
  keys: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  key: {
    width: "30%",
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.12)",
    backgroundColor: "#0d2c48",
    alignItems: "center",
    justifyContent: "center",
  },
  keyGhost: { backgroundColor: "transparent" },
  keyGo: { backgroundColor: colors.gold, borderColor: colors.gold },
  keyOff: { opacity: 0.4 },
  keyText: { color: colors.white, fontSize: 24, fontWeight: "600" },
  keyGoText: { color: "#241a08" },
  forget: { alignItems: "center", marginTop: spacing.xxl },
  forgetText: { color: "#8a97a0", fontSize: 13 },
});
