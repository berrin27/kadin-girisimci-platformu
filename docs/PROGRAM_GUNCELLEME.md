# Destek Programları — Haftalık Güncelleme Rehberi

Bu rehber hem haftalık güncelleme ajanı hem de elle güncelleme yapan kişi içindir.
Amaç: sitedeki destek programlarının tutar, şart ve tarihlerini resmi kaynaklarla
güncel tutmak ve yeni programları **insan onayıyla** yayına almak.

> **Altın kural:** Hiçbir bilgi resmi bir kaynakla doğrulanmadan siteye girmez.
> Sosyal medya, "devletten X TL destek" başlıklı haber siteleri ve resmi bağlantısı
> olmayan bloglar kaynak sayılmaz. Bu tür iddialar çoğu zaman kişisel veri toplayan
> dolandırıcılıklardır (ör. 2025-26'da yayılan "ev hanımlarına 10.000 TL" iddiası).

## Verinin bulunduğu yerler

| Dosya | Ne var |
|---|---|
| `src/data.js` | **Tek veri kaynağı:** `supportData` (programlar), `basvuruTakvimi`, `etkinlikler` (Fuarlar & Etkinlikler sayfası), `fuarKaynaklari`, `SON_KONTROL` |
| `src/App.jsx` | `kaynakca` (Kaynakça kartları) ve `faqVerisi` (SSS) — tutar geçiyorsa data.js ile tutarlı olmalı |
| `src/src/aiPromt.js` | Gemini sistem prompt'u ve örnek cevaplar (KOSGEB, TÜBİTAK tutarları) |
| `server/chatbot.js` | Gemini erişilemezse kullanılan hazır cevaplar (KOSGEB, TÜBİTAK, vergi, şirket kuruluşu) |
| `src/components/EgitimPortali.jsx` | Eğitim sayfasındaki KOSGEB notları |
| `src/components/BasvuruTakip.jsx` | `INITIAL_CARDS` — yeni kullanıcıya gösterilen örnek kartlar |

Bir programın tutarı değiştiyse **bu dosyaların hepsinde** aynı programdan bahseden
yerleri ara (`grep -rn "KOSGEB" src server`) ve tutarlı hale getir.

## Program kaydının alanları (`src/data.js`)

Dosyanın başındaki yorum etiketleri ve alanları açıklar. Özet:

- `amount`, `type`, `description`, `highlight`: kullanıcıya görünen metinler — Türkçe, sade, jargon yok.
- `destekTuru`: `hibe` (yalnızca geri ödemesizse!) · `kredi` · `geri_odemeli` · `yatirim` · `vergi` · `sosyal_yardim` · `mentorluk`
- `hibeUstLimit` / `finansmanUstLimit`: hesaplayıcı için TL cinsinden tam sayı; resmi sabit tutar yoksa `null`.
- `link`: başvuru/program sayfası. `kaynak`: bilgiyi doğruladığın sayfa (tercihen kurumun kendi sitesi).
- `basvuruDurumu`: "Sürekli — şubelerden başvurulur" veya "2026-2. dönem 8 Mayıs'ta kapandı, yeni çağrı bekleniyor" gibi.
- `tags`: eşleşme motoru bunları **zorunlu kriter** sayar. Bir sektör/yaş/aşama/medeni durum etiketini
  yalnızca program o gruba gerçekten açıksa ekle. Medeni duruma özel değilse 4 medeni etiketin hepsini ekle.

## Kontrol edilecek resmi kaynaklar

**Mevcut programlar:** her programın `kaynak` ve `link` adresini aç, tutar/oran/şart/tarih değişmiş mi bak.

**Yeni program ve çağrılar için duyuru sayfaları:**

- KOSGEB destekler: https://www.kosgeb.gov.tr/site/tr/genel/destekler/3/destekler
- KOSGEB duyurular: https://www.kosgeb.gov.tr (ana sayfa duyurular)
- Kadın Girişimci Portalı (ASHB): https://kadingirisimci.gov.tr/destek-ve-tesvikler/
- TÜBİTAK duyurular: https://tubitak.gov.tr/tr/duyuru
- Ticaret Bakanlığı: https://ticaret.gov.tr (KOOP-DES, ihracat destekleri)
- Tarım ve Orman Bakanlığı Kırsal Kalkınma: https://kirsalkalkinma.tarimorman.gov.tr
- TKDK çağrılar: https://www.tkdk.gov.tr
- Halkbank Üreten Kadınlar: https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/kadin-girisimci-kredisi.html

Ayrıca "kadın girişimci hibe <ay> <yıl>", "kadın kooperatifi destek <yıl>", "KOSGEB çağrı <yıl>"
gibi aramalar yap; bulduğun her iddiayı yukarıdaki resmi sayfalardan teyit et.

## Kurallar

1. **Birincil kaynak tercih et.** Kurumun kendi sitesi > Resmî Gazete > kurumun duyurusunu birebir aktaran
   mevzuat siteleri (ör. alomaliye.com). İkincil kaynak kullandıysan `kaynak` alanına onu yaz ve PR'da belirt.
2. **Rakam uydurma.** Resmi sabit tutar yoksa `amount`'ta oranı veya "koşullar için resmi sayfaya bakın"
   ifadesini kullan, limit alanlarını `null` bırak.
3. **Hibe ile krediyi karıştırma.** Geri ödemeli her şey `hibe` değildir; hisse karşılığı yatırım da hibe değildir.
4. **Kaldırma:** program yürürlükten kalktıysa veya artık doğrulanamıyorsa kaydı sil ve PR'da nedenini yaz.
5. **Takvim:** yeni bir başvuru dönemi açıklandıysa `basvuruTakvimi`'ne ekle (`YYYY-AA-GG`). Durum
   (açık/yaklaşıyor/tamamlandı) otomatik hesaplanır; 12 aydan eski kayıtları sil.
6. **Değişiklik yaptıysan** `SON_KONTROL`'ü bu ayla güncelle (ör. `'Kasım 2026'`).
7. **Doğrula:** `npm ci && npm run check:programs && npm run build` — hata varsa düzelt.

## Etkinlikler (`etkinlikler`)

Fuarlar & Etkinlikler sayfası yalnızca **gerçek ve resmi bağlantısı olan** etkinlikleri gösterir
(kadın girişimcilere yönelik yarışma, ödül, hibe çağrısı, hızlandırma programı, fuar, eğitim).

- Her kayıtta `link` (resmi başvuru/etkinlik sayfası) ve `kaynak` zorunludur.
- `bitis`: son başvuru veya etkinlik tarihi. `baslangic`: yalnızca kaynakta yazıyorsa — **tahmin etme**, bilinmiyorsa `null`.
- Son başvurusu geçmiş etkinlikleri sil (`npm run check:programs` bunları uyarı olarak listeler).
- Yeni dönemi açılan yinelenen etkinlikleri (ör. yıllık yarışmalar) yeni tarihlerle güncelle.
- Aday kaynaklar: Halkbank Üreten Kadınlar, KAGİDER, Garanti BBVA Kadın Girişimci, EY, EIC/Ufuk Avrupa
  (ufukavrupa.org.tr), Ticaret Bakanlığı fuar listeleri, aile.gov.tr il müdürlüğü duyuruları.

## Pull request

- Dal adı: `program-guncelleme/YYYY-AA-GG`
- Başlık: `Destek programları güncellemesi — <tarih>`
- Açıklama: değişen her program için tablo — **Program · Eski · Yeni · Kaynak bağlantısı**;
  ardından yeni eklenenler, kaldırılanlar (nedenleriyle) ve emin olunamayan noktalar.
- **Hiçbir şey değişmediyse PR açma**, sadece "değişiklik yok" diye raporla.
- PR'ı asla kendin birleştirme (merge etme) — yayına alma kararı insanındır.
