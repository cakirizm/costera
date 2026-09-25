"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { lockTerminalAction } from "@/lib/staff-actions";

/** Hands the till back to the next person: clears the PIN session, nothing else. */
export function LockButton({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="pos-chip"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await lockTerminalAction();
          router.replace("/pos/lock");
          router.refresh();
        })
      }
    >
      {tx(locale, "Lock", "Kilitle")}
    </button>
  );
}
