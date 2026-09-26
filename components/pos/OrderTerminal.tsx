"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { posFailureText } from "@/lib/pos/messages";
import { cacheMenu, cacheOrder } from "@/lib/pos/offline/ticket-cache";
import { useOutbox } from "@/lib/pos/offline/use-outbox";
import { ApprovalSheet } from "./ApprovalSheet";
import { moneyMinor } from "@/lib/pos/money";
import type { TerminalCategory, TerminalProduct } from "@/lib/pos/terminal-repository";
import {
  addLinesAction,
  compLineAction,
  sendToKitchenAction,
  voidLineAction,
} from "@/lib/pos-actions";

export type TerminalOrderLine = {
  id: string;
  clientLineId?: string | null;
  name: string;
  quantity: number;
  lineTotalMinor: number;
  status: string;
  isComped: boolean;
  note: string | null;
  modifiers: { id: string; name: string }[];
};

export type TerminalOrder = {
  id: string;
  code: number;
  status: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  paidMinor: number;
  lines: TerminalOrderLine[];
};

type WriteOff = { kind: "VOID" | "COMP"; lineId: string; label: string };

export function OrderTerminal({
  locale,
  currency,
  menu,
  order,
}: {
  locale: AppLocale;
  currency: string;
  menu: TerminalCategory[];
  order: TerminalOrder;
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(menu[0]?.id ?? "");
  const [sheetProduct, setSheetProduct] = useState<TerminalProduct | null>(null);
  const [chosenModifiers, setChosenModifiers] = useState<string[]>([]);
  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvalFor, setApprovalFor] = useState<WriteOff | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { online, pending: queued, queue, setOnline } = useOutbox();

  // Lines taken while the network was down. They leave this list as soon as the
  // server reports them back, so a flushed queue never shows the item twice.
  const [optimistic, setOptimistic] = useState<TerminalOrderLine[]>([]);
  const storedClientIds = new Set(
    order.lines.map((line) => line.clientLineId).filter((id): id is string => !!id),
  );
  const unsyncedLines = optimistic.filter((line) => !storedClientIds.has(line.clientLineId ?? ""));

  // Kept up to date on every server render, so a reload during an outage has
  // something to show instead of an empty table.
  useEffect(() => {
    void cacheOrder({
      id: order.id,
      code: order.code,
      status: order.status,
      totalMinor: order.totalMinor,
      lines: order.lines.map((line) => ({
        id: line.id,
        name: line.name,
        quantity: line.quantity,
        lineTotalMinor: line.lineTotalMinor,
        status: line.status,
      })),
    });
  }, [order]);

  useEffect(() => {
    void cacheMenu({
      currency,
      categories: menu.map((c) => ({
        id: c.id,
        name: c.name,
        products: c.products.map((p) => ({
          id: p.id,
          name: p.name,
          priceMinor: p.priceMinor,
          hasOptions: p.modifierGroups.length > 0,
        })),
      })),
    });
  }, [menu, currency]);

  const category = menu.find((c) => c.id === activeCategory) ?? menu[0];
  const hasUnsent = order.lines.some((line) => line.status === "NEW");
  const money = (minor: number) => moneyMinor(minor, currency);

  const act = (work: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await work();
      if (!result.ok) setError(result.error ?? "INVALID_INPUT");
      else router.refresh();
    });

  /**
   * Run a void or a comp, asking for a manager PIN only if the server says one
   * is needed. The terminal never decides that itself.
   */
  const writeOff = (target: WriteOff, approvalPin?: string) =>
    startTransition(async () => {
      setError(null);
      const result =
        target.kind === "VOID"
          ? await voidLineAction(target.lineId, "Terminal", approvalPin)
          : await compLineAction(target.lineId, "Terminal", approvalPin);

      if (result.ok) {
        setApprovalFor(null);
        setApprovalError(null);
        router.refresh();
        return;
      }

      if (result.error === "APPROVAL_REQUIRED") {
        setApprovalFor(target);
        setApprovalError(null);
        return;
      }
      if (approvalPin) {
        setApprovalError(posFailureText(result.error ?? "INVALID_INPUT", locale));
        return;
      }
      setError(result.error ?? "INVALID_INPUT");
    });

  const addProduct = (product: TerminalProduct, modifierIds: string[]) => {
    const clientLineId = crypto.randomUUID();
    const item = { productId: product.id, quantity: 1, clientLineId, modifierIds };

    const modifierTotal = modifierIds.length
      ? menu
          .flatMap((c) => c.products)
          .find((p) => p.id === product.id)
          ?.modifierGroups.flatMap((g) => g.modifiers)
          .filter((m) => modifierIds.includes(m.id))
          .reduce((sum, m) => sum + m.priceMinor, 0) ?? 0
      : 0;

    const showLocally = () =>
      setOptimistic((prev) => [
        ...prev,
        {
          id: clientLineId,
          clientLineId,
          name: product.name,
          quantity: 1,
          lineTotalMinor: product.priceMinor + modifierTotal,
          status: "NEW",
          isComped: false,
          note: null,
          modifiers: [],
        },
      ]);

    if (!online) {
      showLocally();
      void queue({
        id: clientLineId,
        kind: "ADD_LINES",
        payload: { orderId: order.id, items: [item] },
      });
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const result = await addLinesAction({ orderId: order.id, items: [item] });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch {
        // The request never reached the server. Keep the tap and replay it.
        setOnline(false);
        showLocally();
        await queue({
          id: clientLineId,
          kind: "ADD_LINES",
          payload: { orderId: order.id, items: [item] },
        });
      }
    });
  };

  const tapProduct = (product: TerminalProduct) => {
    // Products with options open a sheet; everything else is a single tap, which
    // is what a busy waiter actually needs.
    if (product.modifierGroups.length > 0) {
      setChosenModifiers([]);
      setSheetProduct(product);
      return;
    }
    addProduct(product, []);
  };

  return (
    <div className="pos-order-layout">
      <section className="pos-order-menu">
        <div className="pos-cat-strip">
          {menu.map((item) => (
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
              disabled={pending}
              onClick={() => tapProduct(product)}
            >
              <span className="pos-product-name">{product.name}</span>
              {!product.isMapped && (
                <span className="pos-unmapped">{tx(locale, "NOT MAPPED", "EŞLEŞMEMİŞ")}</span>
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
            <small>{order.status}</small>
          </div>
          <span className="pos-topbar-spacer" />
          <button type="button" className="pos-btn ghost" onClick={() => router.push("/pos")}>
            {tx(locale, "Tables", "Masalar")}
          </button>
        </div>

        {!online && (
          <p className="pos-offline-note">
            <b>{tx(locale, "Offline", "Çevrimdışı")}</b>
            {tx(
              locale,
              " - orders are held on this device. Payment and the kitchen need the network.",
              " - siparişler bu cihazda tutuluyor. Ödeme ve mutfak için bağlantı gerekli.",
            )}
            {queued > 0 && (
              <span>
                {" "}
                ({queued} {tx(locale, "waiting", "bekliyor")})
              </span>
            )}
          </p>
        )}
        {online && queued > 0 && (
          <p className="pos-offline-note syncing">
            {tx(locale, "Syncing", "Eşitleniyor")} - {queued}{" "}
            {tx(locale, "queued", "kuyrukta")}
          </p>
        )}
        {error && (
          <p className="pos-error" style={{ margin: "12px 16px 0" }}>
            {posFailureText(error, locale)}
          </p>
        )}

        <div className="pos-cart-lines">
          {order.lines.length + unsyncedLines.length === 0 && (
            <p style={{ color: "var(--pos-muted)", padding: "18px 8px", margin: 0 }}>
              {tx(locale, "Nothing on this ticket yet.", "Adisyonda henüz ürün yok.")}
            </p>
          )}
          {[...order.lines, ...unsyncedLines].map((line) => (
            <div
              key={line.id}
              className={`pos-cart-line ${
                line.status === "VOID" ? "void" : line.status !== "NEW" ? "sent" : ""
              }`}
            >
              <span className="pos-qty">{line.quantity}x</span>
              <span>
                <span className="pos-line-name">{line.name}</span>
                {line.modifiers.length > 0 && (
                  <small className="pos-line-sub">
                    {line.modifiers.map((m) => m.name).join(", ")}
                  </small>
                )}
                {line.isComped && <small className="pos-line-sub">{tx(locale, "Comped", "İkram")}</small>}
              </span>
              <button
                type="button"
                className="pos-line-total pos-btn ghost"
                style={{ minHeight: 32, padding: "0 8px" }}
                onClick={() => setExpandedLine(expandedLine === line.id ? null : line.id)}
              >
                {money(line.lineTotalMinor)}
              </button>

              {expandedLine === line.id && line.status !== "VOID" && (
                <div className="pos-cart-line-actions">
                  <button
                    type="button"
                    className="pos-btn danger"
                    disabled={pending || !online}
                    onClick={() => writeOff({ kind: "VOID", lineId: line.id, label: line.name })}
                  >
                    {tx(locale, "Void", "İptal")}
                  </button>
                  <button
                    type="button"
                    className="pos-btn"
                    disabled={pending || line.isComped || !online}
                    onClick={() => writeOff({ kind: "COMP", lineId: line.id, label: line.name })}
                  >
                    {tx(locale, "Comp", "İkram")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pos-cart-totals">
          <div>
            <span>{tx(locale, "Subtotal", "Ara toplam")}</span>
            <span>{money(order.subtotalMinor)}</span>
          </div>
          {order.discountMinor > 0 && (
            <div>
              <span>{tx(locale, "Discount", "İskonto")}</span>
              <span>-{money(order.discountMinor)}</span>
            </div>
          )}
          <div>
            <span>{tx(locale, "VAT included", "KDV dahil")}</span>
            <span>{money(order.taxMinor)}</span>
          </div>
          {unsyncedLines.length > 0 && (
            <div>
              <span>{tx(locale, "Queued (not priced yet)", "Kuyrukta (henüz fiyatlanmadı)")}</span>
              <span>
                +{money(unsyncedLines.reduce((sum, line) => sum + line.lineTotalMinor, 0))}
              </span>
            </div>
          )}
          <div className="grand">
            <span>{tx(locale, "Total", "Toplam")}</span>
            <span>{money(order.totalMinor)}</span>
          </div>
        </div>

        <div className="pos-cart-actions">
          <button
            type="button"
            className="pos-btn good span-2"
            disabled={pending || !hasUnsent || !online}
            onClick={() => act(() => sendToKitchenAction(order.id))}
          >
            {tx(locale, "Send to kitchen", "Mutfağa gönder")}
          </button>
          <button
            type="button"
            className="pos-btn primary span-2"
            disabled={pending || order.totalMinor === 0 || !online}
            onClick={() => router.push(`/pos/order/${order.id}/pay`)}
          >
            {tx(locale, "Payment", "Ödeme")} · {money(order.totalMinor - order.paidMinor)}
          </button>
        </div>
      </aside>

      {approvalFor && (
        <ApprovalSheet
          locale={locale}
          title={`${approvalFor.kind === "VOID" ? tx(locale, "Void", "İptal") : tx(locale, "Comp", "İkram")} · ${approvalFor.label}`}
          error={approvalError}
          pending={pending}
          onCancel={() => {
            setApprovalFor(null);
            setApprovalError(null);
          }}
          onApprove={(pin) => writeOff(approvalFor, pin)}
        />
      )}

      {sheetProduct && (
        <div className="pos-sheet-backdrop" role="dialog" aria-modal="true">
          <div className="pos-sheet">
            <header>
              <h3>{sheetProduct.name}</h3>
              <small>{money(sheetProduct.priceMinor)}</small>
            </header>
            <div className="pos-sheet-body">
              {sheetProduct.modifierGroups.map((group) => (
                <div key={group.id} className="pos-modifier-group">
                  <h4>
                    {group.name}
                    {group.required ? " *" : ""}
                  </h4>
                  <div className="pos-modifier-options">
                    {group.modifiers.map((modifier) => {
                      const selected = chosenModifiers.includes(modifier.id);
                      return (
                        <button
                          key={modifier.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setChosenModifiers((prev) =>
                              selected
                                ? prev.filter((id) => id !== modifier.id)
                                : [...prev, modifier.id],
                            )
                          }
                        >
                          <span>{modifier.name}</span>
                          <span>{modifier.priceMinor > 0 ? `+${money(modifier.priceMinor)}` : ""}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="pos-sheet-foot">
              <button type="button" className="pos-btn ghost" onClick={() => setSheetProduct(null)}>
                {tx(locale, "Cancel", "Vazgeç")}
              </button>
              <button
                type="button"
                className="pos-btn primary"
                disabled={pending}
                onClick={() => {
                  const product = sheetProduct;
                  const modifiers = chosenModifiers;
                  setSheetProduct(null);
                  addProduct(product, modifiers);
                }}
              >
                {tx(locale, "Add", "Ekle")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
