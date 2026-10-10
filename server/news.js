// ── Haber Akışı Servisi ──────────────────────────────────────────────────────
// Google News RSS akışları sunucuda çekilir (tarayıcıdaki CORS sorunu ve
// güvenilmez proxy'ler ortadan kalkar), veritabanına kaydedilir ve
// NEWS_REFRESH_MINUTES aralıkla yenilenir. Kaynağa ulaşılamazsa son başarılı
// haberler gösterilmeye devam eder — uydurma/yedek haber asla üretilmez.

import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { db, transaction } from './db.js';

export const KATEGORILER = [
  { id: 'kadin-girisimci', sorgu: 'kadın girişimci destek' },
  { id: 'kosgeb', sorgu: 'KOSGEB destek programı' },
  { id: 'hibe-tesvik', sorgu: 'girişimci hibe teşvik' },
  { id: 'tubitak', sorgu: 'TÜBİTAK girişimci' },
  { id: 'kooperatif', sorgu: 'kadın kooperatifi destek' },
];

const REFRESH_MINUTES = Number(process.env.NEWS_REFRESH_MINUTES) || 30;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_AGE_DAYS = 60;           // bundan eski haberler gösterilmez ve silinir
const PER_FEED_LIMIT = 30;         // akış başına kaydedilen en yeni haber sayısı

// Tıklama tuzağı / dolandırıcılık kalıpları. Sahte "devlet ödemesi" haberleri
// genelde bu kalıplarla yayılır ve kişisel veri toplamaya yönlendirir.
const SUPHELI_BASLIK = [
  /hesab(ınız|ınıza|ına|lara)\s.{0,30}yat[ıa]/i,
  /\bptt\b.{0,40}(yatır|ödeme|ödenecek)/i,
  /(çoğu|kimse|herkes)\s(kişi\s)?bilmiyor/i,
  /başvuru\s(yapan|yapanlar)\s.{0,30}(alacak|alıyor)/i,
  /listede\sadı\solan/i,
  /hemen\sbaşvur(un)?!/i,
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

const feedUrl = (sorgu) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(sorgu)}&hl=tr&gl=TR&ceid=TR:tr`;

const haberId = (link) => createHash('sha1').update(link).digest('hex').slice(0, 20);

const metin = (v) => (typeof v === 'object' && v !== null ? v['#text'] ?? '' : v ?? '').toString().trim();

const resmiMi = (url) => {
  try { return /(^|\.)gov\.tr$/.test(new URL(url).hostname); } catch { return false; }
};

// Google News başlıkları "Başlık - Kaynak Adı" biçimindedir; kaynak adını ayır.
const basligiTemizle = (baslik, kaynakAd) =>
  kaynakAd && baslik.endsWith(` - ${kaynakAd}`) ? baslik.slice(0, -(kaynakAd.length + 3)) : baslik;

export function parseFeed(xml, kategori) {
  const kanal = parser.parse(xml)?.rss?.channel;
  const items = [kanal?.item ?? []].flat();
  const sinir = Date.now() - MAX_AGE_DAYS * 86_400_000;

  return items.map((it) => {
    const link = metin(it.link);
    const kaynakAd = metin(it.source);
    const kaynakUrl = typeof it.source === 'object' ? it.source.url ?? '' : '';
    const tarih = new Date(metin(it.pubDate));
    return {
      id: haberId(link),
      kategori,
      baslik: basligiTemizle(metin(it.title), kaynakAd),
      link,
      kaynakAd,
      kaynakUrl,
      resmi: resmiMi(kaynakUrl),
      yayinTarihi: Number.isNaN(tarih.getTime()) ? null : tarih.toISOString(),
    };
  })
    .filter(h => h.baslik && h.link.startsWith('https://') && h.yayinTarihi)
    .filter(h => new Date(h.yayinTarihi).getTime() >= sinir)
    .filter(h => !SUPHELI_BASLIK.some(re => re.test(h.baslik)))
    .sort((a, b) => b.yayinTarihi.localeCompare(a.yayinTarihi))
    .slice(0, PER_FEED_LIMIT);
}

async function fetchFeed({ id, sorgu }) {
  const res = await fetch(feedUrl(sorgu), {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FortunoNews/1.0)' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseFeed(await res.text(), id);
}

const upsert = db.prepare(`
  INSERT INTO news_items (id, kategori, baslik, link, kaynak_ad, kaynak_url, resmi, yayin_tarihi, son_gorulme)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET son_gorulme = excluded.son_gorulme
`);

// Son yenileme durumu (bellekte; sunucu yeniden başlarsa ilk yenilemede dolar)
export const durum = { sonDeneme: null, sonBasari: null, hatalar: {} };

let calisiyor = false;

export async function refreshNews() {
  if (calisiyor) return durum;
  calisiyor = true;
  durum.sonDeneme = new Date().toISOString();
  try {
    const sonuclar = await Promise.allSettled(KATEGORILER.map(fetchFeed));
    const simdi = new Date().toISOString();
    let eklenen = 0;

    transaction(() => {
      sonuclar.forEach((r, i) => {
        const { id } = KATEGORILER[i];
        if (r.status === 'rejected') {
          durum.hatalar[id] = String(r.reason?.message || r.reason);
          return;
        }
        delete durum.hatalar[id];
        for (const h of r.value) {
          const { changes } = upsert.run(h.id, h.kategori, h.baslik, h.link, h.kaynakAd, h.kaynakUrl,
            h.resmi ? 1 : 0, h.yayinTarihi, simdi);
          eklenen += changes;
        }
      });
      const sinir = new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString();
      db.prepare('DELETE FROM news_items WHERE yayin_tarihi < ?').run(sinir);
    });

    const basarili = sonuclar.filter(r => r.status === 'fulfilled').length;
    if (basarili > 0) durum.sonBasari = simdi;
    const hataliSayi = KATEGORILER.length - basarili;
    console.log(`[news] ${basarili}/${KATEGORILER.length} akış güncellendi${hataliSayi ? `, ${hataliSayi} hata` : ''}`);
    return durum;
  } finally {
    calisiyor = false;
  }
}

export function listNews({ kategori, limit = 40 } = {}) {
  const rows = kategori
    ? db.prepare('SELECT * FROM news_items WHERE kategori = ? ORDER BY yayin_tarihi DESC LIMIT ?').all(kategori, limit)
    : db.prepare('SELECT * FROM news_items ORDER BY yayin_tarihi DESC LIMIT ?').all(limit);
  return rows.map(r => ({
    id: r.id,
    kategori: r.kategori,
    baslik: r.baslik,
    link: r.link,
    kaynakAd: r.kaynak_ad,
    resmi: !!r.resmi,
    tarih: r.yayin_tarihi,
  }));
}

// Veritabanındaki en son başarılı çekim zamanı (sunucu yeniden başlasa da bilinir)
export function sonGuncelleme() {
  return durum.sonBasari ?? db.prepare('SELECT MAX(son_gorulme) AS t FROM news_items').get().t ?? null;
}

export function startNewsRefresher() {
  if (process.env.NEWS_REFRESH === 'off') return;
  const calistir = () => refreshNews().catch(err => console.warn('[news] yenileme hatası:', err.message));
  calistir();
  setInterval(calistir, REFRESH_MINUTES * 60_000).unref();
}
