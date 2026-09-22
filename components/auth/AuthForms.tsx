"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  authenticateAction,
  forgotPasswordAction,
  registerAction,
  resetPasswordAction,
  type ActionState,
} from "@/lib/auth-actions";

const initial: ActionState = {};

function FormError({ state }: { state: ActionState }) {
  if (!state.error) return null;
  return <div className="auth-form-error" role="alert">{state.error}</div>;
}

function FormNotice({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return <div className="auth-form-notice" role="status">{state.message}</div>;
}

export function LoginForm({ resetDone }: { resetDone?: boolean }) {
  const [state, action, pending] = useActionState(authenticateAction, initial);
  return (
    <form action={action} className="auth-form">
      {resetDone && <div className="auth-form-notice" role="status">Şifreniz güncellendi. Yeni şifrenizle giriş yapın.</div>}
      <FormError state={state} />
      <label>Work email<input name="email" type="email" placeholder="name@restaurant.com" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" placeholder="••••••••" autoComplete="current-password" required /></label>
      <div className="auth-meta">
        <label className="check-label"><input type="checkbox" name="remember" /> Remember me</label>
        <Link href="/forgot-password">Forgot password?</Link>
      </div>
      <button className="button button-dark full-button" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign In"}
      </button>
      <p className="auth-foot">No account yet? <Link href="/register">Create your workspace</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className="auth-form">
      <FormError state={state} />
      <label>Your name<input name="name" type="text" placeholder="Mehmet Çelik" autoComplete="name" required /></label>
      <label>Restaurant / group name<input name="restaurant" type="text" placeholder="Demo Restaurant Group" required /></label>
      <label>Work email<input name="email" type="email" placeholder="name@restaurant.com" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" placeholder="En az 8 karakter" autoComplete="new-password" minLength={8} required /></label>
      <button className="button button-dark full-button" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create workspace"}
      </button>
      <p className="auth-foot">Already have an account? <Link href="/login">Sign in</Link></p>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={action} className="auth-form">
      <FormError state={state} />
      <FormNotice state={state} />
      {!state.ok && (
        <>
          <label>Work email<input name="email" type="email" placeholder="name@restaurant.com" autoComplete="email" required /></label>
          <button className="button button-dark full-button" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </>
      )}
      <p className="auth-foot"><Link href="/login">← Back to sign in</Link></p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="auth-form">
      <FormError state={state} />
      <input type="hidden" name="token" value={token} />
      <label>New password<input name="password" type="password" placeholder="En az 8 karakter" autoComplete="new-password" minLength={8} required /></label>
      <button className="button button-dark full-button" type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </button>
      <p className="auth-foot"><Link href="/login">← Back to sign in</Link></p>
    </form>
  );
}
