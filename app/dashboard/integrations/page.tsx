import { COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { IntegrationStudio } from "@/components/app/IntegrationStudio";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function IntegrationsPage() {
  const locale = await getAppLocale();
  return (
    <COSTERAAppShell
      active="/dashboard/integrations"
      locale={locale}
      title={tx(locale,"Integrations","Entegrasyonlar")}
      eyebrow={tx(locale,"CONNECTION CONTROL","BAĞLANTI KONTROLÜ")}
    >
      <IntegrationStudio locale={locale} />
    </COSTERAAppShell>
  );
}
