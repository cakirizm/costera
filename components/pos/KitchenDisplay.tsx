"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { posFailureText } from "@/lib/pos/messages";
import { advanceKitchenLinesAction } from "@/lib/pos-actions";

type Line = {
  id: string;
  name: string;
  quantity: number;
  note: string | null;
  status: string;
  modifiers: string[];
  sentAt: string | null;
};

type Ticket = {
  orderId: string;
  code: number;
  tableName: string | null;
  channel: string;
  since: string;
  lines: Line[];
};

/** How long a ticket may sit before the card starts shouting. */
const WARN_MINUTES = 10;
const LATE_MINUTES = 20;
const POLL_MS = 5000;

export function KitchenDisplay({
  locale,
  stations,
  activeStation,
  canReturnToTill,
  tickets,
}: {
  locale: AppLocale;
  stations: string[];
  activeStation: string | null;
  canReturnToTill: boolean;
  tickets: Ticket[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Set after mount so the server and client render the same first paint; a
  // clock rendered on the server is stale by the time it reaches the screen.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Scheduled rather than set inline: a synchronous setState inside an effect
    // costs an extra render pass on every mount of this always-on screen.
    const update = () => setNow(Date.now());
    const first = setTimeout(update, 0);
    const tick = setInterval(update, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(tick);
    };
  }, []);

  // The kitchen screen is never touched for minutes at a time, so it pulls
  // rather than waiting for a navigation. SSE replaces this once the ticket
  // volume justifies holding a connection open per screen.
  useEffect(() => {
    const poll = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(poll);
  }, [router]);

  const advance = (lineIds: string[], to: "PREPARING" | "READY" | "SERVED") =>
    startTransition(async () => {
      setError(null);
      const result = await advanceKitchenLinesAction(lineIds, to);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });

  const minutesSince = (iso: string): number | null =>
    now === null ? null : Math.max(0, Math.floor((now - Date.parse(iso)) / 60000));

  const setStation = (station: string | null) =>
    router.push(station ? `/pos/kds?station=${encodeURIComponent(station)}` : "/pos/kds");

  return (
    <div className="pos-kds">
      <div className="pos-kds-bar">
        <div className="pos-area-tabs" style={{ margin: 0 }}>
          <button type="button" aria-pressed={activeStation === null} onClick={() => setStation(null)}>
            {tx(locale, "All stations", "Tüm istasyonlar")}
          </button>
          {stations.map((station) => (
            <button
              key={station}
              type="button"
              aria-pressed={activeStation === station}
              onClick={() => setStation(station)}
            >
              {station}
            </button>
          ))}
        </div>
        <span className="pos-kds-count">
          {tickets.length} {tx(locale, "open tickets", "açık adisyon")}
        </span>
        {canReturnToTill && (
          <button type="button" className="pos-btn ghost" onClick={() => router.push("/pos")}>
            {tx(locale, "Tables", "Masalar")}
          </button>
        )}
      </div>

      {error && (
        <p className="pos-error" style={{ margin: "0 20px 12px" }}>
          {posFailureText(error, locale)}
        </p>
      )}

      <div className="pos-kds-grid">
        {tickets.length === 0 && (
          <p className="pos-kds-empty">{tx(locale, "Nothing waiting.", "Bekleyen sipariş yok.")}</p>
        )}

        {tickets.map((ticket) => {
          const age = minutesSince(ticket.since);
          const tone = age === null ? "" : age >= LATE_MINUTES ? "late" : age >= WARN_MINUTES ? "warn" : "";
          const unready = ticket.lines.filter((line) => line.status !== "READY").map((line) => line.id);
          const allIds = ticket.lines.map((line) => line.id);

          return (
            <article key={ticket.orderId} className={`pos-kds-ticket ${tone}`}>
              <header className="pos-kds-head">
                <b>#{ticket.code}</b>
                <small>{ticket.tableName ?? ticket.channel}</small>
                <span className="pos-kds-age">{age === null ? "—" : `${age}′`}</span>
              </header>

              <ul className="pos-kds-lines">
                {ticket.lines.map((line) => (
                  <li key={line.id} className={line.status === "READY" ? "ready" : ""}>
                    <span className="pos-kds-qty">{line.quantity}x</span>
                    <span>
                      <span className="pos-kds-name">{line.name}</span>
                      {line.modifiers.length > 0 && <small>{line.modifiers.join(", ")}</small>}
                      {line.note && <small className="pos-kds-note">{line.note}</small>}
                    </span>
                    {line.status === "SENT" && (
                      <button
                        type="button"
                        className="pos-btn"
                        disabled={pending}
                        onClick={() => advance([line.id], "PREPARING")}
                      >
                        {tx(locale, "Start", "Başla")}
                      </button>
                    )}
                    {line.status === "PREPARING" && (
                      <button
                        type="button"
                        className="pos-btn good"
                        disabled={pending}
                        onClick={() => advance([line.id], "READY")}
                      >
                        {tx(locale, "Ready", "Hazır")}
                      </button>
                    )}
                    {line.status === "READY" && (
                      <button
                        type="button"
                        className="pos-btn ghost"
                        disabled={pending}
                        onClick={() => advance([line.id], "SERVED")}
                      >
                        {tx(locale, "Served", "Teslim")}
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <div className="pos-kds-foot">
                <button
                  type="button"
                  className="pos-btn good"
                  disabled={pending || unready.length === 0}
                  onClick={() => advance(unready, "READY")}
                >
                  {tx(locale, "All ready", "Hepsi hazır")}
                </button>
                <button
                  type="button"
                  className="pos-btn ghost"
                  disabled={pending}
                  onClick={() => advance(allIds, "SERVED")}
                >
                  {tx(locale, "All served", "Hepsi teslim")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
