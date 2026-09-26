import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/lib/auth";

function AuthGate() {
  const auth = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "loading") return;
    const inAuth = segments[0] === "login";
    // The waiter section authenticates itself with a device token and a PIN.
    const inWaiter = segments[0] === "waiter";
    if (auth.status === "unauthenticated" && !inAuth && !inWaiter) router.replace("/login");
    if (auth.status === "authenticated" && inAuth) router.replace("/");
  }, [auth.status, segments]);

  return (
    <>
      <StatusBar style="light" backgroundColor="#0b2c46" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
