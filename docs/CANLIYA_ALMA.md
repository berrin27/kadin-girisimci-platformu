# Canlıya Alma (Railway)

Fortuno tek bir Node sunucusudur: `npm run build` frontend'i `dist/`'e derler,
`npm start` hem API'yi hem derlenmiş siteyi servis eder. Railway bu iki komutu
`package.json`'dan kendisi bulur; Node sürümü `.node-version` dosyasından okunur.

## 1. Proje oluştur
1. https://railway.com → GitHub ile giriş yap.
2. **New Project → Deploy from GitHub repo → `kadin-girisimci-platformu`**.
3. İlk yayın başlar; değişkenler girilmediği için hata vermesi normaldir.

## 2. Kalıcı disk (volume) ekle — ZORUNLU
Veritabanı tek bir SQLite dosyasıdır. Volume olmadan her yeni yayında tüm
kullanıcı verisi silinir.
1. Servise sağ tıkla (veya `Ctrl/⌘+K`) → **Add Volume**.
2. Mount path: `/data`

## 3. Ortam değişkenleri (Variables sekmesi)
| Değişken | Değer |
|---|---|
| `JWT_SECRET` | Uzun rastgele değer — üretmek için: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `GEMINI_API_KEY` | Google AI Studio'dan yeni anahtar (boş bırakılırsa sohbet hazır yanıtlarla çalışır) |

`DB_PATH` gerekmez: sunucu Railway'in verdiği `RAILWAY_VOLUME_MOUNT_PATH`'e
(volume'a) otomatik yazar. Deploy Logs'ta `[db] veritabanı: /data/fortuno.db`
satırını görmelisin; `UYARI` satırı varsa veriler kalıcı değildir.
`NODE_ENV=production` da gerekmez; `npm start` bunu zaten ayarlar.
⚠️ `JWT_SECRET` değişirse herkesin oturumu kapanır — bir kez belirle, değiştirme.

## 4. Sağlık kontrolü (Settings → Deploy)
- **Healthcheck Path:** `/api/health`

## 5. Adres al (Settings → Networking)
- **Generate Domain** → `https://...up.railway.app` adresi HTTPS ile hazır gelir.
- Kendi alan adın için: **Custom Domain** → alan adını gir, Railway'in verdiği
  CNAME kaydını alan adı sağlayıcına ekle. Sertifika otomatik alınır.

## 6. Kontrol
- `https://<adres>/api/health` → `{"ok":true}`
- Siteye kayıt ol, çıkış yap, tekrar gir; bir kart ekle, **Redeploy** et ve
  kartın hâlâ durduğunu gör (volume çalışıyor demektir).

## Güncelleme
`main` dalına her push'ta Railway otomatik yeniden yayınlar. Volume'lu
serviste yayın sırasında birkaç saniyelik kesinti olur (Railway kısıtı).

## Yedek
Railway panelinde volume için yedekleme seçeneklerine bak ve düzenli yedek
al. Ayrıca kullanıcılar kendi verilerini "Verilerim & Gizlilik" sayfasından indirebilir.
