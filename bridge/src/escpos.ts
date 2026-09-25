/**
 * ESC/POS rendering.
 *
 * Pure: a payload in, bytes out. Every thermal printer worth buying speaks this
 * dialect, so the bridge needs no vendor driver — and because nothing here
 * touches a socket, the layout is testable without hardware.
 */

const ESC = 0x1b;
const GS = 0x1d;

const INIT = Uint8Array.from([ESC, 0x40]);
const ALIGN_LEFT = Uint8Array.from([ESC, 0x61, 0]);
const ALIGN_CENTER = Uint8Array.from([ESC, 0x61, 1]);
const BOLD_ON = Uint8Array.from([ESC, 0x45, 1]);
const BOLD_OFF = Uint8Array.from([ESC, 0x45, 0]);
const SIZE_NORMAL = Uint8Array.from([GS, 0x21, 0x00]);
const SIZE_DOUBLE = Uint8Array.from([GS, 0x21, 0x11]);
const FEED_AND_CUT = Uint8Array.from([0x0a, 0x0a, 0x0a, 0x0a, GS, 0x56, 0x00]);

/** Pin 2, 50ms on, 250ms off: the pulse every drawer-on-printer wiring expects. */
export const DRAWER_KICK = Uint8Array.from([ESC, 0x70, 0x00, 0x32, 0xfa]);

export type ReceiptPayload = {
  venue?: string;
  currency?: string;
  orderCode: number;
  table?: string | null;
  closedAt?: string | null;
  totalMinor: number;
  taxMinor: number;
  discountMinor: number;
  lines: { name: string; quantity: number; lineTotalMinor: number }[];
};

export type KitchenPayload = {
  station: string;
  orderCode: number;
  table?: string | null;
  sentAt?: string | null;
  lines: { name: string; quantity: number; note?: string | null }[];
};

const SYMBOLS: Record<string, string> = { TRY: "TL", USD: "$", EUR: "EUR", GBP: "GBP" };

export function money(minor: number, currency = "TRY"): string {
  const symbol = SYMBOLS[currency] ?? currency;
  const sign = minor < 0 ? "-" : "";
  return `${sign}${(Math.abs(minor) / 100).toFixed(2)} ${symbol}`;
}

/** Left text and right text on one line, padded to the paper width. */
export function twoColumn(left: string, right: string, columns: number): string {
  const room = Math.max(1, columns - right.length - 1);
  const trimmed = left.length > room ? left.slice(0, room) : left;
  const gap = Math.max(1, columns - trimmed.length - right.length);
  return trimmed + " ".repeat(gap) + right;
}

export function centre(text: string, columns: number): string {
  if (text.length >= columns) return text.slice(0, columns);
  const left = Math.floor((columns - text.length) / 2);
  return " ".repeat(left) + text;
}

export function rule(columns: number): string {
  return "-".repeat(columns);
}

class Builder {
  private readonly parts: Uint8Array[] = [];
  private readonly encoder = new TextEncoder();

  raw(bytes: Uint8Array): this {
    this.parts.push(bytes);
    return this;
  }

  text(value: string): this {
    this.parts.push(this.encoder.encode(value + "\n"));
    return this;
  }

  build(): Uint8Array {
    const size = this.parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(size);
    let offset = 0;
    for (const part of this.parts) {
      out.set(part, offset);
      offset += part.length;
    }
    return out;
  }
}

export function renderReceipt(payload: ReceiptPayload, columns: number): Uint8Array {
  const currency = payload.currency ?? "TRY";
  const builder = new Builder().raw(INIT).raw(ALIGN_CENTER).raw(BOLD_ON);

  if (payload.venue) builder.text(payload.venue);
  builder.raw(BOLD_OFF).raw(ALIGN_LEFT).text(rule(columns));
  builder.text(twoColumn(`ADISYON #${payload.orderCode}`, payload.table ?? "", columns));
  if (payload.closedAt) {
    builder.text(new Date(payload.closedAt).toLocaleString("tr-TR"));
  }
  builder.text(rule(columns));

  for (const line of payload.lines) {
    builder.text(
      twoColumn(`${line.quantity}x ${line.name}`, money(line.lineTotalMinor, currency), columns),
    );
  }

  builder.text(rule(columns));
  if (payload.discountMinor > 0) {
    builder.text(twoColumn("Iskonto", "-" + money(payload.discountMinor, currency), columns));
  }
  builder.text(twoColumn("KDV (dahil)", money(payload.taxMinor, currency), columns));
  builder
    .raw(SIZE_DOUBLE)
    .text(twoColumn("TOPLAM", money(payload.totalMinor, currency), Math.floor(columns / 2)))
    .raw(SIZE_NORMAL);

  builder.raw(ALIGN_CENTER).text("").text("Bizi tercih ettiginiz icin tesekkurler");
  return builder.raw(FEED_AND_CUT).build();
}

export function renderKitchenTicket(payload: KitchenPayload, columns: number): Uint8Array {
  const builder = new Builder().raw(INIT).raw(ALIGN_CENTER).raw(SIZE_DOUBLE).raw(BOLD_ON);

  builder.text(payload.station);
  builder.raw(SIZE_NORMAL).raw(BOLD_OFF).raw(ALIGN_LEFT).text(rule(columns));
  builder.text(twoColumn(`#${payload.orderCode}`, payload.table ?? "", columns));
  if (payload.sentAt) builder.text(new Date(payload.sentAt).toLocaleTimeString("tr-TR"));
  builder.text(rule(columns));

  for (const line of payload.lines) {
    // No prices on a kitchen ticket: the cook needs quantity and notes, and a
    // money column only crowds the paper.
    builder.raw(BOLD_ON).text(`${line.quantity}x ${line.name}`).raw(BOLD_OFF);
    if (line.note) builder.text(`   >> ${line.note}`);
  }

  return builder.raw(FEED_AND_CUT).build();
}

/** Same layouts, as text, for the stdout transport and for setup checks. */
export function renderPreview(kind: string, payload: unknown, columns: number): string {
  const bytes =
    kind === "RECEIPT"
      ? renderReceipt(payload as ReceiptPayload, columns)
      : renderKitchenTicket(payload as KitchenPayload, columns);
  return new TextDecoder()
    .decode(bytes)
    .replace(/[\x00-\x09\x0b-\x1f]/g, "")
    .trimEnd();
}
