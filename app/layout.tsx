import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}
