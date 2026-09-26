import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { WaiterProvider, useWaiter } from "../../src/lib/waiter-auth";
import { colors } from "../../src/lib/theme";

/**
 * Routes the waiter to whichever step is missing: enrol the phone, enter a PIN,
 * or take orders. Deliberately independent of the account login that guards the
 * rest of the app - a waiter's phone never holds an account.
 */
function WaiterGate() {
  const waiter = useWaiter();
  // expo-router types segments as a tuple of known routes; the waiter sub-routes
  // are not in it yet, so read it as plain strings.
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (waiter.status === "loading") return;

    const step = segments[1];
    if (waiter.status === "unenrolled" && step !== "enrol") router.replace("/waiter/enrol");
    if (waiter.status === "locked" && step !== "pin") router.replace("/waiter/pin");
    if (waiter.status === "ready" && (step === "enrol" || step === "pin")) {
      router.replace("/waiter");
    }
  }, [waiter.status, segments, router]);

  if (waiter.status === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.navy, justifyContent: "center" }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return <Slot />;
}

export default function WaiterLayout() {
  return (
    <WaiterProvider>
      <WaiterGate />
    </WaiterProvider>
  );
}
