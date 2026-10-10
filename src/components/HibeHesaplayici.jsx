import React, { useState, useEffect } from 'react';
import { supportData } from '../data';
import { api } from '../api';
import { Calculator, ArrowRight, ArrowLeft, Sparkles, RotateCcw, ExternalLink } from 'lucide-react';

// ── Seçenekler (Destek Sihirbazı ile aynı) ───────────────────────────────────
const SEKTOR_OPTS = [
  ['ev_emegi', '🏠 Ev Emeği & Mikro Üretim'],
  ['yerel_isletme', '🏪 Yerel İşletme'],
  ['teknoloji', '💻 Teknoloji & Yazılım'],
  ['e_ticaret', '🛒 E-Ticaret & İhracat'],
  ['kooperatif', '🤝 Kadın Kooperatifi'],
  ['sosyal_girisim', '💚 Sosyal Girişim'],
  ['kırsal', '🌾 Kırsal / Tarım'],
];

const PROFIL_OPTS = [
  ['genc_uni', '🎓 18-25 Yaş'],
  ['genc_girisimci', '💼 26-35 Yaş'],
  ['standart', '🌟 36-50 Yaş'],
  ['olgun_girisimci', '👑 50+ Yaş'],
];

const ASAMA_OPTS = [
  ['fikir', '💡 Fikir Aşaması (Şirket kurulmadı)'],
  ['yeni_kurulmus', '🌱 Yeni Kurulmuş (Son 1 yıl)'],
  ['buyume', '📈 Büyüme Döneminde (1-3 yıl)'],
  ['kriz_donemi', '🔄 Yeniden Yapılanma'],
  ['kokenlesik', '🏆 Köklü İşletme (3+ yıl)'],
];

const TUM_MEDENI = ['bekar', 'evli', 'dul', 'bosanmis'];
const HIBE_TURLERI = ['hibe'];
const FINANSMAN_TURLERI = ['kredi', 'geri_odemeli', 'yatirim'];

// Seçime uyan programlar; medeni duruma özel programlar (ör. dul kadın yardımı)
// hesaplayıcı medeni durum sormadığı için hariç tutulur.
const uygunProgramlar = ({ sektor, profil, asama }) => supportData.filter(p =>
  p.tags.includes(sektor) && p.tags.includes(profil) && p.tags.includes(asama)
  && TUM_MEDENI.every(m => p.tags.includes(m)));

const enYuksek = (programs, turler, alan) => programs
  .filter(p => turler.includes(p.destekTuru) && p[alan])
  .reduce((best, p) => (!best || p[alan] > best[alan] ? p : best), null);

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
          ? 'bg-[#F3D5D8] text-[#4A1525] border-[#F3D5D8] shadow-md'
          : dark
            ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-[#F3D5D8]'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-[#F8F3F4] hover:border-[#F3D5D8]'
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
  const [aylikGelir, setAylikGelir] = useState(0);
  const [result, setResult] = useState(null);
  const [profildenDolu, setProfildenDolu] = useState(false);

  // Profil doluysa seçimleri önceden işaretle (yalnızca boş olanları; değiştirilebilir)
  useEffect(() => {
    api.profile.get().then(({ profile }) => {
      const gecerli = (deger, liste) => (liste.some(([v]) => v === deger) ? deger : '');
      const s = gecerli(profile.sektor, SEKTOR_OPTS);
      const p = gecerli(profile.profilTipi, PROFIL_OPTS);
      const a = gecerli(profile.asama, ASAMA_OPTS);
      if (s) setSektor(mevcut => mevcut || s);
      if (p) setProfil(mevcut => mevcut || p);
      if (a) setAsama(mevcut => mevcut || a);
      if (s || p || a) setProfildenDolu(true);
    }).catch(() => {});
  }, []);

  const card   = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-100';
  const text   = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub    = dark ? 'text-slate-400' : 'text-slate-500';

  // Tutarlar data.js'teki resmi üst limitlerden gelir; destekler genelde
  // birbirine eklenmediği için toplam değil, tek programdaki en yüksek tutar gösterilir.
  const calculate = () => {
    const programs = uygunProgramlar({ sektor, profil, asama });
    const hibe = enYuksek(programs, HIBE_TURLERI, 'hibeUstLimit');
    const finansman = enYuksek(programs, FINANSMAN_TURLERI, 'finansmanUstLimit');
    const total = hibe?.hibeUstLimit || 0;
    const coveragePct = total && aylikGelir > 0 ? Math.min((total / (aylikGelir * 12)) * 100, 999) : null;
    setResult({ total, hibe, finansman, programs, coveragePct });
    setStep(3);
  };

  const reset = () => {
    setStep(1); setSektor(''); setProfil(''); setAsama('');
    setAylikGelir(0); setResult(null);
  };

  return (
    <div className={`${card} border rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto`}>
      {/* Header */}
      <div className="bg-[#F5EFEA] p-6 border-b border-[#EAE3D9]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center border border-white/40">
            <Calculator className="w-6 h-6 text-[#1F2D3D]" />
          </div>
          <div>
            <h2 className="text-[#1F2D3D] font-black text-xl">Hibe Hesaplayıcı</h2>
            <p className="text-[#3E5369] text-sm">Profilinize uygun destek tutarlarını görün</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-700 ${step >= s ? 'bg-[#1F2D3D]' : 'bg-white/40'}`} />
              <p className={`text-[10px] font-bold mt-1 transition-colors ${step >= s ? 'text-[#1F2D3D]' : 'text-[#5F7285]'}`}>
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
            {profildenDolu && (
              <p className={`-mt-3 text-xs ${sub}`}>✨ Seçimler profilinden dolduruldu — istersen değiştirebilirsin.</p>
            )}

            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Sektör</p>
              <div className="grid grid-cols-2 gap-2">
                {SEKTOR_OPTS.map(([val, label]) => (
                  <SelectBtn key={val} selected={sektor === val} onClick={() => setSektor(val)} dark={dark}>
                    {label}
                  </SelectBtn>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Profil</p>
              {PROFIL_OPTS.map(([v, l]) => (
                <SelectBtn key={v} selected={profil === v} onClick={() => setProfil(v)} dark={dark}>{l}</SelectBtn>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Aşama</p>
              {ASAMA_OPTS.map(([v, l]) => (
                <SelectBtn key={v} selected={asama === v} onClick={() => setAsama(v)} dark={dark}>{l}</SelectBtn>
              ))}
            </div>

            <button
              disabled={!sektor || !profil || !asama}
              onClick={() => setStep(2)}
              className="w-full bg-[#1E293B] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
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
                <p className={`text-sm font-bold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Aylık Tahmini Gelir</p>
                <span className="text-[#5A7F9B] font-black text-sm">{aylikGelir.toLocaleString('tr-TR')} TL</span>
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
                className="flex-1 bg-[#1E293B] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition">
                <Sparkles className="w-5 h-5" /> Hesapla
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 3 ── */}
        {step === 3 && result && (
          <div className="space-y-5 animate-[fadeUp_0.4s_ease]">
            {/* Büyük rakam */}
            <div className="bg-gradient-to-br from-[#A8D5F2] to-[#F6D7E2] rounded-2xl p-6 text-center text-[#1F2D3D]">
              <p className="text-[#3E5369] text-xs font-semibold uppercase tracking-wider mb-2">Geri Ödemesiz Destek</p>
              {result.hibe ? (
                <>
                  <p className="text-5xl font-black tracking-tight">
                    <AnimatedNumber value={result.total} />
                    <span className="text-3xl ml-1">₺</span>
                  </p>
                  <p className="text-[#3E5369] text-xs mt-2">'ye kadar · {result.hibe.title}</p>
                  {result.coveragePct !== null && (
                    <p className="text-[#3E5369] text-xs mt-2">
                      ≈ Yıllık gelirinizin <strong className="text-[#1F2D3D]">%{Math.round(result.coveragePct)}'i</strong>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm font-semibold mt-1">
                  Bu profil için sabit tutarlı bir hibe yok. Aşağıdaki programların bir kısmı oran bazlı destek veriyor.
                </p>
              )}
            </div>

            {result.finansman && (
              <div className={`p-4 rounded-xl border text-sm ${dark ? 'border-slate-700 bg-slate-800/50 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${sub}`}>Kredi / Geri Ödemeli Finansman</p>
                <p><strong className={text}>{result.finansman.finansmanUstLimit.toLocaleString('tr-TR')} ₺</strong>'ye kadar · {result.finansman.title}</p>
              </div>
            )}

            <p className={`text-[11px] ${sub}`}>
              Tutarlar tek bir programdan alınabilecek en yüksek resmi üst limittir; destekler genelde birbirine eklenmez ve aynı gider için iki kamu desteği alınamaz. Başvurmadan önce programın şartlarını kontrol edin.
            </p>

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
                      <p className="text-xs font-bold text-[#1E293B]">{p.institution}</p>
                      <p className={`text-sm font-bold group-hover:text-[#1E293B] transition ${text}`}>{p.title}</p>
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
