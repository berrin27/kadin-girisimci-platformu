import React, { useState } from 'react';
import { supportData } from '../data';
import { MapPin, X, ExternalLink, ChevronRight } from 'lucide-react';

// ── 7 Coğrafi Bölge SVG verisi ────────────────────────────────────────────────
// ViewBox: 0 0 900 470
const BOLGELER = [
  {
    id: 'karadeniz',
    ad: 'Karadeniz',
    icon: '🌊',
    iller: ['Trabzon', 'Samsun', 'Rize', 'Ordu', 'Giresun', 'Zonguldak'],
    tags: ['kırsal', 'kooperatif'],
    fill: '#0e7490',
    labelX: 500, labelY: 78,
    path: 'M 195,28 L 385,14 L 565,12 L 732,26 L 815,48 L 832,118 L 772,133 L 652,140 L 522,132 L 398,130 L 282,140 L 198,158 L 184,118 Z',
  },
  {
    id: 'marmara',
    ad: 'Marmara',
    icon: '🏙️',
    iller: ['İstanbul', 'Bursa', 'Kocaeli', 'Tekirdağ', 'Balıkesir'],
    tags: ['teknoloji', 'e_ticaret', 'yerel_isletme', 'sosyal_girisim'],
    fill: '#7c3aed',
    labelX: 110, labelY: 148,
    path: 'M 28,88 L 184,88 L 198,158 L 148,208 L 72,238 L 24,208 Z',
  },
  {
    id: 'ege',
    ad: 'Ege',
    icon: '🏖️',
    iller: ['İzmir', 'Muğla', 'Aydın', 'Denizli', 'Uşak'],
    tags: ['yerel_isletme', 'e_ticaret', 'kooperatif', 'ev_emegi'],
    fill: '#0d9488',
    labelX: 76, labelY: 302,
    path: 'M 24,208 L 148,208 L 138,352 L 58,418 L 14,378 Z',
  },
  {
    id: 'akdeniz',
    ad: 'Akdeniz',
    icon: '☀️',
    iller: ['Antalya', 'Mersin', 'Adana', 'Hatay', 'Burdur'],
    tags: ['yerel_isletme', 'kırsal', 'sosyal_girisim', 'kooperatif'],
    fill: '#d97706',
    labelX: 295, labelY: 393,
    path: 'M 58,418 L 138,352 L 255,312 L 395,302 L 466,348 L 536,396 L 546,446 L 222,452 L 60,442 Z',
  },
  {
    id: 'ic_anadolu',
    ad: 'İç Anadolu',
    icon: '🏔️',
    iller: ['Ankara', 'Konya', 'Kayseri', 'Eskişehir', 'Sivas'],
    tags: ['teknoloji', 'yerel_isletme', 'kooperatif', 'e_ticaret'],
    fill: '#16a34a',
    labelX: 405, labelY: 232,
    path: 'M 198,158 L 398,130 L 522,132 L 652,140 L 656,268 L 608,318 L 466,318 L 395,302 L 255,312 L 138,348 L 148,208 Z',
  },
  {
    id: 'dogu_anadolu',
    ad: 'Doğu Anadolu',
    icon: '⛰️',
    iller: ['Erzurum', 'Van', 'Malatya', 'Elazığ', 'Ağrı'],
    tags: ['kırsal', 'kooperatif', 'sosyal_girisim'],
    fill: '#9333ea',
    labelX: 755, labelY: 242,
    path: 'M 652,140 L 772,133 L 832,118 L 888,198 L 882,342 L 822,358 L 730,350 L 662,322 L 656,268 Z',
  },
  {
    id: 'guneydogu',
    ad: 'Güneydoğu Anadolu',
    icon: '🌅',
    iller: ['Gaziantep', 'Şanlıurfa', 'Diyarbakır', 'Mardin', 'Kahramanmaraş'],
    tags: ['kırsal', 'sosyal_girisim', 'kooperatif', 'ev_emegi'],
    fill: '#dc2626',
    labelX: 692, labelY: 398,
    path: 'M 608,318 L 662,322 L 730,350 L 822,358 L 882,412 L 818,446 L 678,452 L 546,446 L 536,396 L 466,348 L 466,318 Z',
  },
];

const getDestekler = (tags) =>
  supportData.filter(p => tags.some(t => p.tags.includes(t)));

export default function TurkiyeHarita({ dark }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const hoveredB  = hovered  ? BOLGELER.find(b => b.id === hovered)  : null;
  const selectedB = selected ? BOLGELER.find(b => b.id === selected) : null;
  const destekler = selectedB ? getDestekler(selectedB.tags) : [];

  const card = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-100';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div>
      {/* Başlık */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
          <MapPin className="w-4 h-4" /> Bölgeye Göre Destekler
        </div>
        <h2 className={`text-3xl font-black mb-2 ${text}`}>Türkiye Hibe Haritası</h2>
        <p className={`max-w-lg mx-auto text-sm ${sub}`}>
          Bulunduğunuz bölgeye tıklayarak bölgenize özel hibe ve destek programlarını keşfedin.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Harita */}
        <div className={`xl:col-span-3 ${card} border rounded-2xl shadow-xl p-5`}>
          <div className="relative">
            <svg
              viewBox="0 0 900 470"
              className="w-full"
              style={{ filter: dark ? 'drop-shadow(0 4px 24px rgba(0,0,0,0.5))' : 'drop-shadow(0 4px 24px rgba(0,0,0,0.12))' }}
            >
              {/* Gölge arka plan */}
              <defs>
                <filter id="regionShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" />
                </filter>
              </defs>

              {BOLGELER.map(b => {
                const isHov = hovered === b.id;
                const isSel = selected === b.id;
                const count = getDestekler(b.tags).length;
                return (
                  <g key={b.id}>
                    <path
                      d={b.path}
                      fill={isSel ? b.fill : isHov ? b.fill : b.fill + 'cc'}
                      stroke={dark ? '#0f172a' : '#fff'}
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        filter: isHov || isSel ? 'brightness(1.15) drop-shadow(0 3px 8px rgba(0,0,0,0.35))' : 'none',
                        transform: isHov ? 'scale(1.01)' : 'scale(1)',
                        transformOrigin: `${b.labelX}px ${b.labelY}px`,
                      }}
                      onMouseEnter={() => setHovered(b.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(selected === b.id ? null : b.id)}
                    />
                    {/* Bölge etiketi */}
                    <text
                      x={b.labelX} y={b.labelY - 6}
                      textAnchor="middle"
                      fill="white"
                      fontSize={b.id === 'guneydogu' ? '9' : '10.5'}
                      fontWeight="700"
                      style={{ pointerEvents: 'none', paintOrder: 'stroke' }}
                      stroke="rgba(0,0,0,0.25)"
                      strokeWidth="2"
                    >
                      {b.ad}
                    </text>
                    {/* Program sayısı badge */}
                    <circle cx={b.labelX + 28} cy={b.labelY + 8} r="9" fill="white" fillOpacity="0.9" style={{ pointerEvents: 'none' }} />
                    <text
                      x={b.labelX + 28} y={b.labelY + 12}
                      textAnchor="middle"
                      fill={b.fill}
                      fontSize="9"
                      fontWeight="800"
                      style={{ pointerEvents: 'none' }}
                    >
                      {count}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Tooltip / Hover bilgisi */}
          <div className={`mt-3 h-7 flex items-center justify-center transition-all`}>
            {hoveredB && !selected ? (
              <p className={`text-sm font-bold flex items-center gap-2 ${text}`}>
                <span>{hoveredB.icon}</span>
                <span style={{ color: hoveredB.fill }}>{hoveredB.ad}</span>
                <span className={sub}>—</span>
                <span className={sub}>{getDestekler(hoveredB.tags).length} program mevcut • Tıklayın</span>
              </p>
            ) : selected ? (
              <p className={`text-sm font-medium ${sub}`}>
                Sağ panelde detayları görüntüleyin ↗
              </p>
            ) : (
              <p className={`text-sm ${sub}`}>Haritadan bir bölgeye tıklayın</p>
            )}
          </div>

          {/* Bölge efsanesi */}
          <div className={`mt-3 pt-3 border-t flex flex-wrap gap-2 ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
            {BOLGELER.map(b => (
              <button
                key={b.id}
                onClick={() => setSelected(selected === b.id ? null : b.id)}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                  selected === b.id
                    ? 'text-white border-transparent'
                    : dark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{
                  background: selected === b.id ? b.fill : 'transparent',
                  color: selected === b.id ? '#fff' : b.fill,
                }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: b.fill }} />
                {b.ad}
              </button>
            ))}
          </div>
        </div>

        {/* Detay Paneli */}
        <div className="xl:col-span-2">
          {selectedB ? (
            <div className={`${card} border rounded-2xl shadow-xl overflow-hidden`}>
              {/* Panel header */}
              <div className="p-5" style={{ background: selectedB.fill + '22', borderBottom: `1px solid ${selectedB.fill}33` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedB.icon}</span>
                    <div>
                      <h3 className={`font-black text-xl ${text}`}>{selectedB.ad}</h3>
                      <p className={`text-xs mt-0.5 ${sub}`}>{selectedB.iller.join(' · ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className={`p-1.5 rounded-lg transition ${dark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-black/5'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="text-xs font-black px-3 py-1.5 rounded-full text-white"
                    style={{ background: selectedB.fill }}
                  >
                    {destekler.length} Program
                  </span>
                  <span className={`text-xs ${sub}`}>bu bölgeye uygun</span>
                </div>
              </div>

              {/* Program listesi */}
              <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
                {destekler.length === 0 ? (
                  <p className={`text-sm text-center py-8 ${sub}`}>Bu bölge için program bulunamadı.</p>
                ) : destekler.map(d => (
                  <a
                    key={d.id}
                    href={d.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`block p-4 rounded-xl border transition-all hover:shadow-md group ${dark ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700' : 'border-slate-100 bg-slate-50/80 hover:bg-white'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-purple-500">{d.institution}</span>
                        <p className={`font-bold text-sm mt-0.5 group-hover:text-purple-500 transition leading-snug ${text}`}>{d.title}</p>
                        <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${sub}`}>{d.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-black text-emerald-500">{d.amount}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-400 transition" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className={`${card} border rounded-2xl shadow-xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]`}>
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-purple-400" />
              </div>
              <p className={`font-bold text-lg mb-2 ${text}`}>Bölge Seçin</p>
              <p className={`text-sm ${sub}`}>Haritadan bir bölgeye tıklayarak o bölgeye özel hibe ve destek programlarını görün.</p>
              <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-xs">
                {BOLGELER.slice(0, 6).map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b.id)}
                    className={`text-xs font-bold py-2 px-2 rounded-lg border transition ${dark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'} ${sub}`}
                  >
                    {b.icon} {b.ad.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
