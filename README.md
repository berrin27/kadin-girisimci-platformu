# Fortuno — Kadın Girişimci Destek Platformu

Kadın girişimcileri KOSGEB, TÜBİTAK, Ticaret Bakanlığı, vakıf ve banka destekleriyle eşleştiren; başvuru takibi, iş planı, hibe hesaplayıcı ve yapay zekâ destekli finans mentörü (FortunoAI) sunan platform.

**Teknolojiler:** React 19 · Vite · Tailwind CSS · Express 5 · SQLite (`node:sqlite`) · Google Gemini

## Kurulum

Gereksinim: **Node.js 22.13+**

```bash
npm install
cp .env.example .env   # ardından .env içindeki değerleri doldur
npm run dev            # frontend (5173) + API (3001) birlikte başlar
```

### Ortam değişkenleri (`.env`)

| Değişken | Açıklama |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey)'dan alınan key. Boşsa sohbet hazır yanıtlarla çalışır. |
| `GEMINI_MODEL` | Opsiyonel, varsayılan `gemini-2.5-flash` |
| `JWT_SECRET` | Oturum çerezlerini imzalar. Production'da zorunlu. |

> ⚠️ `.env` dosyası git'e eklenmez — gerçek key'leri asla commit etme ve gizli değerlere `VITE_` öneki koyma (Vite bunları tarayıcıya gömer).

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme: Vite + API (otomatik yeniden başlatma) |
| `npm run build` | Frontend'i `dist/` klasörüne derler |
| `npm start` | Production: API + derlenmiş frontend tek sunucuda |
| `npm run lint` | oxlint ile kod kontrolü |

## Proje yapısı

```
server/            Express API
  db.js            SQLite şeması ve migration'lar
  auth.js          şifre hash'i (scrypt) ve JWT oturum çerezi
  chatbot.js       FortunoAI sistem prompt'u + hazır yanıt motoru
  routes/          auth, profile, applications, kanban, favorites, chat, account
  data/            veritabanı dosyası (git'e eklenmez)
src/
  api.js           backend istemcisi
  AuthGate.jsx     giriş kontrolü
  App.jsx          ana uygulama ve eşleştirme motoru
  data.js          destek programları verisi
  components/      sayfa bileşenleri
```
