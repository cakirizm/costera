type Locale = "en" | "tr";

const strings: Record<string, Record<Locale, string>> = {
  "MOBILE_MONITOR": { en: "MOBILE MONITOR", tr: "MOBİL İZLEME" },
  "MONITOR": { en: "MONITOR", tr: "İZLEME" },
  "Sign In": { en: "Sign In", tr: "Giriş Yap" },
  "Sign in with your web account": { en: "Sign in with your web account", tr: "Web hesabınızla giriş yapın" },
  "Email": { en: "Email", tr: "E-posta" },
  "Password": { en: "Password", tr: "Şifre" },
  "Invalid credentials": { en: "Invalid email or password.", tr: "E-posta veya şifre hatalı." },
  "Rate limited": { en: "Too many attempts. Please wait.", tr: "Çok fazla deneme. Lütfen bekleyin." },
  "Connection error": { en: "Connection error. Try again.", tr: "Bağlantı hatası. Tekrar deneyin." },
  "Read-only footer": { en: "Read-only monitoring · Data managed from web dashboard", tr: "Salt okunur izleme · Veri web panelinden yönetilir" },
  "Read-only short": { en: "Read-only · Data managed from web dashboard", tr: "Salt okunur · Veri web panelinden yönetilir" },
  "Logout": { en: "Logout", tr: "Çıkış" },
  "Net Sales": { en: "Net Sales", tr: "Net Satış" },
  "Food Cost": { en: "Food Cost", tr: "Food Cost" },
  "Unexplained": { en: "Unexplained", tr: "Açıklanamayan" },
  "Op. Expenses": { en: "Op. Expenses", tr: "İşl. Gideri" },
  "Net Profit": { en: "Net Profit", tr: "Net Kâr" },
  "units": { en: "units", tr: "adet" },
  "target": { en: "target", tr: "hedef" },
  "CHANNELS": { en: "CHANNELS", tr: "KANALLAR" },
  "ALERTS": { en: "ALERTS", tr: "UYARILAR" },
  "No data yet": { en: "No data yet", tr: "Henüz veri yok" },
  "Upload data or connect a source": { en: "Upload data from web dashboard or connect a source.", tr: "Web panelinden veri yükleyin veya bir kaynak bağlayın." },
  "Data unavailable": { en: "Data unavailable.", tr: "Veri alınamadı." },
  "No restaurant": { en: "No connected restaurant.", tr: "Bağlı restoran yok." },
  "Overview unavailable": { en: "Overview data unavailable.", tr: "Özet verisi alınamadı." },
  "variance": { en: "Variance", tr: "Fark" },
  "missing-menu": { en: "Missing menu", tr: "Eksik menü" },
  "missing-ingredient": { en: "Missing ingredient", tr: "Eksik malzeme" },
  "above-target": { en: "Above target", tr: "Hedef üzeri" },
  "Food cost above target": { en: "Food cost above target", tr: "Food cost hedefin üzerinde" },
};

let currentLocale: Locale = "tr";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string): string {
  return strings[key]?.[currentLocale] ?? strings[key]?.["en"] ?? key;
}
