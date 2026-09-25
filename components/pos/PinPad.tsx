"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { unlockTerminalAction } from "@/lib/staff-actions";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const MAX_PIN = 6;

/**
 * Till sign-in.
 *
 * A keypad rather than a text field: the terminal is a tablet on a counter, and
 * the digits must be hittable without looking. The PIN is never shown back.
 */
export function PinPad({ locale, venue }: { locale: AppLocale; venue: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const press = (digit: string) => {
    if (pin.length >= MAX_PIN) return;
    setError(false);
    const next = pin + digit;
    setPin(next);
    if (next.length >= 4) return;
  };

  const submit = (value: string) =>
    startTransition(async () => {
      const result = await unlockTerminalAction(value);
      if (result.ok) {
        setPin("");
        router.replace("/pos");
        router.refresh();
        return;
      }
      setError(true);
      setPin("");
    });

  return (
    <main className="pos-main">
      <div className="pos-lock">
        <p className="pos-lock-venue">{venue}</p>
        <h1>{tx(locale, "Enter your PIN", "PIN kodunuzu girin")}</h1>

        <div className="pos-lock-dots" aria-live="polite">
          {Array.from({ length: MAX_PIN }).map((_, index) => (
            <i key={index} className={index < pin.length ? "on" : ""} />
          ))}
        </div>

        {error && (
          <p className="pos-error">{tx(locale, "PIN not recognised.", "PIN tanınmadı.")}</p>
        )}

        <div className="pos-lock-keys">
          {KEYS.map((key) => (
            <button key={key} type="button" disabled={pending} onClick={() => press(key)}>
              {key}
            </button>
          ))}
          <button
            type="button"
            className="ghost"
            disabled={pending || pin.length === 0}
            onClick={() => {
              setError(false);
              setPin(pin.slice(0, -1));
            }}
          >
            ←
          </button>
          <button type="button" disabled={pending} onClick={() => press("0")}>
            0
          </button>
          <button
            type="button"
            className="go"
            disabled={pending || pin.length < 4}
            onClick={() => submit(pin)}
          >
            →
          </button>
        </div>
      </div>
    </main>
  );
}
