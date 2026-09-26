# Plan: COSTERA POS

**Kaynak**: `/ecc:plan` — serbest form talep (2026-09-25)
**Kapsam kararları**: Tam restoran POS (masa + adisyon + KDS) · YN ÖKC entegrasyonu dahil · Web/PWA + yerel köprü servisi
**Karmaşıklık**: Large

## Özet

Costera bugün bir analiz katmanı: dışarıdan (import/demo) gelen satış + stok verisini `analyzeCost`
motoruyla varyansa çeviriyor. POS ile birlikte Costera verinin kendisini üreten taraf olacak — yani
`DataSource.kind = POS_API` gerçek anlamda dolacak. Faz 1 hedefi: bir restoranın masa açıp, adisyon
yönetip, mutfağa sipariş düşürüp, ödeme alıp, yasal fiş kesip, vardiya kapatabildiği çalışır bir
sistem; ve bu verinin otomatik olarak mevcut varyans/food-cost motoruna akması.

## Takip Edilecek Desenler

| Kategori | Kaynak | Desen |
|---|---|---|
| Server action | `lib/expense-actions.ts:1` | `"use server"` + zod şema + `requireRole(...)` + `revalidatePath` + `deleteMany({ where: { id, restaurantId } })` sahiplik guard'ı |
| Sayfa | `app/dashboard/pos/page.tsx:9` | Server component → `getAppLocale()` + `getSessionContext()` + `COSTERAAppShell` + veri yoksa `EmptyWorkspace` |
| Yetki | `lib/session.ts:45` | `ROLE_ACCESS` haritası + `hasAccess` + `requireRole`; `middleware.ts` ile eşleşir |
| Opak token | `prisma/schema.prisma:170` (`MobileSession`) | Sadece SHA-256 digest saklanır + `credentialVersion` + `expiresAt` index |
| Prisma | Tüm modeller | `restaurantId` + `onDelete: Cascade` + `@@index([restaurantId])`; motor eşleşmesi `extId` ile |
| i18n | `lib/costera/locale.ts` (`tx`), `lib/costera/ar.json` | Kullanıcıya görünen her string en/tr/ar |
| CSS | `styles/dashboard/*.css` | Sayfa başına modüler dosya |
| Test | `lib/costera/engine.test.ts`, `middleware.test.ts` | Vitest, kaynağın yanında `*.test.ts` |

### Mevcut desende POS'a uymayan iki nokta

1. Tüm para alanları `Float`. Ödeme/para üstü/mali fiş için kabul edilemez (yuvarlama = kasa açığı).
   POS domaininde **`Int` minör birim (kuruş)**; `Sale` projeksiyonunda tek sınır fonksiyonunda `Float`'a dönüşür.
2. `Sale` modelinde zaman damgası yok, dönem filtresi yapılamıyor. POS canlı ürettiği için
   `Sale.occurredAt` eklenmeli.

## Faz Planı

### Faz 0 — Karar & Tedarik (paralel, bloklayıcı)
- YN ÖKC markası / TSM operatörü seçimi (Ingenico, Verifone, Hugin, Beko-Profilo), GMP-3 dokümantasyonu + test cihazı
- Sertifikasyon takvimi
- KDV departman haritası (yeme-içme %10, alkol %20, paket) — ÖKC departman bazlı çalışır
- Donanım: termal yazıcı, çekmece (RJ11), müşteri ekranı, barkod/kart okuyucu

### Faz 1 — POS Veri Modeli (Prisma) — migration `pos_core` — TAMAMLANDI
- Menü: `PosCategory`, `PosProduct` (`menuItemExtId` ile motora bağlanır), `PosModifierGroup`, `PosModifier`, `PosTaxGroup`
- Salon: `PosArea`, `PosTable` (ad, kapasite, floor-plan x/y)
- Sipariş: `PosOrder` (kod, masa, kanal, durum, `clientOrderId @unique` idempotency), `PosOrderLine` (ad/fiyat snapshot), `PosOrderLineModifier`
- Ödeme: `PosPayment` (yöntem, `amountMinor`, `tenderedMinor`, `changeMinor`, referans)
- Vardiya: `PosShift`, `PosCashMovement`
- Cihaz: `PosDevice` + `PosDeviceSession` (`MobileSession` deseni), `PosStaffPin`
- Mali: `FiscalReceipt` (QUEUED/SENT/CONFIRMED/FAILED, ÖKC seri no, Z no, fiş no, payload, hata kodu)
- Denetim: `PosAuditLog`
- Baskı: `PosPrintJob` (köprünün çekeceği kuyruk)
- `Role` enum'a `CASHIER` + `WAITER`; `Sale`'e `occurredAt` + `posOrderId`

### Faz 2 — Domain Servis Katmanı (`lib/pos/`) — TAMAMLANDI (UI dışı)
- `pricing.ts` — satır toplamı, modifier, iskonto, servis bedeli, KDV grubu bazlı vergi kırılımı (saf fonksiyon, yoğun test)
- `order-service.ts` — aç/ekle/çıkar/ikram/iptal, adisyon böl & birleştir, masa taşı
- `payment-service.ts` — kısmi ödeme, çoklu yöntem, para üstü, kapanış
- `shift-service.ts` — vardiya aç/kapa, Z benzeri özet, kasa farkı
- `pos-actions.ts` — `expense-actions.ts` desenini izleyen server action'lar; her biri `requireRole` + zod + `restaurantId` guard + `PosAuditLog`

### Faz 3 — POS Terminal UI (`/pos`) — TAMAMLANDI (PIN kilidi hariç)
Dashboard shell'inden ayrı, tam ekran kasiyer layout'u.
- ~~Personel PIN girişi (cihaz kayıtlı)~~ — ertelendi: cihaz kaydı Faz 6'da geliyor, şu an personel NextAuth oturumundan belirleniyor
- Masa planı: alan sekmeleri, masa durumu, süre & tutar rozeti
- Adisyon: kategori → ürün ızgarası → modifier popup → sepet, adet/not/ikram/iptal
- Ödeme: bölünmüş ödeme, hızlı nakit tuşları, para üstü
- `styles/dashboard/pos-terminal.css` (dokunmatik hedef ≥44px, yüksek kontrast)

### Faz 4 — Mutfak Ekranı (KDS) — TAMAMLANDI (polling aşamasında)
- `/pos/kds` — istasyon bazlı sipariş kartları, hazırlanıyor/hazır, bekleme süresi renk kodu
- Realtime: 5 sn polling (tarayıcıda doğrulandı) → ölçüm sonrası `app/api/pos/stream` SSE

### Faz 5 — Vardiya, Kasa & Raporlar — TAMAMLANDI
- Vardiya aç/kapa, kasa sayım ekranı, fark raporu
- Gün sonu: kanal / ödeme yöntemi / garson / saat kırılımı
- `/dashboard/reports` + `app/api/reports/export` (xlsx) içine POS raporları

### Faz 6 — Yerel Köprü Servisi — TAMAMLANDI (bu repoda `bridge/`)
Kasadaki Windows makinesinde çalışan servis (Electron tray veya Windows service):
- Sunucudan `PosPrintJob` kuyruğunu çeker (cihaz token'ı ile kimlik doğrular)
- ESC/POS adisyon/hesap fişi, çekmece, müşteri ekranı
- Faz 7'de ÖKC adaptörü de buraya oturur (tek kurulum, tek güncelleme kanalı)
- ~~Otomatik güncelleme + uzaktan log~~ — ertelendi: Windows servis kurulumu ve güncelleme kanalı saha kararı

### Faz 7 — YN ÖKC Entegrasyonu
- Köprü içinde ÖKC adaptörü (GMP-3 / vendor SDK), sunucuda `lib/pos/fiscal/` durum makinesi
- Akış: ödeme onaylandı → `FiscalReceipt` QUEUED → köprü ÖKC'ye gönderir → onay/hata döner → sipariş PAID
- ÖKC onayı gelmeden sipariş kapanmaz; timeout/çift gönderim koruması `clientOrderId` ile
- İptal/iade akışı, Z raporu mutabakatı, mali numaraların raporlara işlenmesi

### Faz 8 — Offline / PWA — TAMAMLANDI (sınırları aşağıda)
- Service Worker + IndexedDB outbox: adisyon alma, ürün ekleme, mutfağa gönderme offline çalışır; kuyruk `clientOrderId` idempotency'si ile senkronlanır
- Dürüst sınır: ÖKC'li ödeme offline yapılamaz ve soğuk açılış (offline'ken sayfa yenileme) desteklenmez — offline, servis sırasındaki bağlantı kopmalarını kurtarır.

### Faz 9 — Motora Bağlanma (POS → Costera analizi)
- Sipariş PAID olduğunda satırlar `Sale` tablosuna projekte edilir (`menuItemExtId`, `occurredAt`, `netSales`)
- `DataSource` upsert: `kind: POS_API`, `provider: "costera-pos"`, `periodTo`/`syncedAt` güncellenir
- `getRestaurantInput` değişmeden çalışır → varyans, food-cost, delivery, finans sayfaları canlanır
- Eşleşmeyen POS ürünleri `/dashboard/pos` mapping panelinde uyarı verir
- İleri adım: satış → reçete → teorik stok düşümü ile canlı stok

### Faz 10 — Roller, Güvenlik, Denetim — TAMAMLANDI ve tarayıcıda doğrulandı (yönetici onay akışı hariç)
- `ROLE_ACCESS`'e `/pos` rotaları; `CASHIER`/`WAITER` dashboard'a giremez
- `roleLabel` haritasına en/tr/ar
- `middleware.ts` + `middleware.test.ts` güncellemesi
- Personel yönetimi: terminale özel hesaplar (web'e giremez), rol ataması, PIN verme/değiştirme/kaldırma
- Terminal PIN kilidi: `/pos/lock`, imzalı httpOnly çerez, her POS aksiyonunun rolü **PIN'li personelin** rolüdür
- İskonto/ikram/iptal `PosAuditLog`'a yazılıyor ve satır içi yönetici PIN onayıyla korunuyor: garson işlemi başlatır, yönetici PIN'ini terminalde girer, işlem onaylayana yazılır, isteyen ayrı bir kayıtta durur. PIN denemeleri restoran başına 5 dakikada 10 ile sınırlı (kilit ekranı dahil).

### Faz 11 — Test & Pilot
- Fiyatlama/vergi/para üstü için kapsamlı unit test
- Yük testi: 1 restoran, 20 masa, 3 terminal, 1 KDS eşzamanlı
- Tek şubede 2 haftalık gölge pilot (POS + mevcut kasa paralel), mali mutabakat karşılaştırması

## Riskler

| Risk | Olasılık | Etki | Azaltma |
|---|---|---|---|
| ÖKC sertifikasyonu takvimi patlatır | Yüksek | Yüksek | Faz 0'da paralel başlat; POS'u ÖKC'siz (bilgi fişi modunda) da çalışır tut |
| `Float` para hataları kasa açığına dönüşür | Yüksek | Yüksek | POS domaininde `Int` kuruş; dönüşüm tek sınır fonksiyonunda, testli |
| Offline ödeme beklentisi karşılanamaz | Orta | Yüksek | Ürün kararını baştan netleştir, UI'da açık uyarı |
| Çift sipariş / çift fiş (ağ kopması) | Orta | Yüksek | `clientOrderId @unique` + sunucu tarafı dedupe |
| `Sale` projeksiyonu import verisiyle çakışır | Orta | Orta | `DataSource.kind` tek kaynağı belirler; POS aktifken import salt-okunur |
| Köprü dağıtımı/güncellemesi saha yükü | Orta | Orta | Otomatik güncelleme + uzaktan log ilk sürümde |
| KDS realtime ölçeklenmez | Düşük | Orta | Önce polling, ölçüm sonrası SSE |
| Kapsam kayması (stok, personel, CRM) | Yüksek | Orta | Faz 1–5 dışı her şey açıkça "sonra" |

## Doğrulama

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

```bash
npx prisma migrate dev --name pos_core
```

POS servis katmanının uçtan uca kontrolü (izole bir restoran yaratır, tam bir
adisyonu işletir, sonra sildiği için dev veritabanında iz bırakmaz):

```bash
node --env-file=.env --import tsx scripts/pos-smoke.ts
```

Garson el terminalinin HTTP yüzeyi (çalışan bir dev sunucu ister; kendi cihazını
ve personelini yaratıp sonunda siler):

```bash
node --env-file=.env --import tsx scripts/pos-handheld-http.ts
```

## Efor Tahmini

| Faz | Tahmin |
|---|---|
| 0 Karar/tedarik | paralel, takvim dışı |
| 1 Veri modeli | 2–3 gün |
| 2 Domain servis | 4–6 gün |
| 3 Terminal UI | 6–9 gün |
| 4 KDS | 3–4 gün |
| 5 Vardiya/rapor | 3–4 gün |
| 6 Yerel köprü | 5–7 gün |
| 7 ÖKC | 8–15 gün (+ sertifikasyon beklemesi) |
| 8 Offline/PWA | 4–6 gün |
| 9 Motor bağlantısı | 2–3 gün |
| 10 Rol/güvenlik | 2 gün |
| 11 Test/pilot | 5 gün + 2 hafta saha |

Toplam ~9–13 hafta geliştirme; ÖKC sertifikasyonu takvimi uzatabilir.

## Uygulama Sırası

Önce dikey dilim: **Faz 1 → 2 → 3 → 9**. Masa aç, sipariş al, nakit öde, veri motora aksın.
KDS (4), vardiya/rapor (5), köprü (6), ÖKC (7), offline (8) bunun üzerine eklenir.

## Faz 12 — Garson El Terminali (mobil)

Garson masada kendi telefonundan sipariş girer; kasaya yürümez.

- Kimlik iki parçalı: **cihaz kaydı + personel PIN'i**. Telefon bir kez panodan
  "Garson telefonu" olarak kaydedilir, sonra her vardiya PIN'le girilir. Garsona
  şifre verilmez, mevcut `PosDevice` + `PosStaffPin` altyapısı aynen kullanılır.
  Telefon kaybolursa cihaz iptal edilir; garson ayrılırsa PIN'i alınır.
- Sahibin salt-okunur `MobileSession` akışına **dokunulmadı**; el terminali
  tamamen ayrı bir kimlik yolu (`PosDeviceSession.membershipId`).
- Uçlar: oturum aç/kapa, bootstrap (salon + menü tek istekte), adisyon aç,
  adisyon oku, satır ekle, mutfağa gönder.
- **Telefondan ödeme yok** — pilot kafede tek yazarkasa var ve kasaya bağlı.
- Her satır `clientLineId` taşır: kafe ağında kaybolan istek tekrar basılınca
  adisyon ikiye katlanmaz.
- Garson tüm masaları görür (vardiya devri kolay olsun diye).

## Kalan Açık Maddeler

- **Faz 12 Expo arayüzü** — cihaz/simülatör olmadan çalıştırılamadı; yalnızca tip denetimi yapıldı. Sunucu tarafı ve HTTP uçları uçtan uca doğrulandı.
- **Faz 7 ÖKC** — marka (Ingenico / Verifone / Hugin / Beko-Profilo) ve TSM operatörü seçilmeden başlanamaz.
- **Köprü otomatik güncelleme** — dağıtım kanalı yok; şimdilik tilltaki repoyu çekip görevi yeniden başlatmak gerekiyor.
- **Çevrimdışı soğuk açılış** — adisyon durumunun istemcide önbelleklenmesi.

## Kabul Kriterleri

- [ ] Faz görevleri tamamlandı
- [ ] `npm run typecheck && npm run lint && npm run test && npm run build` yeşil
- [ ] Desenler yeniden icat edilmedi, mevcut kodla aynı
- [x] Faz 1 migration uygulandı (`pos_core`, `pos_order_discount`)
- [x] Faz 2 servis katmanı 22/22 uçtan uca kontrolden geçti
- [x] POS'tan geçen satış `/dashboard/pos` kanal tablosunda görünüyor (Dine-in, tarayıcıda doğrulandı)
- [x] KDS: SENT → PREPARING → READY → SERVED döngüsü ve polling tarayıcıda doğrulandı
- [ ] Personel PIN kilidi (Faz 6 cihaz kaydıyla birlikte)
- [x] Vardiya döngüsü (aç → nakit çıkış → say → kapat) ve gün sonu raporu tarayıcıda doğrulandı
- [ ] KDS için SSE (polling yeterli olmadığında)
- [x] Köprü uçtan uca doğrulandı: cihaz kaydı, kuyruk boşaltma, çekmece darbesi, hata/yeniden kuyruğa alma
- [x] Offline kuyruk tarayıcıda doğrulandı: kopukken satır eklendi, dönünce tek kez senkronlandı
- [x] Personel + PIN kilidi: rol artık hesabın değil, terminaldeki kişinin rolü
- [x] Satır içi yönetici onayı ve PIN deneme sınırı tarayıcıda doğrulandı
- [x] Pano, till olarak kullanılmış bir tarayıcıda PIN oturumuna uyuyor
- [x] Gün sonu dışa aktarımı (`?type=pos-day`, mevcut rotayla tutarlı CSV)
- [x] Köprü için Windows Zamanlanmış Görev kurulumu (`bridge/install-task.ps1`)
- [ ] Offline soğuk açılış (adisyon durumunun istemcide önbelleklenmesi)
