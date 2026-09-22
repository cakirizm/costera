import { COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { IntegrationStudio } from "@/components/app/IntegrationStudio";

export default function IntegrationsPage() {
  return (
    <COSTERAAppShell active="/dashboard/integrations" title="Integrations" eyebrow="CONNECTION CONTROL">
      <IntegrationStudio />
    </COSTERAAppShell>
  );
}
