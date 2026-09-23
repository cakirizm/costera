# COSTERA — Mevcut Durum Tespit Raporu (BEFORE)

> Bu dosya, iyileştirme çalışmalarına **başlamadan önceki** durumu belgeler.
> Amaç: her tespitin hangi fazda çözüleceğini kayıt altına almak ve
> hiçbir eksikliğin gözden kaçmamasını garanti etmek.
>
> Tarih: 2026-09-23
> İnceleme kapsamı: `app/`, `components/`, `lib/costera/`, `app/api/*`,
> `app/globals.css` (10.834 satır), `package.json`, `tsconfig.json`,
> `.github/workflows/ci.yml`, son 20 commit.

---

## Projenin Mevcut Teknik Durumu

| Kategori | Durum |
|---|---|
| Stack | Next.js 16 + React 19 + TypeScript |
| Stil | Tek dosyada 10.834 satır ham CSS (`app/globals.css`). Tailwind/CSS modülü yok. |
| i18n | Sadece `tx(locale, en, tr)` fonksiyonu + cookie. Gerçek i18n kütüphanesi yok. |
| Veri | Hesaplama motoru (`lib/costera/engine.ts`) gerçek ve çalışıyor; girdisi hep statik `sampleInput`. |
| Backend | **Veritabanı / ORM / kalıcı depolama YOK.** API route'ları cookie flag + sample data döndürüyor. |
| Auth | **Gerçek kimlik doğrulama YOK.** |
| Mobil | **Mobil uygulama repoda hiç YOK.** |
| Test | Test framework yok, lint script yok. CI sadece `npm run build`. |

---

## Tespit Edilen Eksiklikler ve Faz Eşlemesi

Aşağıdaki tablo **sözleşme niteliğindedir**: her tespit bir faza bağlıdır ve
o faz tamamlanmadan tespit "çözülmüş" sayılmaz.

| # | Tespit | Kanıt (dosya) | Çözüleceği Faz | Durum |
|---|---|---|---|---|
| 1 | Gerçek giriş yok — form `action="/dashboard"` ile doğrulama olmadan yönlendiriyor; "şifremi unuttum" linki `href="#"`; farklı giriş kanalları yok | `app/login/page.tsx` | **Faz 2** | ✅ Çözüldü — Auth.js v5 (Credentials + JWT), gerçek kayıt/giriş/çıkış, şifremi-unuttum + token'lı sıfırlama, `middleware.ts` `/dashboard/*` koruması. Uçtan uca tarayıcıda doğrulandı |
| 2 | Kalıcı veri katmanı yok — tüm veriler statik `sampleInput`, ayarlar/entegrasyonlar cookie'de | `app/api/**/route.ts`, `lib/costera/sample.ts` | **Faz 2 + Faz 3** | ✅ Çözüldü — PostgreSQL + Prisma; auth verisi (User/Restaurant/Membership) VE iş verisi (Ingredient/MenuItem/Sale/InventoryRow) kalıcı. **Tüm 9 dashboard sayfası** artık restoranın DB verisinden okuyor (Overview, Cost Control, Delivery, Inventory, Recipes, POS, Finance, Purchasing, Integrations). Gider verisi (kira/elektrik) Faz 4'te eklenecek |
| 3 | Entegrasyonlar gerçek değil — "Connect" sadece demo cookie açıyor; connector builder sadece `localStorage`'a brief kaydediyor; gerçek OAuth/API/webhook yok | `components/app/IntegrationStudio.tsx` | **Faz 3** | 🟡 Büyük ölçüde — "Demo bağla/kes" artık cookie yerine restoranın DB'sine gerçek veri yazıyor/siliyor; adapter mimarisi (DataSource kind) gerçek POS API'sine hazır. Gerçek 3. parti API bağlantısı sandbox/anahtar gerektirir (o gelince yeni "kind") |
| 4 | Import edilen veri dashboard'a kalıcı yansımıyor — `DataImporter` çalışıyor ama sonuç sadece o sayfada kalıyor | `components/app/DataImporter.tsx` | **Faz 3** | ✅ Çözüldü — Excel/CSV import'u `importDataAction` ile DB'ye kalıcı yazılıyor; tüm dashboard'lar bu veriden okuyor. Uçtan uca doğrulandı |
| 5 | Finance'te gider ekleme çalışmıyor — "Add accounting expense" butonu `onClick` içermiyor; kira/elektrik kalemleri hardcoded | `app/dashboard/finance/page.tsx` | **Faz 4** | ✅ Çözüldü — `Expense` modeli + ekle/sil server action'ları + `ExpenseManager` bileşeni. Kira, elektrik, personel vb. gerçek gider olarak eklenip DB'ye kaydediliyor; net kâr = brüt kâr − giderler otomatik hesaplanıyor. Uçtan uca doğrulandı |
| 6 | Dil bayrağı tutarsız — dashboard'da emoji bayrak (Windows'ta render olmaz), marketing'te SVG, login'de düz "TR" metni (üç farklı yaklaşım) | `components/app/AppLanguageSwitcher.tsx`, `components/SiteHeader.tsx`, `app/login/page.tsx` | **Faz 1** | ✅ Çözüldü — ortak `components/Flags.tsx` SVG bayraklarına birleştirildi, tarayıcıda doğrulandı |
| 7 | CSS teknik borcu — `.costera-sidebar-brand` iki kez çakışan tanımla (satır 3019 ve 6594); taşan kartlar, "saçma oklar", "dümdüz logo" bunun sonucu | `app/globals.css` | **Faz 1** | ✅ Çözüldü — tüm 9 dashboard sayfası tarandı; source-kartı okları, Cost Control denklem-şeridi grid taşması (yanlış kolon sırası, oklar yanlış yerdeydi), inventory & recipes tablo taşmaları düzeltildi; sidebar logosu düzgün. Entegrasyon "scroll bozukluğu" tarayıcı-pane artefaktı çıktı |
| 7b | Kanal dağılımı hep $0 + tutarsız para formatı (nokta vs virgül) — overview ve delivery `sale.netSales` (yok olan alan) okuyordu | `app/dashboard/page.tsx`, `app/dashboard/delivery/page.tsx` | **Faz 1** | ✅ Çözüldü — gelir `quantity × sellingPrice`'tan türetiliyor, tutarlı `money()` formatı, tarayıcıda doğrulandı |
| 8 | Landing "premium" değil — ikonlar unicode karakter (`◫ ≋ ▥ ▣`); sosyal kanıt / testimonial / illüstrasyon yok | `components/LandingPage.tsx` | **Faz 1 + Faz 6** | ✅ Büyük ölçüde — Faz 1: unicode→SVG ikonlar. Faz 6: yetenek metrikleri, "nasıl çalışır" 3 adım, özellik vitrini, koyu CTA bandı eklendi (EN+TR). Gerçek müşteri testimonial'ı bilinçli olarak eklenmedi (fake olmasın); gerçek müşteri gelince eklenecek |
| 9 | Mobil uygulama yok — read-only yönetici izleme uygulaması gerekiyor (web ile aynı auth/backend) | (repoda yok) | **Faz 5** | ⏸️ Ertelendi — PWA vs native kararı ve deploy adresi netleşince yapılacak (kullanıcı isteğiyle sonraya bırakıldı) |
| 10 | Kalite altyapısı yok — lint/test yok, CI sadece build | `.github/workflows/ci.yml`, `package.json` | **Faz 7** | 🟡 Büyük ölçüde — Vitest + 30 birim test (cost engine + veri ingestion), `test`/`typecheck` scriptleri, CI'ya test adımı. Kalan: ESLint kurulumu ve DB/UI (integration/e2e) testleri sonraki dilim |

---

## Ekip Arkadaşı Notlarının Eşlemesi

Ekip arkadaşının serbest metin notları ve karşılık gelen tespit/faz:

| Not | Tespit # | Faz |
|---|---|---|
| "Ana sayfada premium bir şeyler / tanıtım sayfası" | 8 | Faz 1 + Faz 6 |
| "Gerçek giriş, şifre, şifre unuttum, farklı giriş kanalları" | 1 | Faz 2 |
| "İçeri girdikten sonraki ekranın görünüşünü düzelt" | 7 | Faz 1 |
| "POS/delivery entegrasyonlarını anlaşılır yap" | 3 | Faz 3 |
| "Ana sayfayı düzgünleştir, sığmayan kısımlar, saçma oklar" | 7 | Faz 1 |
| "Dillerde bayrak istiyorum yapamıyor" | 6 | Faz 1 |
| "Dashboard girişte costera'yı dümdüz koymuş" | 7 | Faz 1 |
| "Entegrasyon kurulunca tak diye her şey gelmeli" | 3, 4 | Faz 3 |
| "Mobil sadece kontrol, login web'e entegre, yönetici izleme" | 9 | Faz 5 |
| "POS sistemlerine entegre etmek" | 3 | Faz 3 |
| "Yalandan excel oluşturt, geliyor mu dene" | 4 | Faz 3 (temeli Faz 1'de çalışıyor) |
| "Muhasebe / kira / elektrik faturası / cost hesaplama" | 5 | Faz 4 |

---

## Faz Haritası (Özet)

- **Faz 1 — Görsel/UX düzeltmeleri** (backend gerektirmez): Tespit 6, 7, 8(kısmi)
- **Faz 2 — Backend temeli** (DB + auth): Tespit 1, 2
- **Faz 3 — Gerçek entegrasyon altyapısı**: Tespit 3, 4
- **Faz 4 — Finans / gider yönetimi**: Tespit 5
- **Faz 5 — Mobil izleme uygulaması**: Tespit 9
- **Faz 6 — Pazarlama premium yükseltme**: Tespit 8 (tamamı)
- **Faz 7 — Kalite altyapısı**: Tespit 10

**Garanti:** Tüm 10 tespit bir faza bağlıdır. Faz 1 hepsini çözmez; ama
hiçbir tespit haritanın dışında bırakılmamıştır. Her faz bittiğinde bu
dosyadaki "Durum" sütunu güncellenecektir.
