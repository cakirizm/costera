import nodemailer from "nodemailer";

type Mail = { to: string; subject: string; text: string; html: string };

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

// Sends mail through SMTP when configured; otherwise logs to the console (dev fallback).
async function sendMail(mail: Mail): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV === "development") {
      console.log(`\n[COSTERA] E-mail (no SMTP configured) → ${mail.to}\nSubject: ${mail.subject}\n${mail.text}\n`);
    }
    return;
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM || "COSTERA <no-reply@costera.app>",
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<void> {
  const subject = "COSTERA · Şifre sıfırlama / Password reset";
  const text =
    `Şifrenizi sıfırlamak için bağlantıya tıklayın (30 dakika geçerli):\n${link}\n\n` +
    `Click the link to reset your password (valid for 30 minutes):\n${link}\n\n` +
    `Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#12324a">
      <div style="font-weight:800;letter-spacing:.16em;color:#0b2c46;font-size:18px;margin-bottom:18px">COSTERA</div>
      <h2 style="font-size:19px;margin:0 0 10px">Şifre sıfırlama</h2>
      <p style="font-size:14px;line-height:1.6;color:#46606f;margin:0 0 20px">
        Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bağlantı 30 dakika geçerlidir.
      </p>
      <a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 22px;border-radius:9px;background:#0b2c46;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Şifremi sıfırla</a>
      <p style="font-size:12px;line-height:1.6;color:#8a97a0;margin:22px 0 0">
        Buton çalışmazsa bu bağlantıyı tarayıcınıza yapıştırın:<br>
        <span style="word-break:break-all;color:#46606f">${escapeHtml(link)}</span>
      </p>
      <p style="font-size:12px;color:#8a97a0;margin:16px 0 0">Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
    </div>`;
  await sendMail({ to, subject, text, html });
}

export type DemoRequest = {
  name: string;
  email: string;
  restaurant: string;
  locations: string;
  pos: string;
};

export async function sendDemoRequestEmail(req: DemoRequest): Promise<void> {
  const to = process.env.DEMO_NOTIFY_EMAIL || process.env.SMTP_FROM || "sales@costera.app";
  const subject = `COSTERA · Demo talebi — ${req.restaurant || req.name}`;
  const lines = [
    `Name: ${req.name}`,
    `Email: ${req.email}`,
    `Restaurant / group: ${req.restaurant}`,
    `Locations: ${req.locations}`,
    `Current POS: ${req.pos || "—"}`,
  ];
  const text = lines.join("\n");
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#12324a">
      <div style="font-weight:800;letter-spacing:.16em;color:#0b2c46;font-size:16px;margin-bottom:14px">COSTERA · Demo talebi</div>
      <table style="font-size:14px;line-height:1.7;color:#334">
        ${lines.map((l) => `<tr><td>${escapeHtml(l)}</td></tr>`).join("")}
      </table>
    </div>`;
  await sendMail({ to, subject, text, html });
}
