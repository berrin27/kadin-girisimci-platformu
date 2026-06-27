import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Clock, ExternalLink, TrendingUp, AlertCircle, CheckCircle2, Newspaper, Rss, Filter } from 'lucide-react';

// ── RSS Kaynakları ──────────────────────────────────────────────────────────
const RSS_KAYNAKLARI = [
  {
    id: 'google-kadin',
    ad: 'Google Haberler',
    url: 'https://news.google.com/rss/search?q=kad%C4%B1n+giri%C5%9Fimci+destek+hibe&hl=tr&gl=TR&ceid=TR:tr',
    renk: '#4285f4',
    ikon: '🔍',
  },
  {
    id: 'google-kosgeb',
    ad: 'KOSGEB Haberleri',
    url: 'https://news.google.com/rss/search?q=KOSGEB+destek+program%C4%B1+2026&hl=tr&gl=TR&ceid=TR:tr',
    renk: '#0ea5e9',
    ikon: '🏛️',
  },
  {
    id: 'google-hibe',
    ad: 'Hibe & Teşvik',
    url: 'https://news.google.com/rss/search?q=hibe+te%C5%9Fvik+kad%C4%B1n+kooperatif+2026&hl=tr&gl=TR&ceid=TR:tr',
    renk: '#10b981',
    ikon: '💰',
  },
  {
    id: 'google-tubitak',
    ad: 'TÜBİTAK & Ar-Ge',
    url: 'https://news.google.com/rss/search?q=T%C3%9CB%C4%B0TAK+hibe+giri%C5%9Fimci+2026&hl=tr&gl=TR&ceid=TR:tr',
    renk: '#8b5cf6',
    ikon: '🔬',
  },
];

// ── CORS Proxy ──────────────────────────────────────────────────────────────
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
// ── CORS Proxy Fallback'ler ──────────────────────────────────────────────────
const PROXIES = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchViaProxy(url) {
  for (const makeUrl of PROXIES) {
    try {
      const proxyUrl = makeUrl(url);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const data = await res.text();
      // allorigins returns JSON with "contents" field
      try {
        const json = JSON.parse(data);
        if (json.contents) return json.contents;
      } catch {}
      // Other proxies return raw XML
      if (data.includes('<rss') || data.includes('<item')) return data;
    } catch { /* try next proxy */ }
  }
  throw new Error('All proxies failed');
}

// ── RSS XML → JSON Parser ────────────────────────────────────────────────────
function parseRssXml(xml, kaynakId) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('item');
  const haberler = [];

  items.forEach((item, idx) => {
    if (idx >= 8) return;
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const cleanDesc = description.replace(/<[^>]*>/g, '').trim().slice(0, 200);

    if (title) {
      haberler.push({
        id: `${kaynakId}-${idx}`,
        kaynakId,
        baslik: title,
        link,
        tarih: pubDate ? new Date(pubDate) : new Date(),
        ozet: cleanDesc,
      });
    }
  });

  return haberler;
}

// ── Zaman farkı hesapla ──────────────────────────────────────────────────────
function zamanOnce(tarih) {
  const simdi = new Date();
  const fark = simdi - tarih;
  const dakika = Math.floor(fark / 60000);
  const saat = Math.floor(fark / 3600000);
  const gun = Math.floor(fark / 86400000);

  if (dakika < 1) return 'Az önce';
  if (dakika < 60) return `${dakika} dk önce`;
  if (saat < 24) return `${saat} saat önce`;
  if (gun < 7) return `${gun} gün önce`;
  return tarih.toLocaleDateString('tr-TR');
}

// ── Cache yönetimi ───────────────────────────────────────────────────────────
const CACHE_KEY = 'fortuno-haberler-cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 dakika

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCache(haberler) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      haberler,
    }));
  } catch {}
}

export default function GuncelDuyurular({ dark }) {
  const [haberler, setHaberler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);
  const [sonGuncelleme, setSonGuncelleme] = useState(null);
  const [aktifFiltre, setAktifFiltre] = useState('hepsi');
  const [yenileniyor, setYenileniyor] = useState(false);

  // ── Haberleri Çek ──────────────────────────────────────────────────────────
  const haberleriCek = useCallback(async (forceRefresh = false) => {
    // Önce cache kontrol et
    if (!forceRefresh) {
      const cache = getCache();
      if (cache) {
        setHaberler(cache.haberler.map(h => ({ ...h, tarih: new Date(h.tarih) })));
        setSonGuncelleme(new Date(cache.timestamp));
        setYukleniyor(false);
        return;
      }
    }

    setYukleniyor(true);
    setHata(false);
    const tumHaberler = [];

    try {
      const sonuclar = await Promise.allSettled(
        RSS_KAYNAKLARI.map(async (kaynak) => {
          const xml = await fetchViaProxy(kaynak.url);
          return parseRssXml(xml, kaynak.id);
        })
      );

      sonuclar.forEach((sonuc) => {
        if (sonuc.status === 'fulfilled') {
          tumHaberler.push(...sonuc.value);
        }
      });

      // Tarihe göre sırala (en yeni önce)
      tumHaberler.sort((a, b) => b.tarih - a.tarih);

      if (tumHaberler.length > 0) {
        setHaberler(tumHaberler);
        setCache(tumHaberler);
        setSonGuncelleme(new Date());
      } else {
        setHata(true);
      }
    } catch {
      setHata(true);
    }

    setYukleniyor(false);
    setYenileniyor(false);
  }, []);

  useEffect(() => {
    haberleriCek();
  }, [haberleriCek]);

  // ── Otomatik yenileme (30 dk) ──────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => haberleriCek(true), CACHE_TTL);
    return () => clearInterval(interval);
  }, [haberleriCek]);

  const handleYenile = () => {
    setYenileniyor(true);
    haberleriCek(true);
  };

  // ── Filtre ─────────────────────────────────────────────────────────────────
  const filtreliHaberler = aktifFiltre === 'hepsi'
    ? haberler
    : haberler.filter(h => h.kaynakId === aktifFiltre);

  // ── Stiller ────────────────────────────────────────────────────────────────
  const card = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-5xl mx-auto px-4 mt-12 pb-24">

      {/* ── Başlık ─────────────────────────────────────────────────── */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${dark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
          <Rss className="w-4 h-4" /> Canlı Haber Akışı
        </div>
        <h2 className={`text-4xl font-black mb-3 ${text}`}>
          Güncel Duyurular 📡
        </h2>
        <p className={`max-w-2xl mx-auto text-base ${sub}`}>
          KOSGEB, TÜBİTAK, Ticaret Bakanlığı ve kadın girişimcilere yönelik
          <strong className={dark ? ' text-slate-200' : ' text-slate-700'}> en güncel haberler otomatik olarak çekiliyor.</strong>
        </p>
      </div>

      {/* ── Durum Çubuğu ──────────────────────────────────────────── */}
      <div className={`${card} border rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-xs font-semibold ${hata ? 'text-red-500' : 'text-emerald-500'}`}>
            <span className={`w-2 h-2 rounded-full ${hata ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
            {hata ? 'Bağlantı sorunu' : 'Canlı'}
          </div>
          {sonGuncelleme && (
            <span className={`text-xs flex items-center gap-1 ${sub}`}>
              <Clock className="w-3 h-3" />
              Son güncelleme: {zamanOnce(sonGuncelleme)}
            </span>
          )}
          <span className={`text-xs font-bold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {haberler.length} haber
          </span>
        </div>
        <button
          onClick={handleYenile}
          disabled={yenileniyor}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition ${dark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} disabled:opacity-50`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${yenileniyor ? 'animate-spin' : ''}`} />
          {yenileniyor ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      {/* ── Kaynak Filtreleri ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setAktifFiltre('hepsi')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${aktifFiltre === 'hepsi' ? 'bg-purple-600 text-white' : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          📰 Tümü
        </button>
        {RSS_KAYNAKLARI.map(k => (
          <button
            key={k.id}
            onClick={() => setAktifFiltre(k.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${aktifFiltre === k.id ? 'text-white' : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            style={aktifFiltre === k.id ? { background: k.renk } : {}}
          >
            {k.ikon} {k.ad}
          </button>
        ))}
      </div>

      {/* ── Haber Kartları ────────────────────────────────────────── */}
      {yukleniyor ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`${card} border rounded-2xl p-5 animate-pulse`}>
              <div className={`h-4 ${dark ? 'bg-slate-700' : 'bg-slate-200'} rounded w-1/4 mb-3`} />
              <div className={`h-5 ${dark ? 'bg-slate-700' : 'bg-slate-200'} rounded w-3/4 mb-2`} />
              <div className={`h-3 ${dark ? 'bg-slate-700' : 'bg-slate-200'} rounded w-full`} />
            </div>
          ))}
        </div>
      ) : hata && haberler.length === 0 ? (
        <div className={`${card} border rounded-2xl p-8 text-center`}>
          <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`font-bold mb-2 ${text}`}>Haberler yüklenemedi</h3>
          <p className={`text-sm ${sub}`}>İnternet bağlantınızı kontrol edin veya birkaç dakika sonra tekrar deneyin.</p>
          <button
            onClick={handleYenile}
            className="mt-4 bg-purple-600 text-white font-bold px-6 py-2 rounded-xl hover:opacity-90 transition text-sm"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtreliHaberler.slice(0, 20).map(haber => {
            const kaynak = RSS_KAYNAKLARI.find(k => k.id === haber.kaynakId);
            return (
              <a
                key={haber.id}
                href={haber.link}
                target="_blank"
                rel="noreferrer"
                className={`${card} border rounded-2xl p-5 block hover:shadow-lg transition-all duration-200 group`}
                style={{ borderLeftWidth: '4px', borderLeftColor: kaynak?.renk || '#8b5cf6' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                        style={{ background: kaynak?.renk || '#8b5cf6' }}
                      >
                        {kaynak?.ikon} {kaynak?.ad}
                      </span>
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${sub}`}>
                        <Clock className="w-2.5 h-2.5" /> {zamanOnce(haber.tarih)}
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm leading-snug mb-1 group-hover:text-purple-500 transition ${text}`}>
                      {haber.baslik}
                    </h3>
                    {haber.ozet && (
                      <p className={`text-xs line-clamp-2 leading-relaxed ${sub}`}>{haber.ozet}</p>
                    )}
                  </div>
                  <ExternalLink className={`w-4 h-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition ${sub}`} />
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* ── Alt Bilgi ─────────────────────────────────────────────── */}
      <div className={`mt-8 p-5 rounded-2xl border ${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h4 className={`font-bold text-sm mb-1 ${text}`}>Veri Kaynakları Hakkında</h4>
            <p className={`text-xs leading-relaxed ${sub}`}>
              Haberler Google News RSS, KOSGEB, TÜBİTAK ve Ticaret Bakanlığı kaynaklarından otomatik olarak çekilmektedir.
              Veriler <strong>her 30 dakikada bir</strong> otomatik güncellenir. Manuel yenilemek için "Yenile" butonuna tıklayabilirsiniz.
              Program tutarları ve koşulları değişkenlik gösterebilir — resmi kaynakları her zaman kontrol edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
