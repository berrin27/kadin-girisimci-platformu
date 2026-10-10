import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus, X, Check, ChevronRight, Calendar, AlertTriangle,
  TrendingUp, Award, Clock, Filter, Search, Star, StarOff,
  Kanban, List, BarChart3, Flame, Zap, Target, Loader2
} from 'lucide-react';
import { api } from '../api';

const COLUMNS = [
  { id: 'arastirma',  label: 'Araştırılıyor', emoji: '🔍', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'hazirlik',   label: 'Hazırlık',       emoji: '📝', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'basvuruldu', label: 'Başvuruldu',      emoji: '📤', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'beklemede',  label: 'Beklemede',       emoji: '⏳', color: '#f97316', bg: '#fff7ed' },
  { id: 'sonuc',      label: 'Sonuçlandı',      emoji: '✅', color: '#22c55e', bg: '#f0fdf4' },
];

const PRIORITIES = [
  { id: 'yuksek', label: 'Yüksek', color: '#ef4444', icon: '🔴' },
  { id: 'orta',   label: 'Orta',   color: '#f59e0b', icon: '🟡' },
  { id: 'dusuk',  label: 'Düşük',  color: '#22c55e', icon: '🟢' },
];

const CARD_COLORS = ['#7c3aed', '#2563eb', '#db2777', '#059669', '#f97316', '#0891b2', '#dc2626', '#7c3aed'];

const today = new Date();
const addDays = (d) => { const dt = new Date(today); dt.setDate(dt.getDate() + d); return dt.toISOString().split('T')[0]; };

// Yeni kullanıcıya panonun nasıl kullanıldığını gösteren örnek kartlar (gerçek programlar)
const INITIAL_CARDS = [
  {
    id: 'k1', title: 'KOSGEB İş Kurma Desteği', institution: 'KOSGEB',
    amount: '30.000 TL', column: 'arastirma', color: '#7c3aed',
    deadline: addDays(45), priority: 'yuksek', starred: true,
    note: 'Şahıs işletmesi kuruldu, ilk yıl içinde başvurulacak.',
    sonuc: null,
  },
  {
    id: 'k2', title: 'Halkbank Kadın Girişimci Kredisi', institution: 'Halkbank',
    amount: '600.000 TL', column: 'hazirlik', color: '#2563eb',
    deadline: addDays(20), priority: 'yuksek', starred: true,
    note: 'İş planı taslağı %70 tamamlandı.',
    sonuc: null,
  },
  {
    id: 'k3', title: 'KOOP-DES Kooperatif Desteği', institution: 'Ticaret Bakanlığı',
    amount: '750.000 TL', column: 'basvuruldu', color: '#db2777',
    deadline: addDays(-5), priority: 'orta', starred: false,
    note: 'Başvuru İl Müdürlüğüne teslim edildi, onay bekleniyor.',
    sonuc: null,
  },
  {
    id: 'k4', title: 'Ticaret Bakanlığı E-İhracat Desteği', institution: 'Ticaret Bakanlığı',
    amount: 'Giderlerin %50-75\'i', column: 'beklemede', color: '#059669',
    deadline: addDays(60), priority: 'orta', starred: false,
    note: 'Pazaryeri faturaları değerlendirmede.',
    sonuc: null,
  },
  {
    id: 'k5', title: 'Kırsal Kalkınma Yatırım Programı', institution: 'Tarım ve Orman Bakanlığı',
    amount: '150.000 TL', column: 'sonuc', color: '#f97316',
    deadline: addDays(-30), priority: 'dusuk', starred: false,
    note: 'Kabul edildi! Hibe sözleşmesi imzalandı.',
    sonuc: 'kabul',
  },
];

const daysLeft = (deadline) => {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline) - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const parseAmount = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
};

const formatAmount = (n) => {
  if (n >= 1_000_000) return `₺${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₺${(n / 1_000).toFixed(0)}K`;
  return `₺${n}`;
};

export default function BasvuruTakip({ dark }) {
  const [cards, setCards] = useState([]);
  const [yuklendi, setYuklendi] = useState(false);
  const [hata, setHata] = useState('');
  const kayitSirasi = useRef(Promise.resolve());

  // Pano sunucudan yüklenir; hiç kaydedilmemişse örnek kartlar gösterilir.
  useEffect(() => {
    api.kanban.get()
      .then(({ initialized, cards }) => { setCards(initialized ? cards : INITIAL_CARDS); setYuklendi(true); })
      .catch(err => setHata(`Pano yüklenemedi: ${err.message}`));
  }, []);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [view, setView] = useState('kanban'); // kanban | liste | analiz
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '', institution: '', amount: '', column: 'arastirma',
    deadline: '', priority: 'orta', note: '', starred: false, sonuc: null,
  });

  // Kayıtlar sırayla gönderilir — hızlı sürükle-bırakta eski durum yenisini ezmesin.
  const save = (updated) => {
    if (!yuklendi) return;
    setCards(updated);
    kayitSirasi.current = kayitSirasi.current
      .then(() => api.kanban.save(updated))
      .then(() => setHata(''))
      .catch(err => setHata(`Değişiklik kaydedilemedi: ${err.message}`));
  };

  // ── Drag & Drop
  const onDragStart = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver  = (e, colId) => { e.preventDefault(); setDragOverCol(colId); };
  const onDrop = (e, colId) => {
    e.preventDefault();
    if (draggingId) save(cards.map(c => c.id === draggingId ? { ...c, column: colId } : c));
    setDraggingId(null); setDragOverCol(null);
  };
  const onDragEnd = () => { setDraggingId(null); setDragOverCol(null); };

  const deleteCard  = (id) => save(cards.filter(c => c.id !== id));
  const toggleStar  = (id) => save(cards.map(c => c.id === id ? { ...c, starred: !c.starred } : c));

  const openAdd = () => {
    setEditCard(null);
    setForm({ title: '', institution: '', amount: '', column: 'arastirma', deadline: '', priority: 'orta', note: '', starred: false, sonuc: null });
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEditCard(c.id);
    setForm({ title: c.title, institution: c.institution || '', amount: c.amount || '', column: c.column, deadline: c.deadline || '', priority: c.priority || 'orta', note: c.note || '', starred: c.starred || false, sonuc: c.sonuc });
    setShowModal(true);
  };
  const submitForm = () => {
    if (!form.title.trim()) return;
    if (editCard) {
      save(cards.map(c => c.id === editCard ? { ...c, ...form } : c));
    } else {
      save([...cards, { id: `k${Date.now()}`, ...form, color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)] }]);
    }
    setShowModal(false);
  };

  // ── Filtered cards
  const filtered = useMemo(() =>
    cards.filter(c => {
      if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !(c.institution || '').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }), [cards, filterPriority, search]);

  // ── Stats
  const stats = useMemo(() => {
    const total = cards.length;
    const totalAmount = cards.reduce((s, c) => s + parseAmount(c.amount), 0);
    const accepted = cards.filter(c => c.sonuc === 'kabul').length;
    const pending = cards.filter(c => ['basvuruldu', 'beklemede'].includes(c.column)).length;
    const urgent = cards.filter(c => { const d = daysLeft(c.deadline); return d !== null && d >= 0 && d <= 14; }).length;
    return { total, totalAmount, accepted, pending, urgent };
  }, [cards]);

  // ── Theme
  const cardBase = dark ? 'bg-[#1e2840] border-slate-700' : 'bg-white border-slate-100';
  const colBg    = dark ? 'bg-slate-900/50 border-slate-700/60' : 'bg-slate-50/80 border-slate-200';
  const text     = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub      = dark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = `w-full p-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition ${dark ? 'bg-slate-800 border-slate-600 text-white focus:ring-[#F3D5D8] placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-[#F3D5D8]'}`;

  if (!yuklendi) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 py-24 text-sm ${sub}`}>
        {hata
          ? <><AlertTriangle className="w-6 h-6 text-red-500" /> {hata}</>
          : <Loader2 className="w-6 h-6 animate-spin" />}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {hata && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {hata}
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#1E293B] flex items-center justify-center shadow-lg shadow-slate-500/20">
              <Kanban className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-black ${text}`}>Başvuru Takip Çizelgesi</h2>
              <p className={`text-xs mt-0.5 ${sub}`}>Hibe başvurularınızı planlayın, takip edin ve sonuçlandırın</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View switcher */}
          <div className={`flex items-center rounded-xl border overflow-hidden ${dark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}>
            {[
              { id: 'kanban', icon: <Kanban className="w-3.5 h-3.5" />, label: 'Kanban' },
              { id: 'liste',  icon: <List className="w-3.5 h-3.5" />, label: 'Liste' },
              { id: 'analiz', icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Analiz' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${
                  view === v.id
                    ? 'bg-[#1E293B] text-white shadow-sm'
                    : dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>
          <button
            onClick={openAdd}
            className="bg-[#1E293B] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-slate-500/20 hover:opacity-90 transition hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Yeni Başvuru
          </button>
        </div>
      </div>

      {/* ── İSTATİSTİK KARTLARI ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Toplam Başvuru', value: stats.total, sub: 'program takipte', icon: <Target className="w-5 h-5" />, grad: 'from-slate-600 to-slate-800', glow: 'shadow-slate-500/20' },
          { label: 'Toplam Potansiyel', value: formatAmount(stats.totalAmount), sub: 'hibe tutarı', icon: <TrendingUp className="w-5 h-5" />, grad: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/25' },
          { label: 'Değerlendirmede', value: stats.pending, sub: 'başvuru bekliyor', icon: <Clock className="w-5 h-5" />, grad: 'from-orange-500 to-amber-600', glow: 'shadow-orange-500/25' },
          { label: 'Acil Deadline', value: stats.urgent, sub: '14 gün içinde', icon: <Flame className="w-5 h-5" />, grad: 'from-red-500 to-rose-600', glow: 'shadow-red-500/25' },
        ].map((s, i) => (
          <div key={i} className={`${cardBase} border rounded-2xl p-4 shadow-lg ${s.glow} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${s.grad} opacity-10 -translate-y-6 translate-x-6`} />
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white mb-3 shadow-md`}>
              {s.icon}
            </div>
            <p className={`text-2xl font-black ${text}`}>{s.value}</p>
            <p className={`text-xs font-bold mt-0.5 ${sub}`}>{s.label}</p>
            <p className={`text-[10px] mt-0.5 ${sub} opacity-70`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── FİLTRE SATIRI ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className={`flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <Search className={`w-4 h-4 ${sub}`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Başvuru veya kurum ara..."
            className={`flex-1 bg-transparent text-sm outline-none ${text} placeholder:text-slate-400`}
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className={`w-4 h-4 ${sub}`} />
          {['all', 'yuksek', 'orta', 'dusuk'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterPriority === p
                  ? 'bg-[#1E293B] text-white shadow-sm'
                  : dark ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200' : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            >
              {p === 'all' ? 'Tümü' : PRIORITIES.find(x => x.id === p)?.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── KANBAN GÖRÜNÜMǜ ─────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {view === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {COLUMNS.map(col => {
            const colCards = filtered.filter(c => c.column === col.id);
            const isDragTarget = dragOverCol === col.id;
            const colTotal = colCards.reduce((s, c) => s + parseAmount(c.amount), 0);
            return (
              <div
                key={col.id}
                onDragOver={e => onDragOver(e, col.id)}
                onDrop={e => onDrop(e, col.id)}
                className={`flex-shrink-0 w-64 rounded-2xl border transition-all duration-200 ${colBg}
                  ${isDragTarget ? 'ring-2 ring-[#1E293B] ring-offset-2 scale-[1.01] shadow-xl' : ''}`}
              >
                {/* Column header */}
                <div className={`px-3 pt-3 pb-2 border-b ${dark ? 'border-slate-700/60' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{col.emoji}</span>
                    <span className={`font-black text-xs flex-1 ${text}`}>{col.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'text-white'}`}
                      style={{ background: dark ? undefined : col.color }}
                    >
                      {colCards.length}
                    </span>
                  </div>
                  {colTotal > 0 && (
                    <p className="text-[10px] font-bold" style={{ color: col.color }}>
                      {formatAmount(colTotal)} potansiyel
                    </p>
                  )}
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[240px]">
                  {colCards.map(c => {
                    const dl = daysLeft(c.deadline);
                    const isUrgent = dl !== null && dl >= 0 && dl <= 14;
                    const isOverdue = dl !== null && dl < 0;
                    const pri = PRIORITIES.find(p => p.id === c.priority);

                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={e => onDragStart(e, c.id)}
                        onDragEnd={onDragEnd}
                        className={`${cardBase} border rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing group
                          ${draggingId === c.id ? 'opacity-30 rotate-3 scale-90' : 'hover:-translate-y-1'}
                          ${isUrgent ? (dark ? 'border-red-800/60' : 'border-red-200') : ''}
                        `}
                      >
                        {/* Color top bar */}
                        <div className="w-full h-0.5 rounded-full mb-2.5" style={{ background: c.color }} />

                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <p className={`font-bold text-xs leading-snug flex-1 ${text}`}>{c.title}</p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                            <button onClick={() => toggleStar(c.id)} className="p-0.5 rounded">
                              {c.starred ? <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> : <StarOff className="w-3 h-3 text-slate-300" />}
                            </button>
                            <button onClick={() => openEdit(c)} className="p-0.5 rounded text-slate-300 hover:text-blue-400 transition">
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteCard(c.id)} className="p-0.5 rounded text-slate-300 hover:text-red-400 transition">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {c.institution && (
                          <p className={`text-[10px] font-medium ${sub} mb-1.5`}>{c.institution}</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          {c.amount ? (
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                              {c.amount}
                            </span>
                          ) : <span />}
                          {pri && (
                            <span className="text-[10px] font-bold" style={{ color: pri.color }}>
                              {pri.icon}
                            </span>
                          )}
                        </div>

                        {c.deadline && (
                          <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold rounded-lg px-1.5 py-1 ${
                            isOverdue ? 'text-red-400 bg-red-500/10' :
                            isUrgent  ? 'text-orange-400 bg-orange-500/10' :
                            dark ? 'text-slate-400 bg-slate-700/50' : 'text-slate-400 bg-slate-100'
                          }`}>
                            {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                            {isOverdue ? `${Math.abs(dl)} gün geçti` : dl === 0 ? 'Bugün!' : `${dl} gün kaldı`}
                          </div>
                        )}

                        {c.note && (
                          <p className={`mt-2 text-[10px] leading-snug italic ${sub} opacity-75 line-clamp-2`}>{c.note}</p>
                        )}

                        {c.sonuc === 'kabul' && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-emerald-500">
                            <Award className="w-3 h-3" /> Kabul Edildi!
                          </div>
                        )}
                        {c.sonuc === 'ret' && (
                          <div className="mt-2 text-[10px] font-bold text-red-400">✗ Reddedildi</div>
                        )}
                      </div>
                    );
                  })}

                  {colCards.length === 0 && (
                    <div
                      className={`flex flex-col items-center justify-center h-24 text-xs font-medium rounded-xl border-2 border-dashed transition gap-1
                        ${isDragTarget
                          ? 'border-[#1E293B] text-[#1E293B] bg-[#F3D5D8]/40'
                          : dark ? 'border-slate-700 text-slate-600' : 'border-slate-200 text-slate-300'}`}
                    >
                      <span className="text-lg">{col.emoji}</span>
                      {isDragTarget ? 'Buraya bırakın ✦' : 'Boş'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── LİSTE GÖRÜNÜMǜ ─────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {view === 'liste' && (
        <div className={`${cardBase} border rounded-2xl shadow-lg overflow-hidden`}>
          <div className={`grid grid-cols-12 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest ${sub} border-b ${dark ? 'border-slate-700 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
            <div className="col-span-5">Program</div>
            <div className="col-span-2 text-center">Durum</div>
            <div className="col-span-2 text-center">Tutar</div>
            <div className="col-span-2 text-center">Deadline</div>
            <div className="col-span-1 text-center">Önc.</div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filtered.length === 0 && (
              <p className={`text-center py-10 text-sm ${sub}`}>Eşleşen başvuru bulunamadı.</p>
            )}
            {filtered.map(c => {
              const col = COLUMNS.find(x => x.id === c.column);
              const dl  = daysLeft(c.deadline);
              const pri = PRIORITIES.find(p => p.id === c.priority);
              const isOverdue = dl !== null && dl < 0;
              const isUrgent  = dl !== null && dl >= 0 && dl <= 14;
              return (
                <div
                  key={c.id}
                  className={`grid grid-cols-12 px-4 py-3 items-center hover:${dark ? 'bg-slate-800/40' : 'bg-[#F8F3F4]'} transition group cursor-pointer`}
                  onClick={() => openEdit(c)}
                >
                  <div className="col-span-5 flex items-center gap-2.5">
                    <div className="w-1 h-8 rounded-full shrink-0" style={{ background: c.color }} />
                    <div className="min-w-0">
                      <p className={`font-bold text-sm truncate ${text}`}>{c.title}</p>
                      <p className={`text-[10px] ${sub}`}>{c.institution}</p>
                    </div>
                    {c.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className="text-[10px] font-black px-2 py-1 rounded-full text-white" style={{ background: col?.color }}>
                      {col?.emoji} {col?.label}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-xs font-black text-emerald-500">{c.amount || '—'}</span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {c.deadline ? (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        isOverdue ? 'text-red-400 bg-red-500/10' :
                        isUrgent  ? 'text-orange-400 bg-orange-500/10' :
                        dark ? 'text-slate-400 bg-slate-700/50' : 'text-slate-500 bg-slate-100'
                      }`}>
                        {isOverdue ? `${Math.abs(dl)}g geçti` : `${dl}g kaldı`}
                      </span>
                    ) : <span className={`text-[10px] ${sub}`}>—</span>}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <span className="text-base">{pri?.icon || '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── ANALİZ GÖRÜNÜMǜ ─────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {view === 'analiz' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Durum dağılımı */}
          <div className={`${cardBase} border rounded-2xl p-5 shadow-lg`}>
            <h3 className={`font-black text-sm mb-4 flex items-center gap-2 ${text}`}>
              <BarChart3 className="w-4 h-4 text-[#1E293B]" /> Durum Dağılımı
            </h3>
            <div className="space-y-3">
              {COLUMNS.map(col => {
                const count = cards.filter(c => c.column === col.id).length;
                const pct   = cards.length ? Math.round((count / cards.length) * 100) : 0;
                return (
                  <div key={col.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${text}`}>{col.emoji} {col.label}</span>
                      <span className={`text-xs font-black ${text}`}>{count} ({pct}%)</span>
                    </div>
                    <div className={`h-2 rounded-full ${dark ? 'bg-slate-700' : 'bg-slate-100'} overflow-hidden`}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: col.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Öncelik & Tutar */}
          <div className={`${cardBase} border rounded-2xl p-5 shadow-lg`}>
            <h3 className={`font-black text-sm mb-4 flex items-center gap-2 ${text}`}>
              <Zap className="w-4 h-4 text-amber-500" /> Öncelik & Tutar Analizi
            </h3>
            <div className="space-y-3">
              {PRIORITIES.map(pri => {
                const priCards = cards.filter(c => c.priority === pri.id);
                const total = priCards.reduce((s, c) => s + parseAmount(c.amount), 0);
                return (
                  <div key={pri.id} className={`flex items-center justify-between p-3 rounded-xl ${dark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pri.icon}</span>
                      <div>
                        <p className={`text-xs font-bold ${text}`}>{pri.label} Öncelik</p>
                        <p className={`text-[10px] ${sub}`}>{priCards.length} başvuru</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-emerald-500">{formatAmount(total)}</p>
                  </div>
                );
              })}
            </div>

            {/* Başarı durumu */}
            <div className={`mt-4 pt-4 border-t ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h4 className={`font-bold text-xs mb-2 ${sub}`}>Sonuçlar</h4>
              <div className="flex gap-2">
                {[
                  { label: 'Kabul', count: cards.filter(c => c.sonuc === 'kabul').length, color: '#22c55e' },
                  { label: 'Ret',   count: cards.filter(c => c.sonuc === 'ret').length,   color: '#ef4444' },
                  { label: 'Bekliyor', count: cards.filter(c => !c.sonuc).length,          color: '#8b5cf6' },
                ].map(s => (
                  <div key={s.label} className="flex-1 text-center p-2 rounded-xl" style={{ background: s.color + '15' }}>
                    <p className="text-xl font-black" style={{ color: s.color }}>{s.count}</p>
                    <p className={`text-[10px] font-bold ${sub}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yıldızlı başvurular */}
          <div className={`${cardBase} border rounded-2xl p-5 shadow-lg sm:col-span-2`}>
            <h3 className={`font-black text-sm mb-4 flex items-center gap-2 ${text}`}>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Öncelikli Takip Listesi
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {cards.filter(c => c.starred).length === 0 && (
                <p className={`text-xs ${sub} col-span-2`}>Henüz yıldızlanmış başvuru yok. Kanban görünümünde kartların üzerindeki ⭐ ile ekleyebilirsiniz.</p>
              )}
              {cards.filter(c => c.starred).map(c => {
                const col = COLUMNS.find(x => x.id === c.column);
                const dl  = daysLeft(c.deadline);
                return (
                  <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-amber-100 bg-amber-50/60'}`}>
                    <div className="w-1 h-10 rounded-full" style={{ background: c.color }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${text}`}>{c.title}</p>
                      <p className={`text-[10px] ${sub}`}>{col?.emoji} {col?.label} • {c.amount}</p>
                    </div>
                    {dl !== null && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${dl < 0 ? 'text-red-400 bg-red-500/10' : dl <= 14 ? 'text-orange-400 bg-orange-500/10' : dark ? 'text-slate-400 bg-slate-700' : 'text-slate-500 bg-slate-100'}`}>
                        {dl < 0 ? `${Math.abs(dl)}g geçti` : `${dl}g`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL ──────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className={`${dark ? 'bg-[#1e2840] border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl shadow-2xl w-full max-w-lg p-6`}
            style={{ animation: 'fadeUp 0.25s ease' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1E293B] flex items-center justify-center">
                  {editCard ? <ChevronRight className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                </div>
                <h3 className={`font-black text-lg ${text}`}>{editCard ? 'Başvuruyu Düzenle' : 'Yeni Başvuru Ekle'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className={`p-1.5 rounded-lg transition ${dark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Program Adı *</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="KOSGEB Girişimci Desteği..." className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Kurum</label>
                  <input type="text" value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} placeholder="KOSGEB, TÜBİTAK..." className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Hibe Miktarı</label>
                  <input type="text" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="300.000 TL" className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Son Başvuru Tarihi</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Öncelik</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className={inputCls}>
                    {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Durum</label>
                  <select value={form.column} onChange={e => setForm(p => ({ ...p, column: e.target.value }))} className={inputCls}>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
                {form.column === 'sonuc' && (
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Sonuç</label>
                    <select value={form.sonuc || ''} onChange={e => setForm(p => ({ ...p, sonuc: e.target.value || null }))} className={inputCls}>
                      <option value="">Belirsiz</option>
                      <option value="kabul">✅ Kabul Edildi</option>
                      <option value="ret">❌ Reddedildi</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>Not / Açıklama</label>
                  <textarea
                    value={form.note}
                    onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="Başvuru ile ilgili notlarınız..."
                    rows={2}
                    className={inputCls + ' resize-none'}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <button
                    onClick={() => setForm(p => ({ ...p, starred: !p.starred }))}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border transition ${form.starred ? 'border-amber-400 text-amber-500 bg-amber-50' : dark ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-400'}`}
                  >
                    {form.starred ? <Star className="w-3.5 h-3.5 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}
                    {form.starred ? 'Yıldızlı' : 'Yıldızla'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 p-3 rounded-xl font-bold border transition text-sm ${dark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  İptal
                </button>
                <button
                  onClick={submitForm}
                  disabled={!form.title.trim()}
                  className="flex-1 bg-[#1E293B] text-white p-3 rounded-xl font-bold text-sm disabled:opacity-40 hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-500/20"
                >
                  <Check className="w-4 h-4" /> {editCard ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
