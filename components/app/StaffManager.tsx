"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { roleLabel } from "@/lib/session";
import { addStaffAction, revokeStaffPinAction, setStaffPinAction } from "@/lib/staff-actions";

export type StaffRowView = {
  membershipId: string;
  name: string;
  role: string;
  terminalOnly: boolean;
  hasPin: boolean;
};

const ROLES = [
  { value: "MANAGER", en: "Manager", tr: "Yönetici" },
  { value: "CASHIER", en: "Cashier", tr: "Kasiyer" },
  { value: "WAITER", en: "Waiter", tr: "Garson" },
  { value: "KITCHEN", en: "Kitchen", tr: "Mutfak" },
  { value: "FINANCE", en: "Finance", tr: "Finans" },
];

function errorText(code: string, locale: AppLocale): string {
  if (code === "PIN_FORMAT" || code === "INVALID_INPUT") {
    return tx(locale, "Name is required and the PIN must be 4 to 6 digits.", "İsim gerekli, PIN 4-6 rakam olmalı.");
  }
  if (code === "FORBIDDEN" || code === "UNAUTHORIZED") {
    return tx(locale, "Only the owner can manage staff.", "Personeli yalnızca sahip yönetebilir.");
  }
  return tx(locale, "Could not save.", "Kaydedilemedi.");
}

/**
 * Staff who work the tills.
 *
 * These are not web accounts: a waiter signs in on the terminal with a PIN and
 * cannot log in to the dashboard at all. Removing someone takes their PIN away
 * rather than deleting them, because their name is on every ticket they rang.
 */
export function StaffManager({
  locale,
  staff,
}: {
  locale: AppLocale;
  staff: StaffRowView[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("WAITER");
  const [pin, setPin] = useState("");
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPin, setResetPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const act = (work: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await work();
      if (!result.ok) {
        setError(result.error ?? "INVALID_INPUT");
        return;
      }
      router.refresh();
    });

  return (
    <article className="costera-panel span-3">
      <div className="costera-panel-head">
        <div>
          <span>{tx(locale, "TILL STAFF", "KASA PERSONELİ")}</span>
          <h2>{tx(locale, "Who can use the terminal", "Terminali kimler kullanabilir")}</h2>
        </div>
      </div>

      <p className="costera-panel-note">
        {tx(
          locale,
          "Staff sign in on the terminal with a PIN and cannot log in here. Every ticket, void and cash movement is recorded against the person whose PIN was used.",
          "Personel terminale PIN ile girer, buraya giriş yapamaz. Her adisyon, iptal ve kasa hareketi PIN'i kullanan kişiye yazılır.",
        )}
      </p>

      {error && <p className="costera-form-error">{errorText(error, locale)}</p>}

      <div className="costera-device-form">
        <label>
          <span>{tx(locale, "Name", "İsim")}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span>{tx(locale, "Role", "Rol")}</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {ROLES.map((item) => (
              <option key={item.value} value={item.value}>
                {tx(locale, item.en, item.tr)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{tx(locale, "PIN", "PIN")}</span>
          <input
            inputMode="numeric"
            value={pin}
            maxLength={6}
            onChange={(event) => setPin(event.target.value.replace(/[^0-9]/g, ""))}
          />
        </label>
        <button
          type="button"
          className="costera-btn"
          disabled={pending || name.trim().length < 2 || pin.length < 4}
          onClick={() =>
            act(async () => {
              const result = await addStaffAction(name, role, pin);
              if (result.ok) {
                setName("");
                setPin("");
              }
              return result;
            })
          }
        >
          {tx(locale, "Add", "Ekle")}
        </button>
      </div>

      <div className="costera-table">
        <div className="costera-table-row head">
          <span>{tx(locale, "Name", "İsim")}</span>
          <span>{tx(locale, "Role", "Rol")}</span>
          <span>{tx(locale, "Terminal PIN", "Terminal PIN")}</span>
          <span />
        </div>
        {staff.map((member) => (
          <div className="costera-table-row" key={member.membershipId}>
            <span>
              <b>{member.name}</b>
              {!member.terminalOnly && (
                <small> {tx(locale, "(web account)", "(web hesabı)")}</small>
              )}
            </span>
            <span>{roleLabel(member.role, locale)}</span>
            <span>
              {member.hasPin ? tx(locale, "Set", "Tanımlı") : tx(locale, "None", "Yok")}
            </span>
            <span>
              {resetFor === member.membershipId ? (
                <>
                  <input
                    inputMode="numeric"
                    value={resetPin}
                    maxLength={6}
                    placeholder="PIN"
                    onChange={(event) => setResetPin(event.target.value.replace(/[^0-9]/g, ""))}
                    style={{ width: 90, marginRight: 8 }}
                  />
                  <button
                    type="button"
                    className="costera-btn-ghost"
                    disabled={pending || resetPin.length < 4}
                    onClick={() =>
                      act(async () => {
                        const result = await setStaffPinAction(member.membershipId, resetPin);
                        if (result.ok) {
                          setResetFor(null);
                          setResetPin("");
                        }
                        return result;
                      })
                    }
                  >
                    {tx(locale, "Save", "Kaydet")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="costera-btn-ghost"
                    onClick={() => {
                      setResetFor(member.membershipId);
                      setResetPin("");
                    }}
                  >
                    {member.hasPin ? tx(locale, "Change PIN", "PIN değiştir") : tx(locale, "Set PIN", "PIN ver")}
                  </button>
                  {member.hasPin && (
                    <button
                      type="button"
                      className="costera-btn-ghost"
                      disabled={pending}
                      style={{ marginLeft: 8 }}
                      onClick={() => act(() => revokeStaffPinAction(member.membershipId))}
                    >
                      {tx(locale, "Remove access", "Erişimi kaldır")}
                    </button>
                  )}
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
