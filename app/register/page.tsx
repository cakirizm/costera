import { getRequestLocale } from "@/lib/costera/i18n";
import { translateArabic, localePath } from "@/lib/costera/locale";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";

export default async function RegisterPage() {
  const locale = await getRequestLocale();
  const label = (text: string) => locale === "ar" ? translateArabic(text) : text;
  return (
    <AuthShell locale={locale}
      eyebrow={label("CREATE ACCOUNT")}
      title={label("Start controlling cost.")}
      subtitle={label("Create your COSTERA workspace to connect POS, recipes, inventory and delivery data.")}
      visualTitle={label("One clear view of cost, stock and variance.")}
      visualText={label("Set up your restaurant workspace in under a minute.")}
    >
      <RegisterForm locale={locale} />
    </AuthShell>
  );
}
