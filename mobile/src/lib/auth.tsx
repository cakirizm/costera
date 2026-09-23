import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { login as apiLogin, logout as apiLogout, type MobileSession } from "./api";

type User = { id: string; name: string | null; email: string };

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; token: string; user: User };

type AuthCtx = AuthState & {
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const Context = createContext<AuthCtx>({
  status: "loading",
  signIn: async () => ({ ok: false }),
  signOut: async () => {},
});

const TOKEN_KEY = "costera_token";
const USER_KEY = "costera_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const raw = await SecureStore.getItemAsync(USER_KEY);
      if (token && raw) {
        try {
          const user = JSON.parse(raw) as User;
          setState({ status: "authenticated", token, user });
          return;
        } catch {}
      }
      setState({ status: "unauthenticated" });
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    if (!result.ok) return { ok: false, error: result.error };
    const { token, user } = result.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    setState({ status: "authenticated", token, user });
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    if (state.status === "authenticated") {
      await apiLogout(state.token).catch(() => {});
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setState({ status: "unauthenticated" });
  }, [state]);

  return <Context.Provider value={{ ...state, signIn, signOut }}>{children}</Context.Provider>;
}

export function useAuth() {
  return useContext(Context);
}
