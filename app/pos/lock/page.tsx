import { redirect } from "next/navigation";
import { PinPad } from "@/components/pos/PinPad";
import { getAppLocale } from "@/lib/costera/i18n";
import { terminalUsesPins } from "@/lib/pos/staff-session";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PosLockPage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const restaurantId = ctx?.restaurant?.id;
  if (!restaurantId) redirect("/dashboard");

  // Nothing to unlock if the venue has not set up any PINs.
  if (!(await terminalUsesPins(restaurantId))) redirect("/pos");

  return <PinPad locale={locale} venue={ctx?.restaurant?.name ?? ""} />;
}
