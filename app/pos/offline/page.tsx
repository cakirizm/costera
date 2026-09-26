import { OfflineTicket } from "@/components/pos/OfflineTicket";
import { getAppLocale } from "@/lib/costera/i18n";

/**
 * The screen the service worker serves when a terminal navigation cannot reach
 * the server.
 *
 * It renders nothing from the server on purpose: it has to work with the
 * network gone, so everything it shows comes from what the terminal cached
 * locally. The browser keeps the requested URL, so this page can still tell
 * which ticket the waiter was on.
 */
export default async function PosOfflinePage() {
  const locale = await getAppLocale();
  return <OfflineTicket locale={locale} />;
}
