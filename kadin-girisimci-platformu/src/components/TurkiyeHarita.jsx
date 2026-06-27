import React, { useState } from 'react';
import { supportData } from '../data';
import { MapPin, X, ExternalLink } from 'lucide-react';

/*
 * Türkiye 7 Coğrafi Bölge Haritası
 * Referans fotoğraftaki renk ve şekillere uygun olarak tasarlandı.
 * viewBox: 0 0 1000 530
 */
const BOLGELER = [
  {
    id: 'marmara',
    ad: 'MARMARA\nBÖLGESİ',
    kisaAd: 'Marmara',
    icon: '🏙️',
    iller: ['İstanbul', 'Bursa', 'Kocaeli', 'Tekirdağ', 'Balıkesir', 'Edirne', 'Çanakkale', 'Yalova', 'Bilecik', 'Sakarya', 'Kırklareli'],
    tags: ['teknoloji', 'e_ticaret', 'yerel_isletme', 'sosyal_girisim'],
    fill: '#FF8C00',
    labelX: 145, labelY: 120,
    path: `M 30,65 L 55,42 L 95,30 L 140,25 L 175,32 L 200,20 L 218,30
           L 230,55 L 258,50 L 275,60 L 290,55 L 310,65
           L 322,82 L 318,100 L 330,120 L 340,145 L 340,160
           L 328,180 L 305,195 L 275,210 L 250,218
           L 222,230 L 195,220 L 168,230 L 150,225
           L 128,235 L 108,240 L 85,238
           L 60,225 L 42,205 L 28,180
           L 18,155 L 12,130 L 15,100 L 22,80 Z`,
  },
  {
    id: 'karadeniz',
    ad: 'KARADENİZ\nBÖLGESİ',
    kisaAd: 'Karadeniz',
    icon: '🌊',
    iller: ['Trabzon', 'Samsun', 'Rize', 'Ordu', 'Giresun', 'Zonguldak', 'Sinop', 'Kastamonu', 'Artvin', 'Bolu', 'Düzce', 'Bartın', 'Karabük', 'Çankırı', 'Çorum', 'Amasya', 'Tokat', 'Gümüşhane', 'Bayburt'],
    tags: ['kırsal', 'kooperatif'],
    fill: '#1E8C3A',
    labelX: 540, labelY: 68,
    path: `M 310,65 L 340,42 L 380,28 L 425,18 L 475,12
           L 530,10 L 580,12 L 630,18 L 680,25 L 720,30
           L 760,38 L 800,48 L 835,60 L 862,72
           L 878,88 L 888,110 L 882,132
           L 862,152 L 835,162 L 800,168
           L 760,172 L 720,175 L 680,178
           L 640,182 L 600,184 L 560,180
           L 520,178 L 480,175 L 440,178
           L 400,182 L 360,178 L 335,172
           L 340,160 L 340,145 L 330,120
           L 318,100 L 322,82 Z`,
  },
  {
    id: 'ege',
    ad: 'EGE\nBÖLGESİ',
    kisaAd: 'Ege',
    icon: '🏖️',
    iller: ['İzmir', 'Muğla', 'Aydın', 'Denizli', 'Uşak', 'Manisa', 'Kütahya', 'Afyonkarahisar'],
    tags: ['yerel_isletme', 'e_ticaret', 'kooperatif', 'ev_emegi'],
    fill: '#CC00CC',
    labelX: 115, labelY: 318,
    path: `M 85,238 L 108,240 L 128,235 L 150,225
           L 168,230 L 195,220 L 222,230 L 250,218
           L 275,210 L 280,235 L 282,258
           L 278,282 L 275,305 L 268,328
           L 255,352 L 242,375 L 225,398
           L 210,420 L 192,435 L 170,442
           L 148,438 L 125,430 L 105,418
           L 85,405 L 68,388 L 55,365
           L 45,340 L 40,315 L 42,290
           L 48,268 L 58,252 L 70,242 Z`,
  },
  {
    id: 'ic_anadolu',
    ad: 'İÇ ANADOLU\nBÖLGESİ',
    kisaAd: 'İç Anadolu',
    icon: '🏔️',
    iller: ['Ankara', 'Konya', 'Kayseri', 'Eskişehir', 'Sivas', 'Aksaray', 'Nevşehir', 'Kırşehir', 'Kırıkkale', 'Yozgat', 'Niğde', 'Karaman'],
    tags: ['teknoloji', 'yerel_isletme', 'kooperatif', 'e_ticaret'],
    fill: '#0099DD',
    labelX: 450, labelY: 265,
    path: `M 335,172 L 360,178 L 400,182 L 440,178
           L 480,175 L 520,178 L 560,180
           L 600,184 L 640,182 L 680,178
           L 695,195 L 702,215 L 705,240
           L 702,268 L 695,295 L 682,318
           L 665,340 L 645,355 L 622,365
           L 595,372 L 565,378 L 535,382
           L 505,385 L 475,388 L 445,388
           L 415,385 L 388,380 L 362,372
           L 338,360 L 318,345 L 300,328
           L 285,310 L 275,305 L 278,282
           L 282,258 L 280,235 L 275,210
           L 305,195 L 328,180 Z`,
  },
  {
    id: 'akdeniz',
    ad: 'AKDENİZ\nBÖLGESİ',
    kisaAd: 'Akdeniz',
    icon: '☀️',
    iller: ['Antalya', 'Mersin', 'Adana', 'Hatay', 'Burdur', 'Isparta', 'Kahramanmaraş', 'Osmaniye'],
    tags: ['yerel_isletme', 'kırsal', 'sosyal_girisim', 'kooperatif'],
    fill: '#7B2D8E',
    labelX: 385, labelY: 442,
    path: `M 170,442 L 192,435 L 210,420 L 225,398
           L 242,375 L 255,352 L 268,328
           L 285,310 L 300,328 L 318,345
           L 338,360 L 362,372 L 388,380
           L 415,385 L 445,388 L 475,388
           L 505,385 L 535,382 L 565,378
           L 595,372 L 608,390 L 618,408
           L 628,425 L 635,445 L 638,462
           L 632,478 L 618,490 L 598,498
           L 565,502 L 520,505 L 470,505
           L 420,502 L 370,498 L 320,495
           L 275,490 L 235,485 L 200,478
           L 172,468 L 155,455 Z`,
  },
  {
    id: 'dogu_anadolu',
    ad: 'DOĞU ANADOLU\nBÖLGESİ',
    kisaAd: 'Doğu Anadolu',
    icon: '⛰️',
    iller: ['Erzurum', 'Van', 'Malatya', 'Elazığ', 'Ağrı', 'Kars', 'Ardahan', 'Iğdır', 'Muş', 'Bitlis', 'Hakkari', 'Bingöl', 'Tunceli', 'Erzincan'],
    tags: ['kırsal', 'kooperatif', 'sosyal_girisim'],
    fill: '#A07850',
    labelX: 818, labelY: 200,
    path: `M 800,168 L 835,162 L 862,152
           L 882,132 L 888,110 L 878,88
           L 905,95 L 930,108 L 952,125
           L 968,148 L 975,175 L 972,205
           L 968,238 L 962,268 L 955,298
           L 945,325 L 932,348
           L 915,362 L 895,372 L 872,378
           L 848,382 L 822,380 L 798,375
           L 775,368 L 755,358 L 738,345
           L 722,328 L 710,310 L 702,290
           L 702,268 L 705,240 L 702,215
           L 695,195 L 680,178 L 720,175
           L 760,172 Z`,
  },
  {
    id: 'guneydogu',
    ad: 'GÜNEYDOĞU\nANADOLU BÖLGESİ',
    kisaAd: 'Güneydoğu',
    icon: '🌅',
    iller: ['Gaziantep', 'Şanlıurfa', 'Diyarbakır', 'Mardin', 'Batman', 'Siirt', 'Şırnak', 'Adıyaman', 'Kilis'],
    tags: ['kırsal', 'sosyal_girisim', 'kooperatif', 'ev_emegi'],
    fill: '#D01030',
    labelX: 752, labelY: 425,
    path: `M 622,365 L 645,355 L 665,340
           L 682,318 L 695,295 L 702,290
           L 710,310 L 722,328 L 738,345
           L 755,358 L 775,368 L 798,375
           L 822,380 L 848,382 L 872,378
           L 895,372 L 915,362 L 932,348
           L 945,370 L 952,395 L 955,425
           L 950,455 L 938,478 L 920,495
           L 895,505 L 860,510 L 820,512
           L 775,510 L 730,505 L 690,498
           L 655,490 L 638,462 L 635,445
           L 628,425 L 618,408 L 608,390
           L 595,372 Z`,
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

  const card = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div>
      {/* Başlık */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${dark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
          <MapPin className="w-4 h-4" /> Bölgeye Göre Destekler
        </div>
        <h2 className={`text-3xl font-black mb-2 ${text}`}>Türkiye Hibe Haritası</h2>
        <p className={`max-w-lg mx-auto text-sm ${sub}`}>
          Bulunduğunuz bölgeye tıklayarak bölgenize özel hibe ve destek programlarını keşfedin.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── HARITA ─────────────────────────────────────────────────── */}
        <div className={`xl:col-span-3 ${card} border rounded-2xl shadow-xl p-4`}>
          <svg
            viewBox="0 0 1000 530"
            className="w-full"
            style={{ filter: dark ? 'drop-shadow(0 4px 24px rgba(0,0,0,0.55))' : 'drop-shadow(0 2px 16px rgba(0,0,0,0.12))' }}
          >
            <defs>
              {BOLGELER.map(b => (
                <radialGradient key={b.id} id={`rg-${b.id}`} cx="40%" cy="35%" r="60%">
                  <stop offset="0%"   stopColor="#fff"  stopOpacity="0.25" />
                  <stop offset="100%" stopColor={b.fill} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            {BOLGELER.map(b => {
              const isHov = hovered === b.id;
              const isSel = selected === b.id;
              const active = isHov || isSel;
              const count  = getDestekler(b.tags).length;
              const lines  = b.ad.split('\n');

              return (
                <g
                  key={b.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(b.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(selected === b.id ? null : b.id)}
                >
                  {/* Ana bölge rengi */}
                  <path
                    d={b.path}
                    fill={b.fill}
                    stroke={dark ? '#0f172a' : '#fff'}
                    strokeWidth={active ? 4 : 2.5}
                    strokeLinejoin="round"
                    style={{
                      transition: 'filter 0.2s, stroke-width 0.2s, transform 0.2s',
                      filter: active
                        ? `brightness(1.2) drop-shadow(0 0 12px ${b.fill}cc)`
                        : 'brightness(1)',
                      transformOrigin: `${b.labelX}px ${b.labelY}px`,
                      transform: active ? 'scale(1.02)' : 'scale(1)',
                    }}
                  />
                  {/* Parlaklık overlay */}
                  <path
                    d={b.path}
                    fill={`url(#rg-${b.id})`}
                    style={{ pointerEvents: 'none' }}
                  />

                  {/* Bölge ismi */}
                  {lines.map((line, li) => (
                    <text
                      key={li}
                      x={b.labelX}
                      y={b.labelY + li * 18 - (lines.length - 1) * 9}
                      textAnchor="middle"
                      fill="white"
                      fontSize={b.id === 'guneydogu' || b.id === 'dogu_anadolu' ? '11' : '13'}
                      fontWeight="900"
                      fontFamily="'Arial Black', Arial, sans-serif"
                      letterSpacing="0.8"
                      stroke="rgba(0,0,0,0.7)"
                      strokeWidth="3.5"
                      paintOrder="stroke"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {line}
                    </text>
                  ))}

                  {/* Program sayısı rozeti */}
                  <circle
                    cx={b.labelX}
                    cy={b.labelY + lines.length * 18 - (lines.length - 1) * 9 + 6}
                    r="12"
                    fill="white"
                    fillOpacity="0.95"
                    stroke={b.fill}
                    strokeWidth="1.5"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={b.labelX}
                    y={b.labelY + lines.length * 18 - (lines.length - 1) * 9 + 11}
                    textAnchor="middle"
                    fill={b.fill}
                    fontSize="11"
                    fontWeight="900"
                    style={{ pointerEvents: 'none' }}
                  >
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover / seçim bilgisi */}
          <div className="h-7 mt-1 flex items-center justify-center">
            {hoveredB && !selected ? (
              <p className={`text-sm font-bold flex items-center gap-2 ${text}`}>
                <span>{hoveredB.icon}</span>
                <span style={{ color: hoveredB.fill }}>{hoveredB.kisaAd} Bölgesi</span>
                <span className={sub}>— {getDestekler(hoveredB.tags).length} program • tıkla</span>
              </p>
            ) : selected ? (
              <p className={`text-sm font-medium ${sub}`}>↗ Sağ panelde detayları inceleyin</p>
            ) : (
              <p className={`text-sm ${sub}`}>Haritadan bir bölgeye tıklayın</p>
            )}
          </div>

          {/* Renk efsanesi */}
          <div className={`mt-2 pt-3 border-t flex flex-wrap gap-2 ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
            {BOLGELER.map(b => (
              <button
                key={b.id}
                onClick={() => setSelected(selected === b.id ? null : b.id)}
                className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all"
                style={{
                  background: selected === b.id ? b.fill : 'transparent',
                  color: selected === b.id ? '#fff' : b.fill,
                  borderColor: selected === b.id ? b.fill : dark ? '#334155' : '#e2e8f0',
                }}
              >
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: b.fill }} />
                {b.kisaAd}
              </button>
            ))}
          </div>
        </div>

        {/* ── DETAY PANELİ ────────────────────────────────────────────── */}
        <div className="xl:col-span-2">
          {selectedB ? (
            <div className={`${card} border rounded-2xl shadow-xl overflow-hidden`}>
              <div className="p-5" style={{ background: `${selectedB.fill}18`, borderBottom: `2px solid ${selectedB.fill}44` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow" style={{ background: selectedB.fill }}>
                      {selectedB.icon}
                    </div>
                    <div>
                      <h3 className={`font-black text-xl ${text}`}>{selectedB.kisaAd} Bölgesi</h3>
                      <p className={`text-xs mt-0.5 ${sub}`}>{selectedB.iller.join(' · ')}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-slate-700' : 'hover:bg-black/5'} transition`}>
                    <X className={`w-4 h-4 ${sub}`} />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-black px-3 py-1.5 rounded-full text-white" style={{ background: selectedB.fill }}>
                    {destekler.length} Program
                  </span>
                  <span className={`text-xs ${sub}`}>bu bölgeye uygun</span>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {destekler.length === 0 ? (
                  <p className={`text-sm text-center py-8 ${sub}`}>Bu bölge için program bulunamadı.</p>
                ) : destekler.map(d => (
                  <a key={d.id} href={d.link} target="_blank" rel="noreferrer"
                    className={`block p-4 rounded-xl border transition-all hover:shadow-md group ${dark ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700' : 'border-slate-100 bg-slate-50/80 hover:bg-white'}`}>
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-purple-400" />
              </div>
              <p className={`font-bold text-lg mb-2 ${text}`}>Bölge Seçin</p>
              <p className={`text-sm ${sub}`}>Haritadan bir bölgeye tıklayarak bölgenize özel hibe ve destek programlarını görün.</p>
              <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-xs">
                {BOLGELER.slice(0, 6).map(b => (
                  <button key={b.id} onClick={() => setSelected(b.id)}
                    className="text-xs font-bold py-2 px-2 rounded-lg border transition"
                    style={{ borderColor: b.fill + '55', color: b.fill }}>
                    {b.icon} {b.kisaAd.split(' ')[0]}
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
