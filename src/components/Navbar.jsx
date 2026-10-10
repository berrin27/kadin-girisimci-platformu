import React, { useEffect, useRef, useState } from 'react';
import { Heart, Sun, Moon, LogOut, Menu, X, ChevronDown, UserRound } from 'lucide-react';
import FortunoLogo from './FortunoLogo';

// ── Menü yapısı ──────────────────────────────────────────────────────────────
// Üst menü kullanıcının yapmak istediği işlere göre 5 sekmedir. `sections`,
// sekmenin hangi sayfalarda seçili görüneceğini belirler (ör. Fırsatlar →
// Başvurusu Açık ve Haberler sekmeleri). Kişisel sayfalar "Hesabım" menüsünde,
// Kaynakça ve kurumsal sayfalar footer'dadır.
const NAV_MENU = [
  { id: 'sihirbaz', label: 'Destek Bul', sections: ['sihirbaz'] },
  { id: 'fuar', label: 'Fırsatlar', sections: ['fuar', 'guncel'] },
  {
    label: 'Araçlar',
    children: [
      { id: 'is-plani', label: 'İş Planı', aciklama: 'Banka, hibe ve yatırımcı için plan hazırla' },
    ],
  },
  { id: 'egitim', label: 'Eğitimler', sections: ['egitim'] },
  { id: 'takip', label: 'Başvurularım', sections: ['takip'] },
];

const HESAP_MENU = [
  { id: 'profil', label: 'Profilim' },
  { id: 'favoriler', label: 'Favorilerim' },
  { id: 'guvenlik', label: 'Verilerim & Gizlilik' },
];

const ogeSecili = (oge, aktif) => (oge.children
  ? oge.children.some(c => c.id === aktif)
  : (oge.sections || [oge.id]).includes(aktif));

// Dışarı tıklanınca veya ESC'ye basılınca kapanan açılır menü durumu
function useAcilirMenu() {
  const [acik, setAcik] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!acik) return;
    const disari = (e) => { if (ref.current && !ref.current.contains(e.target)) setAcik(false); };
    const esc = (e) => { if (e.key === 'Escape') setAcik(false); };
    document.addEventListener('mousedown', disari);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', disari); document.removeEventListener('keydown', esc); };
  }, [acik]);
  return [acik, setAcik, ref];
}

export default function Navbar({ activeSection, onNavigate, favoriSayisi, dark, setDark, user, onLogout }) {
  const [mobilAcik, setMobilAcik] = useState(false);
  const [araclarAcik, setAraclarAcik, araclarRef] = useAcilirMenu();
  const [hesapAcik, setHesapAcik, hesapRef] = useAcilirMenu();

  // Mobil menü: ESC ile kapat
  useEffect(() => {
    if (!mobilAcik) return;
    const esc = (e) => { if (e.key === 'Escape') setMobilAcik(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [mobilAcik]);

  const git = (id) => {
    setMobilAcik(false);
    setAraclarAcik(false);
    setHesapAcik(false);
    onNavigate(id);
  };

  const sekmeCls = (secili) => `whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition ${
    secili
      ? 'bg-[#F3D5D8] text-[#4A1525]'
      : dark ? 'text-slate-200 hover:bg-[#2A3544] hover:text-white' : 'text-[#1E293B] hover:bg-[#F7F0F1]'
  }`;
  const panelCls = `absolute top-full mt-2 rounded-2xl border p-2 shadow-xl ${dark ? 'border-slate-700 bg-[#1c2333]' : 'border-slate-200 bg-white'}`;
  const panelOgeCls = (secili) => `block w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
    secili ? 'bg-[#F3D5D8] text-[#4A1525]' : dark ? 'text-slate-200 hover:bg-[#2A3544]' : 'text-[#1E293B] hover:bg-[#F7F0F1]'
  }`;
  const yuvarlakBtn = `rounded-full p-2.5 transition ${dark ? 'bg-[#2A3544] text-white' : 'bg-[#F3D5D8] text-[#4A1525] hover:bg-[#eed0d5]'}`;
  const mobilOgeCls = (secili) => `rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
    secili ? 'bg-[#F3D5D8] text-[#4A1525]' : dark ? 'bg-[#1E293B] text-slate-200 hover:bg-[#2A3544]' : 'bg-[#FAF7F2] text-[#1E293B] hover:bg-[#F7F0F1]'
  }`;
  const grupBaslik = `mt-4 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] ${dark ? 'text-slate-400' : 'text-slate-500'}`;

  return (
    <nav className={`sticky top-0 z-40 border-b ${dark ? 'bg-slate-900/90 text-white border-slate-700/80 backdrop-blur-md' : 'bg-white/90 text-slate-900 border-slate-200/80 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <button type="button" onClick={() => git('sihirbaz')} className="flex items-center gap-3 text-left" aria-label="Ana sayfa">
          <div className="rounded-xl bg-gradient-to-br from-[#A8D5F2] to-[#F7DDE7] p-2 shadow-soft">
            <FortunoLogo />
          </div>
          <div>
            <div className="text-lg font-black tracking-[0.18em] text-[#2B5472] dark:text-[#B9D9EF]">FORTUNO</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Women Tech AI</div>
          </div>
        </button>

        {/* ── Masaüstü menü ── */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_MENU.map(oge => oge.children ? (
            <div key={oge.label} className="relative" ref={araclarRef}>
              <button
                type="button"
                onClick={() => setAraclarAcik(a => !a)}
                aria-expanded={araclarAcik}
                className={`${sekmeCls(ogeSecili(oge, activeSection))} inline-flex items-center gap-1`}
              >
                {oge.label} <ChevronDown className={`h-3.5 w-3.5 transition ${araclarAcik ? 'rotate-180' : ''}`} />
              </button>
              {araclarAcik && (
                <div className={`${panelCls} left-0 w-72`}>
                  {oge.children.map(c => (
                    <button key={c.id} type="button" onClick={() => git(c.id)} className={panelOgeCls(activeSection === c.id)}>
                      <span className="block font-semibold">{c.label}</span>
                      <span className={`block text-xs ${activeSection === c.id ? 'text-[#4A1525]/80' : dark ? 'text-slate-400' : 'text-slate-500'}`}>{c.aciklama}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button key={oge.id} type="button" onClick={() => git(oge.id)} className={sekmeCls(ogeSecili(oge, activeSection))}>
              {oge.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {favoriSayisi > 0 && (
            <button
              id="nav-favs"
              type="button"
              onClick={() => git('favoriler')}
              aria-label={`Favorilerim (${favoriSayisi})`}
              className={`hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold sm:flex ${activeSection === 'favoriler' ? 'bg-[#F3D5D8] text-[#4A1525]' : dark ? 'bg-[#2A3544] text-slate-200' : 'bg-[#F3D5D8] text-[#4A1525]'}`}
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              {favoriSayisi}
            </button>
          )}

          <button id="dark-mode-toggle" type="button" onClick={() => setDark(d => !d)} className={yuvarlakBtn} aria-label="Karanlık mod">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* ── Hesabım ── */}
          <div className="relative hidden lg:block" ref={hesapRef}>
            <button
              id="hesabim-btn"
              type="button"
              onClick={() => setHesapAcik(a => !a)}
              aria-expanded={hesapAcik}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${
                HESAP_MENU.some(h => h.id === activeSection) ? 'bg-[#F3D5D8] text-[#4A1525]' : dark ? 'bg-[#2A3544] text-white' : 'bg-[#1E293B] text-white hover:opacity-90'
              }`}
            >
              <UserRound className="h-4 w-4" /> Hesabım <ChevronDown className={`h-3.5 w-3.5 transition ${hesapAcik ? 'rotate-180' : ''}`} />
            </button>
            {hesapAcik && (
              <div className={`${panelCls} right-0 w-64`}>
                <p className={`truncate px-3 pb-2 pt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                {HESAP_MENU.map(h => (
                  <button key={h.id} type="button" onClick={() => git(h.id)} className={panelOgeCls(activeSection === h.id)}>
                    {h.label}{h.id === 'favoriler' && favoriSayisi > 0 ? ` (${favoriSayisi})` : ''}
                  </button>
                ))}
                <div className={`my-1 border-t ${dark ? 'border-slate-700' : 'border-slate-100'}`} />
                <button id="logout-btn" type="button" onClick={onLogout} className={`${panelOgeCls(false)} inline-flex items-center gap-2`}>
                  <LogOut className="h-4 w-4" /> Çıkış yap
                </button>
              </div>
            )}
          </div>

          <button
            id="mobile-menu-btn"
            type="button"
            onClick={() => setMobilAcik(o => !o)}
            className={`rounded-full p-2.5 transition lg:hidden ${dark ? 'bg-[#2A3544] text-white' : 'bg-[#1E293B] text-white'}`}
            aria-label={mobilAcik ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobilAcik}
            aria-controls="mobile-menu"
          >
            {mobilAcik ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobil Menü ── */}
      {mobilAcik && (
        <div id="mobile-menu" className={`lg:hidden border-t px-4 pb-4 pt-1 ${dark ? 'border-slate-700/80' : 'border-slate-200/80'}`}>
          <div className="grid grid-cols-2 gap-2 pt-3">
            {NAV_MENU.filter(o => !o.children).map(o => (
              <button key={o.id} type="button" onClick={() => git(o.id)} className={mobilOgeCls(ogeSecili(o, activeSection))}>{o.label}</button>
            ))}
          </div>
          {NAV_MENU.filter(o => o.children).map(o => (
            <div key={o.label}>
              <p className={grupBaslik}>{o.label}</p>
              <div className="grid grid-cols-2 gap-2">
                {o.children.map(c => (
                  <button key={c.id} type="button" onClick={() => git(c.id)} className={mobilOgeCls(activeSection === c.id)}>{c.label}</button>
                ))}
              </div>
            </div>
          ))}
          <p className={grupBaslik}>Hesabım · <span className="normal-case tracking-normal font-semibold">{user.email}</span></p>
          <div className="grid grid-cols-2 gap-2">
            {HESAP_MENU.map(h => (
              <button key={h.id} type="button" onClick={() => git(h.id)} className={mobilOgeCls(activeSection === h.id)}>
                {h.label}{h.id === 'favoriler' && favoriSayisi > 0 ? ` (${favoriSayisi})` : ''}
              </button>
            ))}
            <button type="button" onClick={onLogout} className={`${mobilOgeCls(false)} inline-flex items-center gap-2`}>
              <LogOut className="h-4 w-4" /> Çıkış yap
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
