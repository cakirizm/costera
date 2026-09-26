"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { posFailureText } from "@/lib/pos/messages";
import { registerPosDeviceAction, revokePosDeviceAction } from "@/lib/pos-actions";

export type PosDeviceRow = {
  id: string;
  name: string;
  kind: string;
  active: boolean;
  lastSeenAt: string | null;
};

/**
 * Enrolment for tills, kitchen screens and the local print bridge.
 *
 * The token is shown once and never again, so the panel keeps it on screen
 * until the operator dismisses it rather than hiding it behind a refresh.
 */
export function PosDeviceManager({
  locale,
  devices,
}: {
  locale: AppLocale;
  devices: PosDeviceRow[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [kind, setKind] = useState("BRIDGE");
  const [issued, setIssued] = useState<{ name: string; token: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <article className="costera-panel span-3">
      <div className="costera-panel-head">
        <div>
          <span>{tx(locale, "POS HARDWARE", "POS DONANIMI")}</span>
          <h2>{tx(locale, "Terminals & print bridge", "Terminaller & yazıcı köprüsü")}</h2>
        </div>
      </div>

      {error && <p className="costera-form-error">{posFailureText(error, locale)}</p>}

      {issued && (
        <div className="costera-token-callout">
          <strong>{tx(locale, "Copy this token now", "Bu anahtarı şimdi kopyalayın")}</strong>
          <p>
            {tx(
              locale,
              "It is stored only as a hash and cannot be shown again. Put it in the bridge config as COSTERA_DEVICE_TOKEN.",
              "Yalnızca özeti saklanır, bir daha gösterilemez. Köprü yapılandırmasına COSTERA_DEVICE_TOKEN olarak girin.",
            )}
          </p>
          <code>{issued.token}</code>
          <button type="button" className="costera-btn-ghost" onClick={() => setIssued(null)}>
            {tx(locale, "Done", "Tamam")}
          </button>
        </div>
      )}

      <div className="costera-device-form">
        <label>
          <span>{tx(locale, "Device name", "Cihaz adı")}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={tx(locale, "Bar till bridge", "Bar kasası köprüsü")}
          />
        </label>
        <label>
          <span>{tx(locale, "Kind", "Tür")}</span>
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="BRIDGE">{tx(locale, "Print bridge", "Yazıcı köprüsü")}</option>
            <option value="TERMINAL">{tx(locale, "Till", "Kasa")}</option>
            <option value="KDS">{tx(locale, "Kitchen screen", "Mutfak ekranı")}</option>
            <option value="HANDHELD">{tx(locale, "Waiter phone", "Garson telefonu")}</option>
          </select>
        </label>
        <button
          type="button"
          className="costera-btn"
          disabled={pending || name.trim() === ""}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await registerPosDeviceAction(name, kind);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setIssued({ name, token: result.data.token });
              setName("");
              router.refresh();
            })
          }
        >
          {tx(locale, "Enrol device", "Cihazı kaydet")}
        </button>
      </div>

      <div className="costera-table">
        <div className="costera-table-row head">
          <span>{tx(locale, "Device", "Cihaz")}</span>
          <span>{tx(locale, "Kind", "Tür")}</span>
          <span>{tx(locale, "Last seen", "Son görülme")}</span>
          <span>{tx(locale, "Status", "Durum")}</span>
          <span />
        </div>
        {devices.length === 0 && (
          <div className="costera-table-row">
            <span>{tx(locale, "No devices enrolled yet.", "Henüz kayıtlı cihaz yok.")}</span>
          </div>
        )}
        {devices.map((device) => (
          <div className="costera-table-row" key={device.id}>
            <span>
              <b>{device.name}</b>
            </span>
            <span>{device.kind}</span>
            <span>{device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : "—"}</span>
            <span>{device.active ? tx(locale, "Active", "Aktif") : tx(locale, "Revoked", "İptal")}</span>
            <span>
              {device.active && (
                <button
                  type="button"
                  className="costera-btn-ghost"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      setError(null);
                      const result = await revokePosDeviceAction(device.id);
                      if (!result.ok) setError(result.error);
                      else router.refresh();
                    })
                  }
                >
                  {tx(locale, "Revoke", "İptal et")}
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
