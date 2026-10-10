import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Save, CheckCircle2, Edit3, Shield, Sparkles, ChevronRight, Award } from 'lucide-react';
import { guvenliKaydet, guvenliOku } from '../crypto';

// ── localStorage key ────────────────────────────────────────────────────────
const PROFIL_KEY = 'fortuno-profil';

const defaultProfil = {
  ad: '',
  soyad: '',
  yas: '',
  telefon: '',
  sektor: '',
  profilTipi: '',
  asama: '',
  medeniDurum: '',
};

// ── Seçenekler (sihirbazla senkron) ──────────────────────────────────────────
const SEKTOR_OPTS = [
  ['', 'Seçiniz...'],
  ['yerel_isletme', '🏪 Yerel İşletme'],
  ['ev_emegi', '🏠 Ev Emeği / El İşi'],
  ['teknoloji', '💻 Teknoloji / Yazılım'],
  ['e_ticaret', '🛒 E-Ticaret'],
  ['kooperatif', '🤝 Kadın Kooperatifleri'],
  ['sosyal_girisim', '🌱 Sosyal Girişim'],
  ['kırsal', '🌾 Kırsal Alan / Tarım'],
];

const PROFIL_OPTS = [
  ['', 'Seçiniz...'],
  ['genc_uni', '🎓 18-25 Yaş'],
  ['genc_girisimci', '💼 26-35 Yaş'],
  ['standart', '🌟 36-50 Yaş'],
  ['olgun_girisimci', '👑 50+ Yaş'],
];

const ASAMA_OPTS = [
  ['', 'Seçiniz...'],
  ['fikir', '💡 Fikir Aşaması'],
  ['yeni_kurulmus', '🌱 Yeni Kurulmuş'],
  ['buyume', '📈 Büyüme Döneminde'],
  ['kriz_donemi', '🔄 Yeniden Yapılanma'],
  ['kokenlesik', '🏆 Köklü İşletme'],
];

const MEDENI_OPTS = [
  ['', 'Seçiniz...'],
  ['hepsi', '💜 Fark etmez'],
  ['bekar', '🌸 Bekar'],
  ['evli', '💍 Evli'],
  ['dul', '🖤 Dul'],
  ['bosanmis', '🔓 Boşanmış'],
];

// ── Profil Doldurma Oranı Hesapla ────────────────────────────────────────────
function hesaplaOran(profil) {
  const alanlar = ['ad', 'soyad', 'yas', 'telefon', 'sektor', 'profilTipi', 'asama', 'medeniDurum'];
  const dolu = alanlar.filter(a => profil[a] && profil[a].trim() !== '').length;
  return Math.round((dolu / alanlar.length) * 100);
}

export default function ProfilDuzenle({ dark, onProfilChange }) {
  const [profil, setProfil] = useState({ ...defaultProfil });
  const [kaydedildi, setKaydedildi] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [yuklendi, setYuklendi] = useState(false);

  // ── İlk yüklemede şifreli veriyi oku ───────────────────────────────────────
  useEffect(() => {
    async function yukle() {
      const saved = await guvenliOku(PROFIL_KEY);
      if (saved) setProfil(prev => ({ ...prev, ...saved }));
      setYuklendi(true);
    }
    yukle();
  }, []);

  const oran = hesaplaOran(profil);

  // ── Persist (şifreli) & notify parent ──────────────────────────────────────
  useEffect(() => {
    if (!yuklendi) return;
    guvenliKaydet(PROFIL_KEY, profil);
    if (onProfilChange) onProfilChange(profil);
  }, [profil, onProfilChange, yuklendi]);

  const handleSave = () => {
    setKaydedildi(true);
    setEditMode(false);
    setTimeout(() => setKaydedildi(false), 2500);
  };

  const update = (field, val) => setProfil(prev => ({ ...prev, [field]: val }));

  // ── Stil ───────────────────────────────────────────────────────────────────
  const card  = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const text  = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub   = dark ? 'text-slate-400' : 'text-slate-500';
  const input = dark
    ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:ring-purple-500 focus:border-purple-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-purple-500 focus:border-purple-500';

  // ── Progress ring color ────────────────────────────────────────────────────
  const ringColor = oran === 100 ? '#10b981' : oran >= 50 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (oran / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto px-4 mt-12 pb-24">

      {/* ── Başlık ─────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${dark ? 'bg-pink-900/40 text-pink-300' : 'bg-pink-50 text-pink-700'}`}>
          <User className="w-4 h-4" /> Girişimci Profilim
        </div>
        <h2 className={`text-4xl font-black mb-3 ${text}`}>
          Profilini Oluştur 💜
        </h2>
        <p className={`max-w-2xl mx-auto text-base ${sub}`}>
          Bilgilerini doldur, sana özel destek programlarını otomatik olarak eşleştirelim.
          <strong className={dark ? ' text-slate-200' : ' text-slate-700'}> Profil ne kadar doluysa, eşleşme o kadar doğru!</strong>
        </p>
      </div>

      {/* ── Profil Kartı + İlerleme ───────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">

        {/* Sol: İlerleme halkası */}
        <div className={`${card} border rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg`}>
          <div className="relative w-28 h-28 mb-4">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke={dark ? '#334155' : '#e2e8f0'} strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={ringColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - strokeDash}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-black ${text}`}>{oran}%</span>
            </div>
          </div>
          <p className={`text-sm font-bold ${text}`}>Profil Doluluk</p>
          <p className={`text-xs mt-1 ${sub}`}>
            {oran === 100 ? '🎉 Mükemmel! Tam eşleşme yapılabilir.' :
             oran >= 50 ? '🔄 Biraz daha bilgi gerekiyor.' : '⚠️ Profilini doldur, destekleri keşfet!'}
          </p>
          {oran === 100 && (
            <div className="mt-3 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Tam Profil
            </div>
          )}
        </div>

        {/* Sağ: Hızlı istatistikler */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            { ikon: '👤', label: 'Ad Soyad', deger: profil.ad && profil.soyad ? `${profil.ad} ${profil.soyad}` : 'Henüz girilmedi', ok: !!(profil.ad && profil.soyad) },
            { ikon: '📞', label: 'Telefon', deger: profil.telefon || 'Henüz girilmedi', ok: !!profil.telefon },
            { ikon: '🎂', label: 'Yaş', deger: profil.yas ? `${profil.yas} yaşında` : 'Henüz girilmedi', ok: !!profil.yas },
            { ikon: '🏢', label: 'Sektör', deger: SEKTOR_OPTS.find(o => o[0] === profil.sektor)?.[1]?.replace(/^.\s/, '') || 'Henüz seçilmedi', ok: !!profil.sektor },
          ].map((s, i) => (
            <div key={i} className={`${card} border rounded-xl p-4 shadow`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.ikon}</span>
                <span className={`text-xs font-bold ${sub}`}>{s.label}</span>
                {s.ok && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
              </div>
              <p className={`text-sm font-semibold truncate ${s.ok ? text : sub}`}>{s.deger}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form ──────────────────────────────────────────────────── */}
      {!editMode ? (
        <div className="text-center mb-8">
          <button
            onClick={() => setEditMode(true)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition ${dark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-100 hover:bg-purple-200 text-purple-800'}`}
          >
            <Edit3 className="w-4 h-4" /> Profili Düzenle
          </button>
        </div>
      ) : (
        <div className={`${card} border rounded-2xl shadow-lg p-6 md:p-8 mb-8`}>
          <h3 className={`text-lg font-black mb-6 flex items-center gap-2 ${text}`}>
            <Edit3 className="w-5 h-5 text-purple-500" /> Kişisel Bilgiler
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Ad */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Ad *</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} />
                <input
                  type="text"
                  placeholder="Adınız"
                  value={profil.ad}
                  onChange={e => update('ad', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition ${input}`}
                />
              </div>
            </div>

            {/* Soyad */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Soyad *</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} />
                <input
                  type="text"
                  placeholder="Soyadınız"
                  value={profil.soyad}
                  onChange={e => update('soyad', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition ${input}`}
                />
              </div>
            </div>

            {/* Yaş */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Yaş *</label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} />
                <input
                  type="number"
                  min="18" max="99"
                  placeholder="Yaşınız"
                  value={profil.yas}
                  onChange={e => update('yas', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition ${input}`}
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Telefon Numarası *</label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} />
                <input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={profil.telefon}
                  onChange={e => update('telefon', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition ${input}`}
                />
              </div>
            </div>

            {/* Sektör */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Sektör / Alan</label>
              <select
                value={profil.sektor}
                onChange={e => update('sektor', e.target.value)}
                className={`w-full p-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition ${input}`}
              >
                {SEKTOR_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {/* Yaş / Profil Tipi */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Profil Tipi</label>
              <select
                value={profil.profilTipi}
                onChange={e => update('profilTipi', e.target.value)}
                className={`w-full p-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition ${input}`}
              >
                {PROFIL_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {/* Girişim Aşaması */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Girişim Aşaması</label>
              <select
                value={profil.asama}
                onChange={e => update('asama', e.target.value)}
                className={`w-full p-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition ${input}`}
              >
                {ASAMA_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {/* Medeni Durum */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${sub}`}>Medeni Durum</label>
              <select
                value={profil.medeniDurum}
                onChange={e => update('medeniDurum', e.target.value)}
                className={`w-full p-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition ${input}`}
              >
                {MEDENI_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Kaydet butonu */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {kaydedildi ? 'Kaydedildi! ✓' : 'Profili Kaydet'}
            </button>
            {kaydedildi && (
              <span className="text-emerald-500 text-sm font-bold flex items-center gap-1 animate-bounce">
                <CheckCircle2 className="w-4 h-4" /> Başarıyla kaydedildi!
              </span>
            )}
          </div>

          {/* Güvenlik notu */}
          <div className={`mt-4 flex items-center gap-2 text-xs ${sub}`}>
            <Shield className="w-3.5 h-3.5" />
            Bilgileriniz sadece bu cihazda saklanır, hiçbir sunucuya gönderilmez.
          </div>
        </div>
      )}

      {/* ── Profil Tamamsa → Sihirbaza Yönlendir ──────────────────── */}
      {oran === 100 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
          <div className="p-8 text-center text-white">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-2xl font-black mb-2">Profilin Hazır!</h3>
            <p className="text-purple-100 text-sm max-w-xl mx-auto mb-5">
              Artık Destek Sihirbazı senin profiline göre en uygun programları otomatik filtreleyebilir.
              "Hadi Başvur" butonuyla doğrudan başvurabilirsin!
            </p>
            <button
              onClick={() => {
                // Sihirbaza geçiş - parent'ta activeSection'ı değiştirmek için
                const event = new CustomEvent('fortuno-navigate', { detail: 'sihirbaz' });
                window.dispatchEvent(event);
              }}
              className="bg-white text-purple-700 font-black px-8 py-3 rounded-xl hover:bg-purple-50 transition shadow-lg text-sm flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              Destek Sihirbazına Git
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
