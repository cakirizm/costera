import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "COSTERA · Mobile",
  robots: "noindex",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b2c46",
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <div className="m-shell">{children}</div>;
}
