import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  CalendarDays,
  MapPin,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Bookmark,
  ArrowRight,
  Sparkles,
  X,
  ExternalLink,
  Trash2,
  Loader2,
  Plus,
} from 'lucide-react';
import { api } from '../api';
import { etkinlikler, fuarKaynaklari, supportData, SON_KONTROL } from '../data';

// Fuara katılımla ilgili destek programları (data.js'ten)
const FUAR_PROGRAMLARI = ['ticaret-fuar', 'halkbank-kadin-ihracatci', 'ticaret-eihracat']
  .map(id => supportData.find(p => p.id === id))
  .filter(Boolean);

const TUR_STIL = {
  'Yarışma':     { cover: 'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f472b6 100%)', accent: '#db2777' },
  'Ödül':        { cover: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #ec4899 100%)', accent: '#8b5cf6' },
  'Hibe / Fon':  { cover: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 55%, #1d4ed8 100%)', accent: '#2563eb' },
  'Hızlandırma': { cover: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 60%, #115e59 100%)', accent: '#0f766e' },
  'Fuar':        { cover: 'linear-gradient(135deg, #f59e0b 0%, #f97316 55%, #ea580c 100%)', accent: '#f97316' },
  'Eğitim':      { cover: 'linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%)', accent: '#16a34a' },
  'Benim etkinliğim': { cover: 'linear-gradient(135deg, #475569 0%, #334155 60%, #1e293b 100%)', accent: '#475569' },
};
const TURLER = Object.keys(TUR_STIL);

const DURUM_ETIKET = { acik: 'Başvurular açık', yaklasan: 'Yaklaşan', bitti: 'Sona erdi' };

const bugun = () => new Date().toISOString().slice(0, 10);
const tarihYaz = (iso, saat) => {
  const t = new Date(`${iso}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  return saat ? `${t} · ${saat}` : t;
};
const kalanGun = (iso) => Math.ceil((new Date(`${iso}T23:59:59`) - new Date()) / 86_400_000);

// Resmi etkinlikler ve kullanıcının etkinlikleri tek biçime getirilir
const resmiEtkinlik = (e) => {
  const b = bugun();
  const durum = e.baslangic && b < e.baslangic ? 'yaklasan' : b <= e.bitis ? 'acik' : 'bitti';
  return { ...e, favId: e.id, benim: false, durum, siraTarihi: e.bitis, ...TUR_STIL[e.tur] };
};
const benimEtkinligim = (e) => ({
  ...e,
  id: `benim-${e.id}`,
  kayitId: e.id,
  benim: true,
  tur: 'Benim etkinliğim',
  duzenleyen: 'Kendi takvimim',
  aciklama: e.notlar,
  ucret: 'Kişisel',
  durum: bugun() <= e.tarih ? 'yaklasan' : 'bitti',
  siraTarihi: e.tarih,
  ...TUR_STIL['Benim etkinliğim'],
});

const BOS_ETKINLIK = { baslik: '', tarih: '', saat: '', konum: '', link: '', notlar: '' };

export default function FuarDestekleri({ dark }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tümü');
  const [statusFilter, setStatusFilter] = useState('Güncel');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [view, setView] = useState('grid');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [benimkiler, setBenimkiler] = useState([]);
  const [formAcik, setFormAcik] = useState(false);
  const [yeni, setYeni] = useState(BOS_ETKINLIK);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [formHata, setFormHata] = useState('');

  useEffect(() => {
    api.favorites.list('fuar').then(({ ids }) => setFavoriteIds(ids)).catch(() => {});
    api.events.list().then(({ events }) => setBenimkiler(events)).catch(() => {});
  }, []);

  const pageBg = dark ? 'bg-[#0d1117]' : 'bg-[#f8fafc]';
  const surface = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const softText = dark ? 'text-slate-300' : 'text-slate-600';
  const text = dark ? 'text-white' : 'text-slate-900';
  const subText = dark ? 'text-slate-400' : 'text-slate-600';
  const fieldCls = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F3D5D8] ${dark ? 'border-slate-700 bg-slate-900 text-white placeholder:text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400'}`;

  const tumEtkinlikler = useMemo(
    () => [...etkinlikler.map(resmiEtkinlik), ...benimkiler.map(benimEtkinligim)],
    [benimkiler],
  );

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return tumEtkinlikler
      .filter((event) => {
        const matchesFavorite = !showFavoritesOnly || event.benim || favoriteIds.includes(event.favId);
        const matchesQuery = !q || [event.baslik, event.duzenleyen, event.aciklama, event.konum]
          .some(alan => (alan || '').toLocaleLowerCase('tr-TR').includes(q));
        const matchesType = typeFilter === 'Tümü' || event.tur === typeFilter;
        const matchesStatus = statusFilter === 'Tümü'
          || (statusFilter === 'Güncel' && event.durum !== 'bitti')
          || (statusFilter === 'Sona eren' && event.durum === 'bitti');
        return matchesQuery && matchesType && matchesStatus && matchesFavorite;
      })
      .sort((a, b) => a.siraTarihi.localeCompare(b.siraTarihi));
  }, [tumEtkinlikler, favoriteIds, query, showFavoritesOnly, statusFilter, typeFilter]);

  // İyimser güncelleme; hata olursa sunucudaki listeyle yeniden senkronlanır
  const toggleFavorite = (eventId) => {
    const isFav = favoriteIds.includes(eventId);
    setFavoriteIds((prev) => isFav ? prev.filter((id) => id !== eventId) : [...prev, eventId]);
    (isFav ? api.favorites.remove('fuar', eventId) : api.favorites.add('fuar', eventId))
      .then(({ ids }) => setFavoriteIds(ids))
      .catch(() => api.favorites.list('fuar').then(({ ids }) => setFavoriteIds(ids)).catch(() => {}));
  };

  const etkinlikEkle = async (e) => {
    e.preventDefault();
    setKaydediliyor(true);
    setFormHata('');
    try {
      const { event } = await api.events.create(yeni);
      setBenimkiler(prev => [...prev, event]);
      setYeni(BOS_ETKINLIK);
      setFormAcik(false);
    } catch (err) {
      setFormHata(err.message);
    } finally {
      setKaydediliyor(false);
    }
  };

  const etkinlikSil = async (event) => {
    if (!window.confirm(`"${event.baslik}" takviminden silinsin mi?`)) return;
    try {
      await api.events.remove(event.kayitId);
      setBenimkiler(prev => prev.filter(e => e.id !== event.kayitId));
      setSelectedEvent(null);
    } catch (err) {
      window.alert(err.message);
    }
  };

  const tarihSatiri = (event) => event.benim
    ? tarihYaz(event.tarih, event.saat)
    : `Son başvuru: ${tarihYaz(event.bitis)}`;

  const kalanEtiket = (event) => {
    if (event.durum === 'bitti') return 'Sona erdi';
    if (event.durum === 'yaklasan' && !event.benim) return `Başvurular ${tarihYaz(event.baslangic)}'de açılıyor`;
    const gun = kalanGun(event.benim ? event.tarih : event.bitis);
    return gun <= 0 ? 'Bugün son gün' : `${gun} gün kaldı`;
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 mt-12 pb-24 ${pageBg}`}>
      <header className="mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${dark ? 'bg-sky-500/10 text-sky-300' : 'bg-[#EAF4FB] text-[#2B5472]'}`}>
              <Sparkles className="w-4 h-4" />
              Fırsatlar
            </div>
            <h1 className={`mt-5 text-3xl font-black tracking-tight sm:text-4xl ${text}`}>
              Başvurusu Açık Fırsatlar
            </h1>
            <p className={`mt-3 max-w-2xl text-base ${subText}`}>
              Kadın girişimcilere yönelik güncel yarışma, ödül, hibe ve programlar — hepsi resmi kaynaklarıyla.
              Katılacağın etkinlikleri kendi takvimine de ekleyebilirsin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${showFavoritesOnly ? 'border-[#F3D5D8] bg-[#F3D5D8] text-[#4A1525]' : dark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <Bookmark className="w-4 h-4" />
              {showFavoritesOnly ? 'Takibim: Açık' : 'Takip Ettiklerim'}
            </button>
            <button
              onClick={() => { setFormAcik(true); setFormHata(''); }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              <Plus className="w-4 h-4" />
              Kendi etkinliğimi ekle
            </button>
          </div>
        </div>
      </header>

      {/* ── Rehber: fuara katılım destekleri ve resmi listeler ─────────────── */}
      <section className={`mb-8 rounded-2xl border p-5 shadow-sm ${surface}`}>
        <h2 className={`text-lg font-black ${text}`}>Fuara katılım destekleri</h2>
        <p className={`mt-1 text-sm ${subText}`}>Bir fuara stant açmayı veya yurt dışına satış yapmayı düşünüyorsan bu destekler masrafların bir kısmını karşılar.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {FUAR_PROGRAMLARI.map(p => (
            <a key={p.id} href={p.link} target="_blank" rel="noreferrer"
              className={`group rounded-xl border p-4 transition hover:shadow-md ${dark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{p.institution}</div>
              <div className={`mt-1 text-sm font-bold ${text}`}>{p.title}</div>
              <div className="mt-2 text-sm font-black text-emerald-600">{p.amount}</div>
              <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${softText}`}>Resmi sayfa <ExternalLink className="h-3 w-3" /></div>
            </a>
          ))}
        </div>
        <div className="mt-5">
          <div className={`text-xs font-bold uppercase tracking-wider ${subText}`}>Resmi fuar listeleri</div>
          <ul className="mt-2 grid gap-2 md:grid-cols-2">
            {fuarKaynaklari.map(k => (
              <li key={k.link}>
                <a href={k.link} target="_blank" rel="noreferrer" className={`flex items-start gap-2 text-sm hover:underline ${softText}`}>
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span><strong className={text}>{k.baslik}</strong> — {k.kurum}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`rounded-2xl border p-4 shadow-sm ${surface}`}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1 min-w-0">
            <Search className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${softText}`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Etkinlik, kurum veya başlık ara..."
              className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#9FC7E8] focus:ring-2 focus:ring-[#D9EDF9]/60 ${dark ? 'border-slate-700 bg-slate-900 text-white placeholder:text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400'}`}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm">
              <SlidersHorizontal className={`h-4 w-4 ${softText}`} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Etkinlik türü"
                className={`bg-transparent text-sm outline-none ${dark ? 'text-slate-200' : 'text-slate-700'}`}
              >
                <option>Tümü</option>
                {TURLER.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm">
              <CalendarDays className={`h-4 w-4 ${softText}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Durum"
                className={`bg-transparent text-sm outline-none ${dark ? 'text-slate-200' : 'text-slate-700'}`}
              >
                <option value="Güncel">Açık ve yaklaşan</option>
                <option>Sona eren</option>
                <option>Tümü</option>
              </select>
            </div>

            <div className={`inline-flex items-center rounded-xl border p-1 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <button
                onClick={() => setView('grid')}
                className={`rounded-lg p-2 transition ${view === 'grid' ? 'bg-[#F3D5D8] text-[#4A1525]' : dark ? 'text-slate-300' : 'text-slate-600'}`}
                aria-label="Grid görünümü"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`rounded-lg p-2 transition ${view === 'list' ? 'bg-[#F3D5D8] text-[#4A1525]' : dark ? 'text-slate-300' : 'text-slate-600'}`}
                aria-label="Liste görünümü"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className={view === 'grid' ? 'mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' : 'mt-8 space-y-5'}>
        {filteredEvents.length === 0 ? (
          <div className={`col-span-full rounded-2xl border p-10 text-center ${surface}`}>
            <p className={`text-lg font-semibold ${text}`}>Aramanıza uygun etkinlik bulunamadı.</p>
            <p className={`mt-2 text-sm ${subText}`}>Farklı bir filtre deneyebilir ya da kendi etkinliğini ekleyebilirsin.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <article
              key={event.id}
              className={`group overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${surface} ${view === 'list' ? 'md:flex md:flex-row' : ''} ${event.durum === 'bitti' ? 'opacity-70' : ''}`}
            >
              <div
                className={`relative ${view === 'list' ? 'h-40 md:h-auto md:w-72' : 'h-40'} overflow-hidden`}
                style={{ background: event.cover }}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute left-4 top-4 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                  {event.ucret}
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-slate-950/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {event.tur}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-4 text-white">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-200">{DURUM_ETIKET[event.durum]}</div>
                  <div className="mt-1 text-xs font-semibold">{kalanEtiket(event)}</div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CalendarDays className="h-4 w-4 text-[#7DA5C2]" />
                  <span className={subText}>{tarihSatiri(event)}</span>
                </div>

                <h2 className={`mt-3 text-lg font-black leading-snug ${text} line-clamp-2`}>{event.baslik}</h2>

                {event.aciklama && (
                  <p className={`mt-3 text-sm leading-6 ${subText} line-clamp-3`}>{event.aciklama}</p>
                )}

                <div className={`mt-5 pt-4 flex items-center gap-3 border-t ${dark ? 'border-slate-700/80' : 'border-slate-200/70'}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: event.accent }}>
                    {event.duzenleyen.slice(0, 2).toLocaleUpperCase('tr-TR')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{event.benim ? 'Konum' : 'Düzenleyen'}</div>
                    <div className={`truncate text-sm font-semibold ${text}`}>{event.benim ? (event.konum || '—') : event.duzenleyen}</div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  {event.benim ? (
                    <button type="button" onClick={() => etkinlikSil(event)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${dark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                      <Trash2 className="h-3.5 w-3.5" /> Sil
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(event.favId)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${favoriteIds.includes(event.favId) ? 'border-[#F3D5D8] bg-[#F3D5D8] text-[#4A1525]' : dark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${favoriteIds.includes(event.favId) ? 'fill-current' : ''}`} />
                      {favoriteIds.includes(event.favId) ? 'Takipten Çıkar' : 'Takip Et'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-95"
                  >
                    Detayları Gör
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </main>

      <div className={`mt-8 flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3 ${surface}`}>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-[#7DA5C2]" />
          <span className={subText}>{filteredEvents.length} etkinlik gösteriliyor</span>
        </div>
        <span className={`text-xs ${subText}`}>Etkinlikler {SON_KONTROL}'da resmi kaynaklardan kontrol edildi.</span>
      </div>

      {/* ── Detay penceresi ─────────────────────────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className={`relative w-full max-w-2xl overflow-hidden rounded-[28px] border shadow-2xl ${surface}`} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className={`absolute right-4 top-4 rounded-full p-2 transition ${dark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-40" style={{ background: selectedEvent.cover }}>
              <div className="flex h-full items-end justify-between p-6">
                <div>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                    {DURUM_ETIKET[selectedEvent.durum]} · {kalanEtiket(selectedEvent)}
                  </span>
                  <h3 className="mt-3 text-2xl font-black text-white">{selectedEvent.baslik}</h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center gap-3 text-sm">
                <CalendarDays className="h-4 w-4 text-[#7DA5C2]" />
                <span className={subText}>
                  {selectedEvent.benim ? tarihYaz(selectedEvent.tarih, selectedEvent.saat)
                    : selectedEvent.baslangic ? `${tarihYaz(selectedEvent.baslangic)} – ${tarihYaz(selectedEvent.bitis)}`
                    : `Son başvuru: ${tarihYaz(selectedEvent.bitis)}`}
                </span>
              </div>

              {selectedEvent.aciklama && <p className={`text-base leading-7 ${subText}`}>{selectedEvent.aciklama}</p>}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Konum</div>
                  <div className={`mt-2 font-semibold ${text}`}>{selectedEvent.konum || '—'}</div>
                </div>
                <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Düzenleyen</div>
                  <div className={`mt-2 font-semibold ${text}`}>{selectedEvent.duzenleyen}</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                {selectedEvent.benim ? (
                  <button type="button" onClick={() => etkinlikSil(selectedEvent)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${dark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    <Trash2 className="h-4 w-4" /> Takvimimden sil
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleFavorite(selectedEvent.favId)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${favoriteIds.includes(selectedEvent.favId) ? 'border-[#F3D5D8] bg-[#F3D5D8] text-[#4A1525]' : dark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  >
                    <Bookmark className={`h-4 w-4 ${favoriteIds.includes(selectedEvent.favId) ? 'fill-current' : ''}`} />
                    {favoriteIds.includes(selectedEvent.favId) ? 'Takipten Çıkar' : 'Takip Et'}
                  </button>
                )}

                {selectedEvent.link && (
                  <a href={selectedEvent.link} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95">
                    {selectedEvent.benim ? 'Bağlantıya git' : 'Resmi sayfaya git'} <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              {!selectedEvent.benim && (
                <a href={selectedEvent.kaynak} target="_blank" rel="noreferrer" className={`mt-4 block text-right text-[11px] hover:underline ${subText}`}>
                  Kaynak · {SON_KONTROL}'da kontrol edildi
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Kendi etkinliğini ekle ──────────────────────────────────────────── */}
      {formAcik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setFormAcik(false)}>
          <form onSubmit={etkinlikEkle} onClick={e => e.stopPropagation()}
            className={`relative w-full max-w-lg rounded-[28px] border p-6 shadow-2xl ${surface}`}>
            <button type="button" onClick={() => setFormAcik(false)} aria-label="Kapat"
              className={`absolute right-4 top-4 rounded-full p-2 ${dark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
              <X className="h-4 w-4" />
            </button>
            <h3 className={`text-xl font-black ${text}`}>Kendi etkinliğini ekle</h3>
            <p className={`mt-1 mb-5 text-sm ${subText}`}>Katılacağın fuar, eğitim veya başvuru tarihini takvimine ekle. Yalnızca sen görürsün.</p>

            <div className="space-y-3">
              <label className="block">
                <span className={`text-xs font-bold ${softText}`}>Etkinlik adı *</span>
                <input required value={yeni.baslik} onChange={e => setYeni({ ...yeni, baslik: e.target.value })}
                  placeholder="ör. İstanbul El Sanatları Fuarı" className={`mt-1 ${fieldCls}`} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={`text-xs font-bold ${softText}`}>Tarih *</span>
                  <input required type="date" value={yeni.tarih} onChange={e => setYeni({ ...yeni, tarih: e.target.value })} className={`mt-1 ${fieldCls}`} />
                </label>
                <label className="block">
                  <span className={`text-xs font-bold ${softText}`}>Saat</span>
                  <input type="time" value={yeni.saat} onChange={e => setYeni({ ...yeni, saat: e.target.value })} className={`mt-1 ${fieldCls}`} />
                </label>
              </div>
              <label className="block">
                <span className={`text-xs font-bold ${softText}`}>Konum</span>
                <input value={yeni.konum} onChange={e => setYeni({ ...yeni, konum: e.target.value })} placeholder="ör. Online veya Ankara ATO Congresium" className={`mt-1 ${fieldCls}`} />
              </label>
              <label className="block">
                <span className={`text-xs font-bold ${softText}`}>Bağlantı</span>
                <input type="url" value={yeni.link} onChange={e => setYeni({ ...yeni, link: e.target.value })} placeholder="https://" className={`mt-1 ${fieldCls}`} />
              </label>
              <label className="block">
                <span className={`text-xs font-bold ${softText}`}>Not</span>
                <textarea rows={2} value={yeni.notlar} onChange={e => setYeni({ ...yeni, notlar: e.target.value })} placeholder="ör. Stant için ürün numunelerini hazırla" className={`mt-1 ${fieldCls}`} />
              </label>
            </div>

            {formHata && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{formHata}</p>}

            <button type="submit" disabled={kaydediliyor}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E293B] py-3 text-sm font-bold text-white disabled:opacity-60">
              {kaydediliyor && <Loader2 className="h-4 w-4 animate-spin" />} Takvimime ekle
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
