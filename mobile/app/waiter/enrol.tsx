import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useWaiter } from "../../src/lib/waiter-auth";
import { colors, spacing } from "../../src/lib/theme";

/**
 * One-time enrolment. The owner issues a device token in
 * Dashboard > Integrations and the waiter types it in once; after this the
 * phone only ever asks for a PIN.
 */
export default function EnrolScreen() {
  const waiter = useWaiter();
  const router = useRouter();
  const [token, setToken] = useState("");

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.body}>
        <Text style={s.title}>Bu telefonu tanıt</Text>
        <Text style={s.help}>
          Panodan Entegrasyonlar {">"} Terminaller bölümünde &quot;Garson telefonu&quot; olarak bir
          cihaz ekleyin ve size bir kez gösterilen anahtarı buraya yazın. Bu işlem telefon başına bir
          defa yapılır.
        </Text>

        <TextInput
          style={s.input}
          value={token}
          onChangeText={setToken}
          placeholder="Cihaz anahtarı"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />

        <TouchableOpacity
          style={[s.button, token.trim().length < 20 && s.buttonOff]}
          disabled={token.trim().length < 20}
          onPress={async () => {
            await waiter.enrol(token);
            router.replace("/waiter/pin");
          }}
        >
          <Text style={s.buttonText}>Devam</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.back} onPress={() => router.replace("/")}>
          <Text style={s.backText}>Geri dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy },
  body: { flex: 1, padding: spacing.xl, justifyContent: "center" },
  title: { color: colors.white, fontSize: 22, fontWeight: "700", marginBottom: spacing.md },
  help: { color: "#9fb3c8", fontSize: 14, lineHeight: 21, marginBottom: spacing.xl },
  input: {
    backgroundColor: "rgba(0,0,0,.25)",
    borderColor: "rgba(255,255,255,.12)",
    borderWidth: 1,
    borderRadius: 12,
    color: colors.white,
    fontSize: 15,
    minHeight: 84,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOff: { opacity: 0.4 },
  buttonText: { color: "#241a08", fontSize: 16, fontWeight: "700" },
  back: { alignItems: "center", marginTop: spacing.xl },
  backText: { color: "#9fb3c8", fontSize: 14 },
});
