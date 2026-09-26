import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { bootstrap, signIn as apiSignIn, signOut as apiSignOut, type WaiterSession } from "./waiter";

/**
 * Two-step identity for the handheld.
 *
 * The device token is enrolled once by the owner and stays on the phone; the
 * PIN is entered per shift. Losing the phone is answered by revoking the device
 * in the dashboard, and a waiter leaving is answered by revoking their PIN -
 * neither needs anyone to change a password.
 *
 * Kept entirely separate from the owner's account session in auth.tsx: the two
 * never share a token, and a waiter can use a phone that has never been logged
 * into an account.
 */

const DEVICE_KEY = "costera_waiter_device";
const TOKEN_KEY = "costera_waiter_token";
const SESSION_KEY = "costera_waiter_session";

type State =
  | { status: "loading" }
  | { status: "unenrolled" }
  | { status: "locked"; deviceToken: string }
  | { status: "ready"; deviceToken: string; token: string; session: WaiterSession };

type Ctx = State & {
  enrol: (deviceToken: string) => Promise<void>;
  signIn: (pin: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  forgetDevice: () => Promise<void>;
};

const Context = createContext<Ctx>({
  status: "loading",
  enrol: async () => {},
  signIn: async () => ({ ok: false }),
  signOut: async () => {},
  forgetDevice: async () => {},
});

export function WaiterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    (async () => {
      const deviceToken = await SecureStore.getItemAsync(DEVICE_KEY);
      if (!deviceToken) {
        setState({ status: "unenrolled" });
        return;
      }

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (!token || !raw) {
        setState({ status: "locked", deviceToken });
        return;
      }

      // A stored token proves nothing: the shift may have ended, the PIN may be
      // revoked. One cheap call decides, so the waiter is not shown a floor plan
      // that every tap will reject.
      const probe = await bootstrap(token);
      if (!probe.ok) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(SESSION_KEY);
        setState({ status: "locked", deviceToken });
        return;
      }

      try {
        setState({
          status: "ready",
          deviceToken,
          token,
          session: JSON.parse(raw) as WaiterSession,
        });
      } catch {
        setState({ status: "locked", deviceToken });
      }
    })();
  }, []);

  const enrol = useCallback(async (deviceToken: string) => {
    const trimmed = deviceToken.trim();
    await SecureStore.setItemAsync(DEVICE_KEY, trimmed);
    setState({ status: "locked", deviceToken: trimmed });
  }, []);

  const signIn = useCallback(
    async (pin: string) => {
      const deviceToken =
        state.status === "locked" || state.status === "ready"
          ? state.deviceToken
          : await SecureStore.getItemAsync(DEVICE_KEY);
      if (!deviceToken) return { ok: false, error: "DEVICE_UNKNOWN" };

      const result = await apiSignIn(deviceToken, pin);
      if (!result.ok) {
        // The device itself was revoked, so the phone has to be enrolled again.
        if (result.error === "DEVICE_UNKNOWN") {
          await SecureStore.deleteItemAsync(DEVICE_KEY);
          setState({ status: "unenrolled" });
        }
        return { ok: false, error: result.error };
      }

      await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(result.data));
      setState({ status: "ready", deviceToken, token: result.data.token, session: result.data });
      return { ok: true };
    },
    [state],
  );

  const signOut = useCallback(async () => {
    if (state.status === "ready") {
      // Best effort: the phone is handed over whether or not the server hears.
      await apiSignOut(state.token).catch(() => undefined);
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_KEY);
    const deviceToken =
      state.status === "ready" || state.status === "locked" ? state.deviceToken : null;
    setState(deviceToken ? { status: "locked", deviceToken } : { status: "unenrolled" });
  }, [state]);

  const forgetDevice = useCallback(async () => {
    await SecureStore.deleteItemAsync(DEVICE_KEY);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setState({ status: "unenrolled" });
  }, []);

  return (
    <Context.Provider value={{ ...state, enrol, signIn, signOut, forgetDevice }}>
      {children}
    </Context.Provider>
  );
}

export function useWaiter() {
  return useContext(Context);
}
