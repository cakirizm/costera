"use client";

import { useState } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const MAX_PIN = 6;

/**
 * Manager sign-off, taken at the terminal.
 *
 * A waiter cannot write money off, but service should not stop while they find
 * someone: the manager types their PIN here and the write-off is recorded
 * against them. The PIN is never shown back and never leaves this sheet.
 */
export function ApprovalSheet({
  locale,
  title,
  error,
  pending,
  onCancel,
  onApprove,
}: {
  locale: AppLocale;
  title: string;
  error: string | null;
  pending: boolean;
  onCancel: () => void;
  onApprove: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");

  return (
    <div className="pos-sheet-backdrop" role="dialog" aria-modal="true">
      <div className="pos-sheet pos-approval">
        <header>
          <h3>{tx(locale, "Manager approval", "Yönetici onayı")}</h3>
          <small>{title}</small>
        </header>

        <div className="pos-sheet-body">
          {error && <p className="pos-error">{error}</p>}

          <div className="pos-lock-dots" aria-live="polite">
            {Array.from({ length: MAX_PIN }).map((_, index) => (
              <i key={index} className={index < pin.length ? "on" : ""} />
            ))}
          </div>

          <div className="pos-lock-keys">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                disabled={pending}
                onClick={() => setPin((prev) => (prev.length >= MAX_PIN ? prev : prev + key))}
              >
                {key}
              </button>
            ))}
            <button
              type="button"
              className="ghost"
              disabled={pending || pin.length === 0}
              onClick={() => setPin((prev) => prev.slice(0, -1))}
            >
              ←
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setPin((prev) => (prev.length >= MAX_PIN ? prev : prev + "0"))}
            >
              0
            </button>
            <button
              type="button"
              className="go"
              disabled={pending || pin.length < 4}
              onClick={() => {
                const value = pin;
                setPin("");
                onApprove(value);
              }}
            >
              →
            </button>
          </div>
        </div>

        <div className="pos-sheet-foot">
          <button type="button" className="pos-btn ghost" disabled={pending} onClick={onCancel}>
            {tx(locale, "Cancel", "Vazgeç")}
          </button>
        </div>
      </div>
    </div>
  );
}
