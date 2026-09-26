"use client";

import { useEffect, useState } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { moneyMinor } from "@/lib/pos/money";
import { enqueue, listQueue, type OutboxEntry } from "@/lib/pos/offline/outbox";
import {
  orderIdFromPath,
  readCachedMenu,
  readCachedOrder,
  readMostRecentOrder,
  type CachedMenu,
  type CachedOrder,
} from "@/lib/pos/offline/ticket-cache";

type Queued = { clientLineId: string; name: string; priceMinor: number };

/** Queue entries for this ticket, named from the cached menu. */
function queuedFor(queue: OutboxEntry[], orderId: string | null, menu: CachedMenu | null): Queued[] {
  if (!orderId) return [];
  const products = new Map(
    (menu?.categories ?? []).flatMap((c) => c.products).map((p) => [p.id, p]),
  );

  return queue
    .filter((entry) => entry.payload.orderId === orderId)
    .flatMap((entry) =>
      entry.payload.items.map((item) => {
        const product = products.get(item.productId);
        return {
          clientLineId: item.clientLineId,
          name: product?.name ?? item.productId,
          priceMinor: product?.priceMinor ?? 0,
        };
      }),
    );
}

/**
 * A ticket, from cache, with the network gone.
 *
 * It shows what the server last confirmed and what is still waiting to be sent,
 * and keeps the two visibly apart: a waiter has to be able to tell what the
 * kitchen knows about. Totals are not recalculated here - the server owns
 * pricing, and guessing would put a number on screen that the till later
 * contradicts.
 */
export function OfflineTicket({ locale }: { locale: AppLocale }) {
  const [order, setOrder] = useState<CachedOrder | null>(null);
  const [menu, setMenu] = useState<CachedMenu | null>(null);
  const [queued, setQueued] = useState<Queued[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const id = orderIdFromPath(window.location.pathname);
      const [cachedMenu, cachedOrder, queue] = await Promise.all([
        readCachedMenu(),
        id ? readCachedOrder(id) : readMostRecentOrder(),
        listQueue().catch(() => []),
      ]);
      // Fall back to whichever ticket was cached last, so a shell served for
      // the floor plan still lands the waiter somewhere useful.
      setOrderId(id ?? cachedOrder?.id ?? null);
      setMenu(cachedMenu);
      setOrder(cachedOrder);
      setActiveCategory(cachedMenu?.categories[0]?.id ?? null);
      setQueued(queuedFor(queue, id ?? cachedOrder?.id ?? null, cachedMenu));
      setReady(true);
    })();
  }, []);

  // The moment the network is back, hand over to the real screen: it can reach
  // the server, flush the queue and price the ticket properly.
  useEffect(() => {
    const back = () => window.location.reload();
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, []);

  const currency = menu?.currency ?? "TRY";
  const money = (minor: number) => moneyMinor(minor, currency);

  const add = async (product: { id: string; name: string; priceMinor: number }) => {
    if (!orderId) return;
    const clientLineId = crypto.randomUUID();
    await enqueue({
      id: clientLineId,
      kind: "ADD_LINES",
      payload: { orderId, items: [{ productId: product.id, quantity: 1, clientLineId }] },
    });
    setQueued((prev) => [...prev, { clientLineId, name: product.name, priceMinor: product.priceMinor }]);
  };

  if (!ready) return <main className="pos-main" />;

  if (!orderId || !order) {
    return (
      <main className="pos-main">
        <div className="pos-empty">
          <h2>{tx(locale, "No connection", "Bağlantı yok")}</h2>
          <p>
            {tx(
              locale,
              "This screen could not reach the server and has nothing saved for this table. Orders already sent are safe.",
              "Bu ekran sunucuya ulaşamadı ve bu masa için kayıtlı bir şey yok. Gönderilmiş siparişler güvende.",
            )}
          </p>
          <button type="button" className="pos-btn primary" onClick={() => window.location.reload()}>
            {tx(locale, "Try again", "Tekrar dene")}
          </button>
        </div>
      </main>
    );
  }

  const category = menu?.categories.find((c) => c.id === activeCategory) ?? menu?.categories[0];

  return (
    <div className="pos-order-layout">
      <section className="pos-order-menu">
        <div className="pos-cat-strip">
          {menu?.categories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === category?.id}
              onClick={() => setActiveCategory(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="pos-product-grid">
          {category?.products.map((product) => (
            <button
              key={product.id}
              type="button"
              className="pos-product"
              disabled={product.hasOptions}
              onClick={() => add(product)}
            >
              <span className="pos-product-name">{product.name}</span>
              {product.hasOptions && (
                <span className="pos-unmapped">{tx(locale, "NEEDS NETWORK", "BAĞLANTI GEREKLİ")}</span>
              )}
              <span className="pos-product-price">{money(product.priceMinor)}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="pos-order-cart">
        <div className="pos-cart-head">
          <div>
            <h2>
              {tx(locale, "Ticket", "Adisyon")} #{order.code}
            </h2>
            <small>{tx(locale, "Offline", "Çevrimdışı")}</small>
          </div>
        </div>

        <p className="pos-offline-note">
          <b>{tx(locale, "Offline", "Çevrimdışı")}</b>
          {tx(
            locale,
            " - added items are held on this device and sent when the connection returns.",
            " - eklenen ürünler cihazda tutuluyor ve bağlantı gelince gönderilecek.",
          )}
        </p>

        <div className="pos-cart-lines">
          {order.lines.map((line) => (
            <div key={line.id} className="pos-cart-line sent">
              <span className="pos-qty">{line.quantity}x</span>
              <span>
                <span className="pos-line-name">{line.name}</span>
              </span>
              <span className="pos-line-total">{money(line.lineTotalMinor)}</span>
            </div>
          ))}
          {queued.map((line) => (
            <div key={line.clientLineId} className="pos-cart-line">
              <span className="pos-qty">1x</span>
              <span>
                <span className="pos-line-name">{line.name}</span>
                <small className="pos-line-sub">
                  {tx(locale, "waiting to send", "gönderilmeyi bekliyor")}
                </small>
              </span>
              <span className="pos-line-total">{money(line.priceMinor)}</span>
            </div>
          ))}
        </div>

        <div className="pos-cart-totals">
          <div>
            <span>{tx(locale, "Last confirmed total", "Son onaylanan toplam")}</span>
            <span>{money(order.totalMinor)}</span>
          </div>
          {queued.length > 0 && (
            <div>
              <span>{tx(locale, "Queued (not priced yet)", "Kuyrukta (henüz fiyatlanmadı)")}</span>
              <span>+{money(queued.reduce((sum, line) => sum + line.priceMinor, 0))}</span>
            </div>
          )}
        </div>

        <div className="pos-cart-actions">
          <button
            type="button"
            className="pos-btn block span-2"
            onClick={() => window.location.reload()}
          >
            {tx(locale, "Retry connection", "Bağlantıyı dene")}
          </button>
        </div>
      </aside>
    </div>
  );
}
