import React, { useState } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { DESTEK_SORULARI, kisaAd } from '../destekSorulari';

// ── Destek Bul: adım adım sorular ────────────────────────────────────────────
// Her ekranda tek soru; seçim yapılınca otomatik sonraki soruya geçilir,
// son sorudan sonra onTamamla(tum degerler) çağrılır.
export default function DestekSorulari({ degerler, onTamamla, dark, profildenDolu }) {
  const [adim, setAdim] = useState(0);
  const [secimler, setSecimler] = useState(degerler);
  const soru = DESTEK_SORULARI[adim];
  const toplam = DESTEK_SORULARI.length;

  const sec = (deger) => {
    const yeni = { ...secimler, [soru.alan]: deger };
    setSecimler(yeni);
    if (adim < toplam - 1) setTimeout(() => setAdim(adim + 1), 160);
    else onTamamla(yeni);
  };

  const kart = dark ? 'bg-[#1E293B] border-[#374151]' : 'bg-white border-[#EAE3D9] shadow-[0_10px_30px_rgba(30,41,59,0.06)]';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <section id="destek-sorulari" className={`scroll-mt-24 rounded-3xl border p-6 md:p-8 ${kart}`} aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <h2 className={`text-xl font-black ${dark ? 'text-white' : 'text-[#1E293B]'}`}>Sana uygun destekleri bulalım</h2>
        <span className={`shrink-0 whitespace-nowrap text-xs font-bold ${sub}`}>Adım {adim + 1}/{toplam}</span>
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {DESTEK_SORULARI.map((s, i) => (
          <div key={s.alan} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= adim ? 'bg-[#1E293B] dark:bg-[#F3D5D8]' : dark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        ))}
      </div>
      {profildenDolu && adim === 0 && (
        <p className={`mt-3 text-xs ${sub}`}>✨ Profilindeki bilgiler işaretli geldi — onaylamak için aynı seçeneğe dokunman yeterli.</p>
      )}

      <h3 className={`mt-6 text-2xl font-bold ${dark ? 'text-white' : 'text-[#0f172a]'}`}>{soru.soru}</h3>
      {soru.not && <p className={`mt-1 text-sm ${sub}`}>{soru.not}</p>}

      <div className={`mt-5 grid gap-3 ${soru.secenekler.length > 4 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {soru.secenekler.map(o => {
          const secili = secimler[soru.alan] === o.deger;
          return (
            <button
              key={o.deger}
              type="button"
              onClick={() => sec(o.deger)}
              aria-pressed={secili}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                secili
                  ? 'border-[#4A1525] bg-[#F3D5D8] text-[#4A1525] shadow-md'
                  : dark ? 'border-slate-700 bg-slate-800/60 text-slate-100 hover:border-[#F3D5D8]' : 'border-slate-200 bg-[#FAF7F2] text-[#1E293B] hover:border-[#F3D5D8] hover:bg-[#FDF5F6]'
              }`}
            >
              <span className="text-2xl" aria-hidden>{o.ikon}</span>
              <span>
                <span className="block text-sm font-bold">{o.ad}</span>
                {o.aciklama && <span className={`block text-xs ${secili ? 'text-[#4A1525]/75' : sub}`}>{o.aciklama}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {adim > 0 && (
        <button type="button" onClick={() => setAdim(adim - 1)} className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${sub} hover:underline`}>
          <ArrowLeft className="h-4 w-4" /> Geri
        </button>
      )}
    </section>
  );
}

// Sorular tamamlandıktan sonra sonuçların üstünde görünen seçim özeti
export function SecimOzeti({ degerler, onDegistir, dark }) {
  const etiketler = DESTEK_SORULARI.map(s => kisaAd(s.alan, degerler[s.alan])).filter(Boolean);
  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3 ${dark ? 'border-slate-700 bg-[#1E293B]' : 'border-[#EAE3D9] bg-white'}`}>
      <span className={`mr-1 text-xs font-bold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Seçimlerin</span>
      {etiketler.map(e => (
        <span key={e} className="rounded-full bg-[#F3D5D8] px-3 py-1 text-xs font-bold text-[#4A1525]">{e}</span>
      ))}
      <button type="button" onClick={onDegistir} className={`ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${dark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
        <Pencil className="h-3.5 w-3.5" /> Değiştir
      </button>
    </div>
  );
}
