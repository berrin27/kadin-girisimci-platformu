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
  Star,
  X,
} from 'lucide-react';
import { api } from '../api';

const ETKINLIKLER = [
  {
    id: 1,
    type: 'Webinar',
    badge: 'Ücretsiz',
    status: 'Yaklaşan',
    title: 'Kadın Girişimciler için Dijital Pazar Geliştirme Atölyesi',
    description:
      'Müşteri kazanımını artırmak için SEO, e-ticaret ve sosyal medya stratejilerini adım adım öğrenin. Uygulanabilir örneklerle ilerleyen canlı bir oturum.',
    organizer: 'KOSGEB',
    date: '15 Ekim 2026 • 14:00 (TSİ)',
    location: 'Online Webinar',
    cover: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #ec4899 100%)',
    accent: '#8b5cf6',
  },
  {
    id: 2,
    type: 'Hibe / Fon',
    badge: 'Son Başvuru: 3 Gün',
    status: 'Yaklaşan',
    title: '2026 Kadın Girişimci Hibe ve Teşvik Paketi',
    description:
      'Düzenli olarak güncellenen yeni hibe çağrıları ve teşvik paketleri hakkında detaylı rehberlik alın. Başvuru öncesi değerlendirme ve planlama için ideal fırsat.',
    organizer: 'Ticaret Bakanlığı',
    date: '18 Ekim 2026 • 11:30 (TSİ)',
    location: 'Ankara / Online',
    cover: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 60%, #1d4ed8 100%)',
    accent: '#2563eb',
  },
  {
    id: 3,
    type: 'Atölye',
    badge: 'Sınırlı Kontenjan',
    status: 'Yaklaşan',
    title: 'Finansal Okuryazarlık ve Nakit Akışı Yönetimi',
    description:
      'İşletmenizin nakit akışını korumak için bütçe, gelir ve harcama planlamasını öğrenin. Pratik örneklerle daha güçlü bir finansal yapı kurun.',
    organizer: 'Halkbank Akademi',
    date: '22 Ekim 2026 • 10:00 (TSİ)',
    location: 'İstanbul',
    cover: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 55%, #22c55e 100%)',
    accent: '#14b8a6',
  },
  {
    id: 4,
    type: 'Networking',
    badge: 'Ağ Günü',
    status: 'Yaklaşan',
    title: 'Kadın Girişimciler Dünyası: Mentor ve İş Ortağı Buluşması',
    description:
      'Başarılı kadın girişimcilerle tanışın, iş ortaklığı fırsatlarını görün ve sektör ağınızı genişletin. Profesyonel buluşma ve mentorluk etkinliği.',
    organizer: 'TOBB',
    date: '27 Ekim 2026 • 18:30 (TSİ)',
    location: 'İzmir',
    cover: 'linear-gradient(135deg, #f59e0b 0%, #fb7185 55%, #ec4899 100%)',
    accent: '#f59e0b',
  },
  {
    id: 5,
    type: 'Webinar',
    badge: 'Kaydol',
    status: 'Geçmiş',
    title: 'Yurt Dışı Fuar Katılımı ve İhracat Hazırlık Rehberi',
    description:
      'Fuar katılımı, ihracat planlaması ve doğru pazarlama stratejileri için örnek olay incelemeleri ve rehberlik içerikleri.',
    organizer: 'İhracatçı Kadınlar Derneği',
    date: '3 Eylül 2026 • 13:00 (TSİ)',
    location: 'Uzaktan',
    cover: 'linear-gradient(135deg, #1f2937 0%, #475569 45%, #334155 100%)',
    accent: '#475569',
  },
  {
    id: 6,
    type: 'Hibe / Fon',
    badge: 'Yeni',
    status: 'Yaklaşan',
    title: 'Yatırım ve Hibe Başvurusu Hazırlık Ekibi',
    description:
      'Başvuru sürecini kolaylaştıracak proje planlama, pitch hazırlığı ve bütçe taslağı çalışmalarıyla girişimciler için özel bir akış.',
    organizer: 'Sabancı Vakfı',
    date: '1 Kasım 2026 • 15:00 (TSİ)',
    location: 'Online',
    cover: 'linear-gradient(135deg, #db2777 0%, #ec4899 52%, #f472b6 100%)',
    accent: '#db2777',
  },
];

export default function FuarDestekleri({ dark }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tümü');
  const [statusFilter, setStatusFilter] = useState('Yaklaşan');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [view, setView] = useState('grid');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    api.favorites.list('fuar').then(({ ids }) => setFavoriteIds(ids)).catch(() => {});
  }, []);

  const pageBg = dark ? 'bg-[#0d1117]' : 'bg-[#f8fafc]';
  const surface = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const softText = dark ? 'text-slate-300' : 'text-slate-600';
  const text = dark ? 'text-white' : 'text-slate-900';
  const subText = dark ? 'text-slate-400' : 'text-slate-600';

  const filteredEvents = useMemo(() => {
    return ETKINLIKLER.filter((event) => {
      const matchesFavorite = !showFavoritesOnly || favoriteIds.includes(event.id);
      const matchesQuery =
        query.trim() === '' ||
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.organizer.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase());

      const matchesType = typeFilter === 'Tümü' || event.type === typeFilter;
      const matchesStatus = statusFilter === 'Tümü' || event.status === statusFilter;

      return matchesQuery && matchesType && matchesStatus && matchesFavorite;
    });
  }, [favoriteIds, query, showFavoritesOnly, statusFilter, typeFilter]);

  // İyimser güncelleme; hata olursa sunucudaki listeyle yeniden senkronlanır
  const toggleFavorite = (eventId) => {
    const isFav = favoriteIds.includes(eventId);
    setFavoriteIds((prev) => isFav ? prev.filter((id) => id !== eventId) : [...prev, eventId]);
    (isFav ? api.favorites.remove('fuar', eventId) : api.favorites.add('fuar', eventId))
      .then(({ ids }) => setFavoriteIds(ids))
      .catch(() => api.favorites.list('fuar').then(({ ids }) => setFavoriteIds(ids)).catch(() => {}));
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 mt-12 pb-24 ${pageBg}`}>
      <header className="mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${dark ? 'bg-sky-500/10 text-sky-300' : 'bg-[#EAF4FB] text-[#2B5472]'}`}>
              <Sparkles className="w-4 h-4" />
              Etkinlikler ve Fırsatlar
            </div>
            <h1 className={`mt-5 text-3xl font-black tracking-tight sm:text-4xl ${text}`}>
              Etkinlikler ve Fırsatlar
            </h1>
            <p className={`mt-3 max-w-2xl text-base ${subText}`}>
              Girişiminiz için en güncel webinarlar, hibeler, hızlandırma programları ve networking etkinlikleri.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${showFavoritesOnly ? 'border-[#F3D5D8] bg-[#F3D5D8] text-[#4A1525]' : dark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <Bookmark className="w-4 h-4" />
              {showFavoritesOnly ? 'Favorilerim: Açık' : 'Favorilerim'}
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
              <span className="text-base leading-none">＋</span>
              Etkinlik Oluştur
            </button>
          </div>
        </div>
      </header>

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
                className={`bg-transparent text-sm outline-none ${dark ? 'text-slate-200' : 'text-slate-700'}`}
              >
                <option>Tümü</option>
                <option>Webinar</option>
                <option>Hibe / Fon</option>
                <option>Atölye</option>
                <option>Networking</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm">
              <CalendarDays className={`h-4 w-4 ${softText}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`bg-transparent text-sm outline-none ${dark ? 'text-slate-200' : 'text-slate-700'}`}
              >
                <option>Yaklaşan</option>
                <option>Geçmiş</option>
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
            <p className={`mt-2 text-sm ${subText}`}>Farklı bir filtre veya arama kelimesi deneyebilirsiniz.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <article
              key={event.id}
              className={`group overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${surface} ${view === 'list' ? 'md:flex md:flex-row' : ''}`}
            >
              <div
                className={`relative ${view === 'list' ? 'h-52 md:h-auto md:w-72' : 'h-52'} overflow-hidden`}
                style={{ background: event.cover }}
              >
                <div className="absolute inset-0 bg-black/10" />

                <div className="absolute left-4 top-4 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                  {event.badge}
                </div>

                <div className="absolute right-4 top-4 rounded-full bg-slate-950/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {event.type}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-900/60 to-transparent p-4">
                  <div className="text-white">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-200">{event.status}</div>
                    <div className="mt-1 text-xs font-medium text-slate-100">{event.location}</div>
                  </div>
                  <div className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                    {event.type}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <CalendarDays className="h-4 w-4 text-[#7DA5C2]" />
                  <span className={subText}>{event.date}</span>
                </div>

                <h2 className={`mt-3 text-lg font-black leading-snug ${text} line-clamp-2`}>
                  {event.title}
                </h2>

                <p className={`mt-3 text-sm leading-6 ${subText} line-clamp-3`}>
                  {event.description}
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700/80">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: event.accent }}
                  >
                    {event.organizer.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Düzenleyen</div>
                    <div className={`text-sm font-semibold ${text}`}>{event.organizer}</div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(event.id)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${favoriteIds.includes(event.id) ? 'border-[#F3D5D8] bg-[#F3D5D8] text-[#4A1525]' : dark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${favoriteIds.includes(event.id) ? 'fill-current' : ''}`} />
                    {favoriteIds.includes(event.id) ? 'Favoriden Çıkar' : 'Favorilere Ekle'}
                  </button>

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

      <div className={`mt-8 flex items-center justify-between rounded-2xl border px-4 py-3 ${surface}`}>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="h-4 w-4 text-[#7DA5C2]" />
          <span className={subText}>{filteredEvents.length} etkinlik gösteriliyor</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#456E8A]">
          <Star className="h-4 w-4 fill-current" />
          En iyi fırsatları takip edin
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className={`relative w-full max-w-2xl overflow-hidden rounded-[28px] border shadow-2xl ${surface}`}>
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className={`absolute right-4 top-4 rounded-full p-2 transition ${dark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-52" style={{ background: selectedEvent.cover }}>
              <div className="flex h-full items-end justify-between p-6">
                <div>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                    {selectedEvent.badge}
                  </span>
                  <h3 className="mt-3 text-2xl font-black text-white">{selectedEvent.title}</h3>
                </div>
                <span className="rounded-full bg-slate-950/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {selectedEvent.type}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center gap-3 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4 text-[#7DA5C2]" />
                <span className={subText}>{selectedEvent.date}</span>
              </div>

              <p className={`text-base leading-7 ${subText}`}>
                {selectedEvent.description}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Konum</div>
                  <div className={`mt-2 font-semibold ${text}`}>{selectedEvent.location}</div>
                </div>
                <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Düzenleyen</div>
                  <div className={`mt-2 font-semibold ${text}`}>{selectedEvent.organizer}</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedEvent.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${favoriteIds.includes(selectedEvent.id) ? 'border-[#F3D5D8] bg-[#F3D5D8] text-[#4A1525]' : dark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                >
                  <Bookmark className={`h-4 w-4 ${favoriteIds.includes(selectedEvent.id) ? 'fill-current' : ''}`} />
                  {favoriteIds.includes(selectedEvent.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-xl bg-[#1E293B] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
