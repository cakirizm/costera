import { COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { DataImporter } from "@/components/app/DataImporter";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function ImportPage() {
  const locale = await getAppLocale();
  return (
    <COSTERAAppShell
      active="/dashboard/import"
      locale={locale}
      title={tx(locale,"Data Import","Veri Aktarımı")}
      eyebrow={tx(locale,"ADAPTER STUDIO","ADAPTER STÜDYOSU")}
    >
      <DataImporter locale={locale} />
    </COSTERAAppShell>
  );
}
