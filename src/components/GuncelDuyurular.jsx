import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Clock, ExternalLink, AlertCircle, Rss, BadgeCheck } from 'lucide-react';
import { api } from '../api';

// ── Kategoriler (sunucudaki server/news.js KATEGORILER ile aynı id'ler) ──────
const KATEGORILER = [
  { id: 'kadin-girisimci', ad: 'Kadın Girişimci', renk: '#db2777', ikon: '👩‍💼' },
  { id: 'kosgeb', ad: 'KOSGEB', renk: '#0ea5e9', ikon: '🏛️' },
  { id: 'hibe-tesvik', ad: 'Hibe & Teşvik', renk: '#10b981', ikon: '💰' },
  { id: 'tubitak', ad: 'TÜBİTAK & Ar-Ge', renk: '#8b5cf6', ikon: '🔬' },
  { id: 'kooperatif', ad: 'Kooperatifler', renk: '#f59e0b', ikon: '🤝' },
];

const YENILEME_MS = 10 * 60 * 1000; // sayfa açıkken sunucudan yeniden okuma aralığı

// ── Zaman farkı hesapla ──────────────────────────────────────────────────────
function zamanOnce(tarih) {
  const fark = Date.now() - tarih.getTime();
  const dakika = Math.floor(fark / 60000);
  const saat = Math.floor(fark / 3600000);
  const gun = Math.floor(fark / 86400000);

  if (dakika < 1) return 'Az önce';
  if (dakika < 60) return `${dakika} dk önce`;
  if (saat < 24) return `${saat} saat önce`;
  if (gun < 7) return `${gun} gün önce`;
  return tarih.toLocaleDateString('tr-TR');
}

export default function GuncelDuyurular({ dark }) {
  const [haberler, setHaberler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [sonGuncelleme, setSonGuncelleme] = useState(null);
  const [canli, setCanli] = useState(false);
  const [aktifFiltre, setAktifFiltre] = useState('hepsi');
  const [yenileniyor, setYenileniyor] = useState(false);

  // ── Haberleri sunucudan oku (sunucu kaynakları kendisi günceller) ─────────
  const haberleriCek = useCallback(async (kategori) => {
    try {
      const { items, guncellendi, canli } = await api.news.list(kategori === 'hepsi' ? undefined : kategori);
      setHaberler(items);
      setSonGuncelleme(guncellendi ? new Date(guncellendi) : null);
      setCanli(canli);
      setHata('');
    } catch (err) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
      setYenileniyor(false);
    }
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    haberleriCek(aktifFiltre);
    const interval = setInterval(() => haberleriCek(aktifFiltre), YENILEME_MS);
    return () => clearInterval(interval);
  }, [aktifFiltre, haberleriCek]);

  const handleYenile = () => {
    setYenileniyor(true);
    haberleriCek(aktifFiltre);
  };

  // ── Stiller ────────────────────────────────────────────────────────────────
  const card = dark ? 'bg-slate-900 border-slate-700' : 'yuzey bg-yuzey border-white/10 shadow-soft';
  const text = dark ? 'text-slate-100' : 'text-slate-900';
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
          <div className={`flex items-center gap-2 text-xs font-semibold ${hata ? 'text-red-500' : canli ? 'text-emerald-500' : 'text-amber-500'}`}>
            <span className={`w-2 h-2 rounded-full ${hata ? 'bg-red-500' : canli ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {hata ? 'Bağlantı sorunu' : canli ? 'Canlı' : 'Kaynaklara şu an ulaşılamıyor — son haberler gösteriliyor'}
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
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${aktifFiltre === 'hepsi' ? 'bg-bronz-600 text-white' : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          📰 Tümü
        </button>
        {KATEGORILER.map(k => (
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
      ) : haberler.length === 0 ? (
        <div className={`${card} border rounded-2xl p-8 text-center`}>
          <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`font-bold mb-2 ${text}`}>{hata ? 'Haberler yüklenemedi' : 'Henüz haber yok'}</h3>
          <p className={`text-sm ${sub}`}>{hata || 'Haber kaynakları birkaç dakika içinde taranacak, lütfen biraz sonra tekrar deneyin.'}</p>
          <button
            onClick={handleYenile}
            className="mt-4 bg-bronz-600 text-white font-bold px-6 py-2 rounded-xl hover:opacity-90 transition text-sm"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {haberler.map(haber => {
            const kaynak = KATEGORILER.find(k => k.id === haber.kategori);
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
                      {haber.resmi && (
                        <span className="text-[10px] font-bold flex items-center gap-0.5 text-emerald-600">
                          <BadgeCheck className="w-3 h-3" /> Resmi kaynak
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold text-sm leading-snug mb-1 group-hover:text-slate-900 transition ${text}`}>
                      {haber.baslik}
                    </h3>
                    {haber.kaynakAd && (
                      <p className={`text-xs ${sub}`}>{haber.kaynakAd}</p>
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
              Haberler Google Haberler üzerinden sunucumuz tarafından <strong>her 30 dakikada bir</strong> otomatik olarak toplanır;
              son 60 günün haberleri listelenir. "Ödeme hesabınıza yatacak" gibi dolandırıcılık kalıbındaki başlıklar otomatik olarak elenir.
              Haberler üçüncü taraf sitelere aittir — tutar ve koşullar için her zaman programın resmi sayfasını kontrol edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
