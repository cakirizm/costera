import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "@/styles/dashboard/layout.css";
import "@/styles/dashboard/engine.css";
import "@/styles/dashboard/import.css";
import "@/styles/dashboard/control.css";
import "@/styles/dashboard/integrations.css";
import "@/styles/dashboard/premium.css";
import "@/styles/dashboard/ui.css";
import { getRequestLocale } from "@/lib/costera/i18n";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-costera",
  display: "swap",
});

export const metadata: Metadata = {
  title: "COSTERA | Restaurant Cost Intelligence",
  description:
    "Connect POS, recipes, inventory, purchasing and delivery data to control food cost, identify unexplained stock variance and improve restaurant profitability.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}
