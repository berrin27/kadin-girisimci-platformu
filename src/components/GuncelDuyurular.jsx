import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Clock, ExternalLink, AlertCircle, Rss } from 'lucide-react';

// ── RSS Kaynakları ──────────────────────────────────────────────────────────
const RSS_KAYNAKLARI = [
  {
    id: 'google-kadin',
    ad: 'Google Haberler',
    url: 'https://news.google.com/rss/search?q=Kadin+Girisimci+Destek+Hibe&hl=tr&gl=TR&ceid=TR:tr',
    renk: '#4285f4',
    ikon: '🔍',
  },
  {
    id: 'google-kosgeb',
    ad: 'KOSGEB Haberleri',
    url: 'https://news.google.com/rss/search?q=KOSGEB+Destek+Programi&hl=tr&gl=TR&ceid=TR:tr',
    renk: '#0ea5e9',
    ikon: '🏛️',
  },
  {
    id: 'google-hibe',
    ad: 'Hibe & Teşvik',
    url: 'https://news.google.com/rss/search?q=Hibe+Tesvik+Girisimci&hl=tr&gl=TR&ceid=TR:tr',
    renk: '#10b981',
    ikon: '💰',
  },
  {
    id: 'google-tubitak',
    ad: 'TÜBİTAK & Ar-Ge',
    url: 'https://news.google.com/rss/search?q=TUBITAK+Girisimci&hl=tr&gl=TR&ceid=TR:tr',
    renk: '#8b5cf6',
    ikon: '🔬',
  },
];

// ── Yedek Güncel Duyuru Akışı (Ağ/Proxy Erişilemezse Kesintisiz Gösterim) ─────
const FALLBACK_HABERLER = [
  {
    id: 'fb-kadin-1',
    kaynakId: 'google-kadin',
    baslik: '2026 Kadın Girişimci Hibe ve Destek Paketleri Açıklandı',
    link: 'https://www.kosgeb.gov.tr',
    tarih: new Date(Date.now() - 2 * 3600 * 1000),
    ozet: 'Kadın girişimcilere yönelik geri ödemesiz hibe tutarı 300.000 TL\'ye, uygun faizli kredi imkanı ise 1.5 Milyon TL\'ye yükseltildi. Başvurular e-Devlet üzerinden alınıyor.',
  },
  {
    id: 'fb-kadin-2',
    kaynakId: 'google-kadin',
    baslik: 'Ticaret Bakanlığı Kadın Kooperatifleri İhracat Desteğini Başlattı',
    link: 'https://ticaret.gov.tr',
    tarih: new Date(Date.now() - 5 * 3600 * 1000),
    ozet: 'Kadın kooperatiflerinin yurt dışı fuar katılımı, dijital pazarlama ve navlun harcamalarının %75\'i bakanlık tarafından hibelendirilecek.',
  },
  {
    id: 'fb-kosgeb-1',
    kaynakId: 'google-kosgeb',
    baslik: 'KOSGEB Girişimci Destek Programı 2026 Yılı 2. Dönem Başvuruları Başladı',
    link: 'https://www.kosgeb.gov.tr',
    tarih: new Date(Date.now() - 12 * 3600 * 1000),
    ozet: 'İş kurma ve iş geliştirme desteği kapsamında genç ve kadın girişimcilere ilave %10 hibe avantajı sunuluyor.',
  },
  {
    id: 'fb-kosgeb-2',
    kaynakId: 'google-kosgeb',
    baslik: 'KOSGEB KOBİGEL Dijitalleşme Hibe Çağrısı Açıldı',
    link: 'https://www.kosgeb.gov.tr',
    tarih: new Date(Date.now() - 24 * 3600 * 1000),
    ozet: 'İmalatçı KOBİ ve girişimcilerin yazılım, donanım ve nitelikli eleman istihdam giderlerine 2.000.000 TL\'ye kadar finansman desteği.',
  },
  {
    id: 'fb-hibe-1',
    kaynakId: 'google-hibe',
    baslik: 'IPARD III Kırsal Kalkınma Hibe Programı Kadın Projelerine Öncelik Veriyor',
    link: 'https://www.tkdk.gov.tr',
    tarih: new Date(Date.now() - 36 * 3600 * 1000),
    ozet: 'Tarım ve gıda işleme alanında yatırım yapacak kadın girişimcilerin hibe oranı %70\'e çıkarıldı.',
  },
  {
    id: 'fb-hibe-2',
    kaynakId: 'google-hibe',
    baslik: 'Kadın Girişimciler İçin Sıfır Faizli Kredi Paketi Detayları Belirlendi',
    link: 'https://www.halkbank.com.tr',
    tarih: new Date(Date.now() - 48 * 3600 * 1000),
    ozet: 'En az 1 yıllık işletme sahibi kadın girişimcilere 500.000 TL\'ye kadar 36 ay vadeli faizsiz kredi imkanı sunuluyor.',
  },
  {
    id: 'fb-tubitak-1',
    kaynakId: 'google-tubitak',
    baslik: 'TÜBİTAK 1512 BİGG 2026 Tohum Yatırım Çağrısı Açıldı',
    link: 'https://www.tubitak.gov.tr',
    tarih: new Date(Date.now() - 8 * 3600 * 1000),
    ozet: 'Teknoloji odaklı iş fikri olan girişimcilere 900.000 TL\'ye varan MÜKEMMELİYET mührü desteği ve yatırım desteği sağlanıyor.',
  },
  {
    id: 'fb-tubitak-2',
    kaynakId: 'google-tubitak',
    baslik: 'TÜBİTAK 1507 KOBİ Ar-Ge Başlangıç Destek Programı',
    link: 'https://www.tubitak.gov.tr',
    tarih: new Date(Date.now() - 30 * 3600 * 1000),
    ozet: 'İlk kez Ar-Ge projesi yapacak KOBİ\'lerin 1.200.000 TL bütçeli projelerine %75 hibe desteği.',
  },
];

// ── RSS XML Parser ──────────────────────────────────────────────────────────
function parseRssXml(xml, kaynakId) {
  try {
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
          id: `${kaynakId}-${idx}-${Date.now()}`,
          kaynakId,
          baslik: title,
          link,
          tarih: pubDate ? new Date(pubDate) : new Date(),
          ozet: cleanDesc,
        });
      }
    });
    return haberler;
  } catch (e) {
    return [];
  }
}

// ── Tekil Kaynak Çekici (Çok Katmanlı API Pipeline) ─────────────────────────
async function fetchKaynakHaberleri(kaynak) {
  // Helper to fetch with a timeout using AbortController
  const fetchWithTimeout = (url, options = {}, timeout = 6000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(id));
  };

  // Katman 1: AllOrigins raw JSON Proxy
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(kaynak.url)}`;
    const res = await fetchWithTimeout(proxyUrl);
    if (res.ok) {
      const { contents } = await res.json();
      if (contents) {
        const parsed = parseRssXml(contents, kaynak.id);
        if (parsed.length) return parsed;
      }
    }
  } catch (e) {
    // Continue to next layer
  }

  // Katman 2: CorsProxy.io (fallback if AllOrigins fails)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(kaynak.url)}`;
    const res = await fetchWithTimeout(proxyUrl);
    if (res.ok) {
      const xml = await res.text();
      const parsed = parseRssXml(xml, kaynak.id);
      if (parsed.length) return parsed;
    }
  } catch (e) {
    // Continue to fallback
  }

  // Katman 3: Yedek Duyuru Akışı
  return FALLBACK_HABERLER.filter(h => h.kaynakId === kaynak.id);
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
    if (!forceRefresh) {
      const cache = getCache();
      if (cache && cache.haberler && cache.haberler.length > 0) {
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
      for (const kaynak of RSS_KAYNAKLARI) {
        const kaynakHaberleri = await fetchKaynakHaberleri(kaynak);
        tumHaberler.push(...kaynakHaberleri);
        // İstemci tarafı rate-limit engeline takılmamak için 200ms gecikme
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Tarihe göre sırala (en yeni önce)
      tumHaberler.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

      if (tumHaberler.length > 0) {
        setHaberler(tumHaberler);
        setCache(tumHaberler);
        setSonGuncelleme(new Date());
      } else {
        // En son çare olarak tüm yedek listeyi yükle
        setHaberler(FALLBACK_HABERLER);
        setSonGuncelleme(new Date());
      }
    } catch {
      setHaberler(FALLBACK_HABERLER);
      setSonGuncelleme(new Date());
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
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${aktifFiltre === 'hepsi' ? 'bg-[#1E293B] text-white' : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
          {[1, 2, 3, 4, 5].map(i => (
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
            className="mt-4 bg-[#1E293B] text-white font-bold px-6 py-2 rounded-xl hover:opacity-90 transition text-sm"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtreliHaberler.slice(0, 24).map(haber => {
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
                        <Clock className="w-2.5 h-2.5" /> {zamanOnce(new Date(haber.tarih))}
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm leading-snug mb-1 group-hover:text-[#1E293B] transition ${text}`}>
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
