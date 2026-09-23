import { getRequestLocale } from "@/lib/costera/i18n";
import { translateArabic, localePath } from "@/lib/costera/locale";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/AuthForms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const locale = await getRequestLocale();
  const label = (text: string) => locale === "ar" ? translateArabic(text) : text;
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell locale={locale}
        eyebrow={label("RESET PASSWORD")}
        title={label("Invalid reset link.")}
        subtitle={label("This password reset link is missing or malformed.")}
        visualTitle={label("Secure access, restored in minutes.")}
        visualText={label("Request a new reset link to continue.")}
      >
        <p className="auth-foot"><Link href={localePath(locale, "/forgot-password")}>{label("Request a new link")}</Link></p>
      </AuthShell>
    );
  }

  return (
    <AuthShell locale={locale}
      eyebrow={label("RESET PASSWORD")}
      title={label("Set a new password.")}
      subtitle={label("Choose a strong password to secure your COSTERA account.")}
      visualTitle={label("Secure access, restored in minutes.")}
      visualText={label("Your new password takes effect immediately.")}
    >
      <ResetForm locale={locale} token={token} />
    </AuthShell>
  );
}
