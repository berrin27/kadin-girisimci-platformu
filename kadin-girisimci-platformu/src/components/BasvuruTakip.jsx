import React, { useState } from 'react';
import { Plus, X, Check, GripVertical } from 'lucide-react';

const COLUMNS = [
  { id: 'arastirma',  label: '🔍 Araştırılıyor', dot: '#3b82f6' },
  { id: 'hazirlik',   label: '📝 Hazırlık',       dot: '#f59e0b' },
  { id: 'basvuruldu', label: '📤 Başvuruldu',      dot: '#8b5cf6' },
  { id: 'beklemede',  label: '⏳ Beklemede',       dot: '#f97316' },
  { id: 'sonuc',      label: '✅ Sonuçlandı',      dot: '#22c55e' },
];

const CARD_COLORS = ['#7c3aed', '#2563eb', '#db2777', '#059669', '#f97316', '#0891b2'];

const INITIAL_CARDS = [
  { id: 'k1', title: 'KOSGEB Girişimci Destek Programı', institution: 'KOSGEB',       amount: '300.000 TL',    column: 'arastirma',  color: '#7c3aed' },
  { id: 'k2', title: 'TÜBİTAK 1512 BİGG Programı',      institution: 'TÜBİTAK',      amount: '900.000 TL',    column: 'hazirlik',   color: '#2563eb' },
  { id: 'k3', title: 'Sabancı Vakfı Hibe Programı',      institution: 'Sabancı Vakfı', amount: '50.000 TL',    column: 'basvuruldu', color: '#db2777' },
  { id: 'k4', title: 'Ticaret Bakanlığı E-İhracat',      institution: 'Ticaret Bak.', amount: '2.500.000 TL',  column: 'beklemede',  color: '#059669' },
];

export default function BasvuruTakip({ dark }) {
  const [cards, setCards] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fortuno-kanban') || 'null') || INITIAL_CARDS; }
    catch { return INITIAL_CARDS; }
  });
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', institution: '', amount: '', column: 'arastirma' });

  const save = (updated) => {
    setCards(updated);
    try { localStorage.setItem('fortuno-kanban', JSON.stringify(updated)); } catch { }
  };

  // Drag & Drop
  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e, colId) => {
    e.preventDefault();
    setDragOverCol(colId);
  };
  const onDrop = (e, colId) => {
    e.preventDefault();
    if (draggingId) save(cards.map(c => c.id === draggingId ? { ...c, column: colId } : c));
    setDraggingId(null);
    setDragOverCol(null);
  };
  const onDragEnd = () => { setDraggingId(null); setDragOverCol(null); };

  const deleteCard = (id) => save(cards.filter(c => c.id !== id));

  const addCard = () => {
    if (!form.title.trim()) return;
    const newCard = {
      id: `k${Date.now()}`,
      ...form,
      color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
    };
    save([...cards, newCard]);
    setForm({ title: '', institution: '', amount: '', column: 'arastirma' });
    setShowModal(false);
  };

  const cardBase = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-100';
  const colBg   = dark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200';
  const text    = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub     = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-2xl font-black ${text}`}>Başvuru Takip Çizelgesi</h2>
          <p className={`text-sm mt-0.5 ${sub}`}>Kartları sürükleyip bırakarak durumlarını güncelleyin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg hover:opacity-90 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Yeni Başvuru Ekle
        </button>
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {COLUMNS.map(col => {
          const colCards = cards.filter(c => c.column === col.id);
          const isDragTarget = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              onDragOver={e => onDragOver(e, col.id)}
              onDrop={e => onDrop(e, col.id)}
              className={`flex-shrink-0 w-60 rounded-2xl border transition-all duration-200 ${colBg}
                ${isDragTarget ? 'ring-2 ring-purple-500 ring-offset-1 scale-[1.01]' : ''}`}
            >
              {/* Column header */}
              <div className={`px-3 py-3 border-b flex items-center gap-2 ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: col.dot }} />
                <span className={`font-bold text-xs flex-1 ${text}`}>{col.label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                  {colCards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-[220px]">
                {colCards.map(c => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={e => onDragStart(e, c.id)}
                    onDragEnd={onDragEnd}
                    className={`${cardBase} border rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group
                      ${draggingId === c.id ? 'opacity-40 rotate-2 scale-95 shadow-xl' : 'hover:-translate-y-0.5'}`}
                  >
                    <div className="flex items-start gap-2">
                      {/* Color stripe */}
                      <div className="w-1 rounded-full shrink-0 mt-0.5 self-stretch" style={{ background: c.color, minHeight: '2rem' }} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-xs leading-snug ${text}`}>{c.title}</p>
                        {c.institution && (
                          <p className={`text-[10px] mt-0.5 font-medium ${sub}`}>{c.institution}</p>
                        )}
                        {c.amount && (
                          <span className="inline-block text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md mt-1.5">
                            {c.amount}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteCard(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition p-0.5 rounded-md shrink-0"
                        title="Sil"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {colCards.length === 0 && (
                  <div className={`flex items-center justify-center h-20 text-xs font-medium rounded-xl border-2 border-dashed transition
                    ${isDragTarget
                      ? 'border-purple-400 text-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                      : dark ? 'border-slate-700 text-slate-600' : 'border-slate-200 text-slate-300'}`}>
                    {isDragTarget ? 'Buraya bırakın' : 'Boş'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* İstatistik özeti */}
      <div className={`mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3`}>
        {COLUMNS.map(col => {
          const count = cards.filter(c => c.column === col.id).length;
          return (
            <div key={col.id} className={`${cardBase} border rounded-xl p-3 text-center`}>
              <p className="text-2xl font-black" style={{ color: col.dot }}>{count}</p>
              <p className={`text-[10px] font-bold mt-0.5 ${sub}`}>{col.label.replace(/^[^ ]+ /, '')}</p>
            </div>
          );
        })}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className={`${dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[fadeUp_0.3s_ease]`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-black text-lg ${text}`}>Yeni Başvuru Ekle</h3>
              <button onClick={() => setShowModal(false)} className={`p-1.5 rounded-lg transition ${dark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Program Adı *', key: 'title', placeholder: 'KOSGEB Girişimci Desteği...' },
                { label: 'Kurum',        key: 'institution', placeholder: 'KOSGEB, TÜBİTAK...' },
                { label: 'Hibe Miktarı', key: 'amount', placeholder: '300.000 TL' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className={`block text-sm font-bold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={`w-full p-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition
                      ${dark ? 'bg-slate-800 border-slate-600 text-white focus:ring-purple-400 placeholder-slate-500' : 'bg-slate-50 border-slate-200 focus:ring-purple-500'}`}
                  />
                </div>
              ))}

              <div>
                <label className={`block text-sm font-bold mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Başlangıç Sütunu</label>
                <select
                  value={form.column}
                  onChange={e => setForm(p => ({ ...p, column: e.target.value }))}
                  className={`w-full p-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition
                    ${dark ? 'bg-slate-800 border-slate-600 text-white focus:ring-purple-400' : 'bg-slate-50 border-slate-200 focus:ring-purple-500'}`}
                >
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 p-3 rounded-xl font-bold border transition text-sm ${dark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  İptal
                </button>
                <button
                  onClick={addCard}
                  disabled={!form.title.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl font-bold text-sm disabled:opacity-40 hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
