import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, BadgeCheck, Monitor, Wallet, Rocket, GraduationCap } from 'lucide-react';
import { egitimler, SON_KONTROL } from '../data';
import { api } from '../api';

// ── Eğitimler ────────────────────────────────────────────────────────────────
// Üstte 3 adımlı "Nereden başlamalıyım?" yolu, altında konuya göre
// filtrelenebilen doğrulanmış eğitimler (src/data.js → egitimler).
// Nakit Akışı Simülatörü bu sayfadan Araçlar menüsüne taşındı (NakitAkisi.jsx).

const KONULAR = [
  { id: 'hepsi', ad: 'Tümü' },
  { id: 'is-kurma', ad: 'İş kurma' },
  { id: 'finans', ad: 'Para yönetimi' },
  { id: 'dijital', ad: 'Dijital & e-ticaret' },
  { id: 'ihracat', ad: 'İhracat' },
];

const YOL = [
  { adim: 1, Ikon: GraduationCap, baslik: 'İş kurmanın temelleri', aciklama: 'İş fikrini plana dök, şirket kurmayı ve destekleri öğren. Birçok kredi bu belgeyi istiyor.' },
  { adim: 2, Ikon: Wallet, baslik: 'Para yönetimi', aciklama: 'Nakit akışı, maliyet ve finansal planlama — işin ayakta kalmasının anahtarı.' },
  { adim: 3, Ikon: Rocket, baslik: 'Dijitalde satış & ihracat', aciklama: 'İnternetten müşteri bul, pazaryerlerinde sat, yurt dışına aç.' },
];

// Profildeki aşamaya göre önerilen başlangıç adımı
const ONERILEN_ADIM = { fikir: 1, yeni_kurulmus: 1, buyume: 2, kriz_donemi: 2, kokenlesik: 3 };

export default function EgitimPortali({ dark }) {
  const [konu, setKonu] = useState('hepsi');
  const [secilenAdim, setSecilenAdim] = useState(null);
  const [onerilen, setOnerilen] = useState(null);

  useEffect(() => {
    api.profile.get().then(({ profile }) => setOnerilen(ONERILEN_ADIM[profile.asama] || null)).catch(() => {});
  }, []);

  const liste = useMemo(() => egitimler.filter(e =>
    (konu === 'hepsi' || e.konu === konu) && (!secilenAdim || e.adim === secilenAdim),
  ), [konu, secilenAdim]);

  const card = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';

  const adimSec = (adim) => { setSecilenAdim(secilenAdim === adim ? null : adim); setKonu('hepsi'); };

  return (
    <div className="max-w-5xl mx-auto px-4 mt-12 pb-24">
      <div className="text-center mb-10">
        <h2 className={`text-3xl md:text-4xl font-black mb-3 ${text}`}>Ücretsiz eğitimlerle işini güçlendir</h2>
        <p className={`max-w-2xl mx-auto ${sub}`}>
          Devlet kurumları ve bankaların kadın girişimcilere açık eğitimleri. Nereden başlayacağını bilmiyorsan aşağıdaki yolu izle.
        </p>
      </div>

      {/* ── Nereden başlamalıyım? ── */}
      <section aria-labelledby="yol-baslik" className="mb-10">
        <h3 id="yol-baslik" className={`mb-4 text-sm font-bold uppercase tracking-[0.16em] ${sub}`}>Nereden başlamalıyım?</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {YOL.map(({ adim, Ikon, baslik, aciklama }) => {
            const secili = secilenAdim === adim;
            return (
              <button
                key={adim}
                type="button"
                onClick={() => adimSec(adim)}
                aria-pressed={secili}
                className={`relative rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${
                  secili ? 'border-[#4A1525] bg-[#F3D5D8] text-[#4A1525]' : `${card} hover:border-[#F3D5D8]`
                }`}
              >
                {onerilen === adim && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#1E293B] px-2.5 py-1 text-[10px] font-bold text-white">Sana önerilen</span>
                )}
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${secili ? 'bg-white/70' : dark ? 'bg-slate-800 text-[#F3D5D8]' : 'bg-[#F3D5D8] text-[#4A1525]'}`}>
                    {adim}
                  </span>
                  <Ikon className={`h-5 w-5 ${secili ? '' : sub}`} />
                </div>
                <div className={`mt-3 text-base font-black ${secili ? '' : text}`}>{baslik}</div>
                <p className={`mt-1 text-sm leading-relaxed ${secili ? 'text-[#4A1525]/80' : sub}`}>{aciklama}</p>
                <div className={`mt-3 text-xs font-bold ${secili ? '' : sub}`}>
                  {egitimler.filter(e => e.adim === adim).length} eğitim {secili ? '· gösteriliyor' : '→'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Konu filtresi ── */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {KONULAR.map(k => (
          <button
            key={k.id}
            type="button"
            onClick={() => { setKonu(k.id); setSecilenAdim(null); }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              konu === k.id && !secilenAdim ? 'bg-[#1E293B] text-white' : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {k.ad}
          </button>
        ))}
        {secilenAdim && (
          <button type="button" onClick={() => setSecilenAdim(null)} className={`text-sm font-semibold underline ${sub}`}>
            Adım filtresini kaldır
          </button>
        )}
      </div>

      {/* ── Eğitim kartları ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {liste.map(e => (
          <article key={e.id} className={`flex flex-col rounded-2xl border p-5 ${card}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${sub}`}>{e.kurum}</div>
                <h4 className={`mt-1 text-lg font-black leading-snug ${text}`}>{e.baslik}</h4>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${e.ucret === 'Ücretsiz' ? 'bg-emerald-100 text-emerald-700' : dark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>{e.ucret}</span>
            </div>
            <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold ${sub}`}>
              <span className="inline-flex items-center gap-1"><Monitor className="h-3.5 w-3.5" /> {e.bicim}</span>
              {e.sertifika && <span className="inline-flex items-center gap-1 text-emerald-600"><BadgeCheck className="h-3.5 w-3.5" /> Belge veriliyor</span>}
              <span>{KONULAR.find(k => k.id === e.konu)?.ad}</span>
            </div>
            <p className={`mt-3 flex-1 text-sm leading-relaxed ${sub}`}>{e.aciklama}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <a href={e.kaynak} target="_blank" rel="noreferrer" className={`text-[11px] hover:underline ${sub}`}>Kaynak · {SON_KONTROL}</a>
              <a href={e.link} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E293B] px-4 py-2 text-sm font-bold text-white hover:opacity-90">
                Eğitime git <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
      {liste.length === 0 && (
        <p className={`rounded-2xl border p-8 text-center ${card} ${sub}`}>Bu konuda şimdilik doğrulanmış bir eğitim yok.</p>
      )}
    </div>
  );
}
