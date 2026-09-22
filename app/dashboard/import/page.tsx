import { COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { DataImporter } from "@/components/app/DataImporter";

export default function ImportPage() {
  return (
    <COSTERAAppShell active="/dashboard/import" title="Data Import" eyebrow="ADAPTER STUDIO">
      <DataImporter />
    </COSTERAAppShell>
  );
}
