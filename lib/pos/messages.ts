import type { AppLocale } from "@/lib/costera/locale";
import type { PosErrorCode } from "./errors";

/**
 * POS failures reach the terminal as codes, not sentences: the service layer
 * has no locale and the terminal is used in three languages. Same en/tr/ar
 * shape as roleLabel in lib/session.ts.
 */
const MESSAGES: Record<PosErrorCode, { en: string; tr: string; ar: string }> = {
  ORDER_NOT_FOUND: { en: "Ticket not found.", tr: "Adisyon bulunamadı.", ar: "لم يتم العثور على الطلب." },
  ORDER_CLOSED: { en: "This ticket is already closed.", tr: "Bu adisyon kapanmış.", ar: "هذا الطلب مغلق بالفعل." },
  LINE_NOT_FOUND: { en: "Line not found.", tr: "Satır bulunamadı.", ar: "لم يتم العثور على السطر." },
  TABLE_NOT_FOUND: { en: "Table not found.", tr: "Masa bulunamadı.", ar: "لم يتم العثور على الطاولة." },
  TABLE_BUSY: { en: "That table already has an open ticket.", tr: "Masada açık adisyon var.", ar: "الطاولة لديها طلب مفتوح." },
  PRODUCT_NOT_FOUND: { en: "Product not found.", tr: "Ürün bulunamadı.", ar: "لم يتم العثور على المنتج." },
  MODIFIER_NOT_FOUND: { en: "Option not found.", tr: "Seçenek bulunamadı.", ar: "لم يتم العثور على الخيار." },
  SHIFT_NOT_OPEN: { en: "No open shift.", tr: "Açık vardiya yok.", ar: "لا توجد وردية مفتوحة." },
  SHIFT_ALREADY_OPEN: { en: "A shift is already open.", tr: "Zaten açık bir vardiya var.", ar: "هناك وردية مفتوحة بالفعل." },
  PAYMENT_EXCEEDS_DUE: { en: "Payment is more than the amount due.", tr: "Ödeme kalan tutardan fazla.", ar: "الدفعة أكبر من المبلغ المستحق." },
  ORDER_UNPAID: { en: "There are still unpaid tickets on this shift.", tr: "Vardiyada ödenmemiş adisyon var.", ar: "لا تزال هناك طلبات غير مدفوعة." },
  NOTHING_TO_SEND: { en: "Nothing new to send.", tr: "Gönderilecek yeni ürün yok.", ar: "لا يوجد جديد للإرسال." },
  INVALID_INPUT: { en: "Invalid input.", tr: "Geçersiz giriş.", ar: "مدخل غير صالح." },
};

export function posErrorMessage(code: PosErrorCode, locale: AppLocale): string {
  return MESSAGES[code][locale];
}

/**
 * Widen the mapping to everything a server action can return, including the
 * authorisation failures that come from requireRole rather than the POS domain.
 */
export function posFailureText(error: string, locale: AppLocale): string {
  if (error === "UNAUTHORIZED" || error === "FORBIDDEN") {
    return locale === "tr"
      ? "Bu işlem için yetkiniz yok."
      : locale === "ar"
        ? "ليس لديك صلاحية لهذا الإجراء."
        : "You are not allowed to do that.";
  }
  if (error === "NO_WORKSPACE") {
    return locale === "tr"
      ? "Çalışma alanı bulunamadı."
      : locale === "ar"
        ? "لم يتم العثور على مساحة عمل."
        : "No workspace found.";
  }
  return posErrorMessage(error as PosErrorCode, locale);
}
