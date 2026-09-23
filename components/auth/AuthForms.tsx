"use client";

import Link from "next/link";
import { translateArabic, localePath, type AppLocale } from "@/lib/costera/locale";
import { useActionState } from "react";
import {
  authenticateAction,
  forgotPasswordAction,
  registerAction,
  resetPasswordAction,
  type ActionState,
} from "@/lib/auth-actions";

const initial: ActionState = {};

function FormError({ state, locale }: { state: ActionState; locale: AppLocale }) {
  if (!state.error) return null;
  return <div className="auth-form-error" role="alert">{locale === "ar" ? translateArabic(state.error) : state.error}</div>;
}

function FormNotice({ state, locale }: { state: ActionState; locale: AppLocale }) {
  if (!state.message) return null;
  return <div className="auth-form-notice" role="status">{locale === "ar" ? translateArabic(state.message) : state.message}</div>;
}

export function LoginForm({ resetDone, locale = "en" }: { resetDone?: boolean; locale?: AppLocale }) {
  const label = (text: string) => locale === "ar" ? translateArabic(text) : text;
  const [state, action, pending] = useActionState(authenticateAction, initial);
  return (
    <form action={action} className="auth-form">
      {resetDone && <div className="auth-form-notice" role="status">{label("Şifreniz güncellendi. Yeni şifrenizle giriş yapın.")}</div>}
      <FormError locale={locale} state={state} />
      <label>{label("Work email")}<input name="email" type="email" placeholder="name@restaurant.com" autoComplete="email" required /></label>
      <label>{label("Password")}<input name="password" type="password" placeholder="••••••••" autoComplete="current-password" required /></label>
      <div className="auth-meta">
        <label className="check-label"><input type="checkbox" name="remember" /> {label("Remember me")}</label>
        <Link href={localePath(locale, "/forgot-password")}>{label("Forgot password?")}</Link>
      </div>
      <button className="button button-dark full-button" type="submit" disabled={pending}>
        {pending ? label("Signing in…") : label("Sign In")}
      </button>
      <p className="auth-foot">{label("No account yet?")} <Link href={localePath(locale, "/register")}>{label("Create your workspace")}</Link></p>
    </form>
  );
}

export function RegisterForm({ locale = "en" }: { locale?: AppLocale }) {
  const label = (text: string) => locale === "ar" ? translateArabic(text) : text;
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className="auth-form">
      <FormError locale={locale} state={state} />
      <label>{label("Your name")}<input name="name" type="text" placeholder={label("Mehmet Çelik")} autoComplete="name" required /></label>
      <label>{label("Restaurant / group name")}<input name="restaurant" type="text" placeholder={label("Demo Restaurant Group")} required /></label>
      <label>{label("Work email")}<input name="email" type="email" placeholder="name@restaurant.com" autoComplete="email" required /></label>
      <label>{label("Password")}<input name="password" type="password" placeholder={label("En az 8 karakter")} autoComplete="new-password" minLength={8} required /></label>
      <button className="button button-dark full-button" type="submit" disabled={pending}>
        {pending ? label("Creating…") : label("Create workspace")}
      </button>
      <p className="auth-foot">{label("Already have an account?")} <Link href={localePath(locale, "/login")}>{label("Sign in")}</Link></p>
    </form>
  );
}

export function ForgotForm({ locale = "en" }: { locale?: AppLocale }) {
  const label = (text: string) => locale === "ar" ? translateArabic(text) : text;
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={action} className="auth-form">
      <FormError locale={locale} state={state} />
      <FormNotice locale={locale} state={state} />
      {!state.ok && (
        <>
          <label>{label("Work email")}<input name="email" type="email" placeholder="name@restaurant.com" autoComplete="email" required /></label>
          <button className="button button-dark full-button" type="submit" disabled={pending}>
            {pending ? label("Sending…") : label("Send reset link")}
          </button>
        </>
      )}
      <p className="auth-foot"><Link href={localePath(locale, "/login")}>{label("← Back to sign in")}</Link></p>
    </form>
  );
}

export function ResetForm({ token, locale = "en" }: { token: string; locale?: AppLocale }) {
  const label = (text: string) => locale === "ar" ? translateArabic(text) : text;
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="auth-form">
      <FormError locale={locale} state={state} />
      <input type="hidden" name="token" value={token} />
      <label>{label("New password")}<input name="password" type="password" placeholder={label("En az 8 karakter")} autoComplete="new-password" minLength={8} required /></label>
      <button className="button button-dark full-button" type="submit" disabled={pending}>
        {pending ? label("Updating…") : label("Update password")}
      </button>
      <p className="auth-foot"><Link href={localePath(locale, "/login")}>{label("← Back to sign in")}</Link></p>
    </form>
  );
}
