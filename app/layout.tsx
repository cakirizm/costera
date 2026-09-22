import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
