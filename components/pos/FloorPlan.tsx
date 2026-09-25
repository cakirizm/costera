"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { moneyMinor } from "@/lib/pos/money";
import { posFailureText } from "@/lib/pos/messages";
import { openOrderAction, setupTerminalAction } from "@/lib/pos-actions";

type Table = {
  id: string;
  name: string;
  seats: number;
  order: { id: string; code: number; totalMinor: number; openedAt: Date; guestCount: number } | null;
};

type Area = { id: string; name: string; tables: Table[] };

type CounterOrder = { id: string; code: number; totalMinor: number; channel: string };

/** Minutes a ticket has been open, rendered without a live clock to keep the
 *  server and client markup identical on first paint. */
function openedMinutes(openedAt: Date): number {
  return Math.max(0, Math.round((Date.now() - new Date(openedAt).getTime()) / 60000));
}

export function FloorPlan({
  locale,
  currency,
  areas,
  counterOrders,
  ready,
}: {
  locale: AppLocale;
  currency: string;
  areas: Area[];
  counterOrders: CounterOrder[];
  ready: boolean;
}) {
  const router = useRouter();
  const [activeArea, setActiveArea] = useState(areas[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ready) {
    return (
      <main className="pos-main">
        <div className="pos-empty">
          <h2>{tx(locale, "The terminal has no menu yet.", "Terminalde henüz menü yok.")}</h2>
          <p>
            {tx(
              locale,
              "Set up a floor plan and a menu to start taking orders. If this workspace already has menu items, they are mirrored so every ticket reaches the cost engine.",
              "Sipariş almaya başlamak için salon planı ve menü oluşturun. Çalışma alanında menü varsa birebir aktarılır, böylece her adisyon maliyet motoruna ulaşır.",
            )}
          </p>
          {error && <p className="pos-error">{posFailureText(error, locale)}</p>}
          <button
            type="button"
            className="pos-btn primary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await setupTerminalAction();
                if (!result.ok) setError(result.error);
                else router.refresh();
              })
            }
          >
            {tx(locale, "Set up the terminal", "Terminali kur")}
          </button>
        </div>
      </main>
    );
  }

  const area = areas.find((a) => a.id === activeArea) ?? areas[0];

  const openTicket = (tableId: string | null) =>
    startTransition(async () => {
      setError(null);
      const result = await openOrderAction({
        clientOrderId: crypto.randomUUID(),
        tableId,
        channel: tableId ? "Dine-in" : "Takeaway",
      });
      if (!result.ok) setError(result.error);
      else router.push(`/pos/order/${result.data.id}`);
    });

  return (
    <main className="pos-main">
      {error && <p className="pos-error">{posFailureText(error, locale)}</p>}

      <div className="pos-area-tabs">
        {areas.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === area?.id}
            onClick={() => setActiveArea(item.id)}
          >
            {item.name}
          </button>
        ))}
        <button type="button" className="pos-btn primary" disabled={pending} onClick={() => openTicket(null)}>
          {tx(locale, "+ Counter ticket", "+ Paket / Kasa adisyonu")}
        </button>
      </div>

      <div className="pos-tables">
        {area?.tables.map((table) => (
          <button
            key={table.id}
            type="button"
            className={`pos-table ${table.order ? "busy" : "free"}`}
            disabled={pending}
            aria-label={
              table.order
                ? `${table.name} - ${tx(locale, "open ticket", "açık adisyon")} #${table.order.code}`
                : `${table.name} - ${tx(locale, "free, open a ticket", "boş, adisyon aç")}`
            }
            onClick={() =>
              table.order ? router.push(`/pos/order/${table.order.id}`) : openTicket(table.id)
            }
          >
            <span className="pos-table-name">{table.name}</span>
            <span className="pos-table-seats">
              {table.seats} {tx(locale, "seats", "kişilik")}
            </span>
            {table.order ? (
              <>
                <span className="pos-table-total">{moneyMinor(table.order.totalMinor, currency)}</span>
                <span className="pos-table-meta">
                  #{table.order.code} · {openedMinutes(table.order.openedAt)} {tx(locale, "min", "dk")}
                </span>
              </>
            ) : (
              <span className="pos-table-total">{tx(locale, "Free", "Boş")}</span>
            )}
          </button>
        ))}
      </div>

      {counterOrders.length > 0 && (
        <>
          <div className="pos-section-head" style={{ marginTop: 28 }}>
            <span>{tx(locale, "NO TABLE", "MASASIZ")}</span>
            <h2>{tx(locale, "Counter & takeaway", "Kasa & paket")}</h2>
          </div>
          <div className="pos-counter-list">
            {counterOrders.map((order) => (
              <a key={order.id} href={`/pos/order/${order.id}`}>
                <span>
                  #{order.code} · {order.channel}
                </span>
                <b>{moneyMinor(order.totalMinor, currency)}</b>
              </a>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
