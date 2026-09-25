import type { Metadata, Viewport } from "next";
import "@/lib/env";
import { Manrope } from "next/font/google";
import "./globals.css";
import "@/styles/marketing/brand.css";
import "@/styles/marketing/home.css";
import "@/styles/marketing/pages.css";
import "@/styles/marketing/reference.css";
import "@/styles/marketing/how-steps.css";
import "@/styles/dashboard/layout.css";
import "@/styles/dashboard/engine.css";
import "@/styles/dashboard/import.css";
import "@/styles/dashboard/control.css";
import "@/styles/dashboard/integrations.css";
import "@/styles/dashboard/premium-shell.css";
import "@/styles/dashboard/premium-pages.css";
import "@/styles/dashboard/premium-empty.css";
import "@/styles/dashboard/premium-typography.css";
import "@/styles/dashboard/premium-qa.css";
import "@/styles/dashboard/premium-qa-pages.css";
import "@/styles/dashboard/premium-visual.css";
import "@/styles/dashboard/ui.css";
import "@/styles/dashboard/pos-terminal.css";
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
  openGraph: {
    title: "COSTERA | Restaurant Cost Intelligence",
    description: "Control food cost, identify unexplained stock variance and improve restaurant profitability.",
    siteName: "COSTERA",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "COSTERA | Restaurant Cost Intelligence",
    description: "Control food cost, identify unexplained stock variance and improve restaurant profitability.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b2c46",
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
