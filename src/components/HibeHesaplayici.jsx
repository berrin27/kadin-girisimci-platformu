import React, { useState, useEffect } from 'react';
import { supportData } from '../data';
import { Calculator, ArrowRight, ArrowLeft, Sparkles, RotateCcw, ExternalLink } from 'lucide-react';

// ── Sektör → hibe verileri ────────────────────────────────────────────────────
const SEKTOR_HIBE = {
  ev_emegi:      { max: 30000,   ids: ['tisva-mikrokredi', 'halkbank-kadin'] },
  yerel_isletme: { max: 350000,  ids: ['kosgeb-girisimci', 'halkbank-genc', 'halkbank-kadin'] },
  teknoloji:     { max: 900000,  ids: ['tubitak-bigg', 'arya-women', 'halkbank-genc'] },
  e_ticaret:     { max: 2500000, ids: ['ticaret-eihracat', 'arya-women', 'halkbank-genc'] },
  kooperatif:    { max: 400000,  ids: ['ticaret-koopdes'] },
  sosyal_girisim:{ max: 150000,  ids: ['ashoka-imece'] },
  kırsal:        { max: 500000,  ids: ['tkdk-ipard'] },
};

// ── Animasyonlu sayaç ─────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (1600 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString('tr-TR')}</>;
}

// ── Seçim Butonu ──────────────────────────────────────────────────────────────
function SelectBtn({ selected, onClick, children, dark }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl text-sm font-bold text-left border transition-all ${
        selected
          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200'
          : dark
            ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-purple-500'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300'
      }`}
    >
      {children}
    </button>
  );
}

export default function HibeHesaplayici({ dark }) {
  const [step, setStep] = useState(1);
  const [sektor, setSektor] = useState('');
  const [profil, setProfil] = useState('');
  const [asama, setAsama] = useState('');
  const [ekip, setEkip] = useState(1);
  const [aylikGelir, setAylikGelir] = useState(0);
  const [result, setResult] = useState(null);

  const card   = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-100';
  const text   = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub    = dark ? 'text-slate-400' : 'text-slate-500';
  const track  = dark ? 'bg-slate-700' : 'bg-slate-200';

  const calculate = () => {
    const data = SEKTOR_HIBE[sektor] || { max: 0, ids: [] };
    const programs = supportData.filter(p => data.ids.includes(p.id));
    let mult = 1;
    if (profil === 'genc_girisimci') mult *= 1.15;
    if (asama === 'fikir') mult *= 0.88;
    if (ekip >= 3) mult *= 1.1;
    const total = Math.round(Math.min(data.max * mult, data.max * 1.15));
    const coveragePct = aylikGelir > 0 ? Math.min((total / (aylikGelir * 12)) * 100, 999) : null;
    setResult({ total, programs, coveragePct });
    setStep(3);
  };

  const reset = () => {
    setStep(1); setSektor(''); setProfil(''); setAsama('');
    setEkip(1); setAylikGelir(0); setResult(null);
  };

  return (
    <div className={`${card} border rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-xl">Hibe Hesaplayıcı</h2>
            <p className="text-purple-200 text-sm">Tahmini toplam hibe potansiyelinizi hesaplayın</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-700 ${step >= s ? 'bg-white' : 'bg-white/25'}`} />
              <p className={`text-[10px] font-bold mt-1 transition-colors ${step >= s ? 'text-white' : 'text-purple-300'}`}>
                {s === 1 ? 'Profil' : s === 2 ? 'Finans' : 'Sonuç'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* ── ADIM 1 ── */}
        {step === 1 && (
          <div className="space-y-5 animate-[fadeUp_0.4s_ease]">
            <h3 className={`font-bold text-base ${text}`}>Girişiminizi tanımlayın</h3>

            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Sektör</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['ev_emegi', '🏠 Ev Emeği & Mikro Üretim'],
                  ['yerel_isletme', '🏪 Yerel İşletme'],
                  ['teknoloji', '💻 Teknoloji & Yazılım'],
                  ['e_ticaret', '🛒 E-Ticaret & İhracat'],
                  ['kooperatif', '🤝 Kadın Kooperatifi'],
                  ['sosyal_girisim', '💚 Sosyal Girişim'],
                  ['kırsal', '🌾 Kırsal / Tarım'],
                ].map(([val, label]) => (
                  <SelectBtn key={val} selected={sektor === val} onClick={() => setSektor(val)} dark={dark}>
                    {label}
                  </SelectBtn>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Profil</p>
              {[['genc_girisimci', '🎓 Genç Girişimci (18-35 / Üni)'], ['standart', '👩 35 Yaş Üstü Kadın Girişimci']].map(([v, l]) => (
                <SelectBtn key={v} selected={profil === v} onClick={() => setProfil(v)} dark={dark}>{l}</SelectBtn>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Aşama</p>
              {[['fikir', '💡 Fikir Aşaması (Şirket kurulmadı)'], ['yeni_kurulmus', '🏢 Yeni Kurulmuş (Son 1 yıl)']].map(([v, l]) => (
                <SelectBtn key={v} selected={asama === v} onClick={() => setAsama(v)} dark={dark}>{l}</SelectBtn>
              ))}
            </div>

            <button
              disabled={!sektor || !profil || !asama}
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Devam Et <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── ADIM 2 ── */}
        {step === 2 && (
          <div className="space-y-7 animate-[fadeUp_0.4s_ease]">
            <h3 className={`font-bold text-base ${text}`}>Finansal bilgileriniz</h3>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className={`text-sm font-bold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Ekip Büyüklüğü</p>
                <span className="text-purple-500 font-black text-sm">{ekip} kişi{ekip >= 3 ? ' 🎯 +Bonus' : ''}</span>
              </div>
              <input type="range" min="1" max="10" value={ekip}
                onChange={e => setEkip(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-purple-600"
                style={{ background: `linear-gradient(to right, #7c3aed ${((ekip-1)/9)*100}%, ${dark ? '#334155' : '#e2e8f0'} ${((ekip-1)/9)*100}%)` }}
              />
              <div className={`flex justify-between text-xs mt-1 ${sub}`}><span>Solo</span><span>10+ kişi</span></div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className={`text-sm font-bold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Aylık Tahmini Gelir</p>
                <span className="text-purple-500 font-black text-sm">{aylikGelir.toLocaleString('tr-TR')} TL</span>
              </div>
              <input type="range" min="0" max="500000" step="5000" value={aylikGelir}
                onChange={e => setAylikGelir(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-purple-600"
                style={{ background: `linear-gradient(to right, #7c3aed ${(aylikGelir/500000)*100}%, ${dark ? '#334155' : '#e2e8f0'} ${(aylikGelir/500000)*100}%)` }}
              />
              <div className={`flex justify-between text-xs mt-1 ${sub}`}><span>Henüz yok</span><span>500.000 TL+</span></div>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-medium ${dark ? 'bg-blue-900/20 border-blue-800/40 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
              ℹ️ Bu bilgiler yalnızca tahmini hesap için kullanılır ve paylaşılmaz.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className={`flex-1 p-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${dark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <ArrowLeft className="w-4 h-4" /> Geri
              </button>
              <button onClick={calculate}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition">
                <Sparkles className="w-5 h-5" /> Hesapla
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 3 ── */}
        {step === 3 && result && (
          <div className="space-y-5 animate-[fadeUp_0.4s_ease]">
            {/* Büyük rakam */}
            <div className="bg-gradient-to-br from-violet-600 to-pink-600 rounded-2xl p-6 text-center text-white">
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-2">Tahmini Hibe Potansiyeliniz</p>
              <p className="text-5xl font-black tracking-tight">
                <AnimatedNumber value={result.total} />
                <span className="text-3xl ml-1">₺</span>
              </p>
              {result.coveragePct !== null && (
                <p className="text-purple-200 text-xs mt-3">
                  ≈ Yıllık gelirinizin <strong className="text-white">%{Math.round(result.coveragePct)}'ini</strong> karşılar
                </p>
              )}
            </div>

            {/* Eşleşen programlar */}
            <div>
              <p className={`text-sm font-bold mb-3 ${text}`}>Başvurabileceğiniz Programlar</p>
              <div className="space-y-2">
                {result.programs.length === 0 ? (
                  <p className={`text-sm ${sub}`}>Bu kriterlere uygun program bulunamadı.</p>
                ) : result.programs.map(p => (
                  <a key={p.id} href={p.link} target="_blank" rel="noreferrer"
                    className={`flex items-center justify-between p-3 rounded-xl border transition hover:shadow-md group ${dark ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700' : 'border-slate-100 bg-slate-50 hover:bg-white'}`}>
                    <div>
                      <p className="text-xs font-bold text-purple-500">{p.institution}</p>
                      <p className={`text-sm font-bold group-hover:text-purple-500 transition ${text}`}>{p.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-emerald-500">{p.amount}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <button onClick={reset}
              className={`w-full p-3 rounded-xl font-bold border transition text-sm flex items-center justify-center gap-2 ${dark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <RotateCcw className="w-4 h-4" /> Yeniden Hesapla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
