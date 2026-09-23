import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "COSTERA | تحليل تكاليف المطاعم",
  description: "اربط نقاط البيع والوصفات والمخزون والمشتريات والتوصيل لضبط تكلفة الطعام وتحسين ربحية مطعمك.",
};
export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
