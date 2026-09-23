import { getRequestLocale } from "@/lib/costera/i18n";
import { translateArabic, localePath } from "@/lib/costera/locale";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/AuthForms";

export default async function ForgotPasswordPage() {
  const locale = await getRequestLocale();
  const label = (text: string) => locale === "ar" ? translateArabic(text) : text;
  return (
    <AuthShell locale={locale}
      eyebrow={label("RESET PASSWORD")}
      title={label("Forgot your password?")}
      subtitle={label("Enter your work email and we'll send a link to reset your password.")}
      visualTitle={label("Secure access, restored in minutes.")}
      visualText={label("We'll email a one-time reset link valid for 30 minutes.")}
    >
      <ForgotForm locale={locale} />
    </AuthShell>
  );
}
