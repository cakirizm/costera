import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/lib/auth";

function AuthGate() {
  const auth = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "loading") return;
    const inAuth = segments[0] === "login";
    if (auth.status === "unauthenticated" && !inAuth) router.replace("/login");
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
