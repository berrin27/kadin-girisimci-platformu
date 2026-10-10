import React, { useCallback, useEffect, useState } from 'react';
import { BellRing, X } from 'lucide-react';
import { api, KANBAN_GUNCELLENDI } from '../api';
import { bugunYerel } from '../tarih';

// ── "Başvurunu tamamladın mı?" hatırlatması ──────────────────────────────────
// Kullanıcı Planlıyorum'daki bir programın resmi sayfasını açtıysa, siteye
// döndüğünde (açılışta veya sekmeye geri gelince) sorulur. "Evet" kartı
// Başvurdum'a taşır, "Henüz değil" hatırlatmayı kapatır.
export default function HatirlatmaBandi({ dark, onPanoyaGit }) {
  const [kartlar, setKartlar] = useState([]);
  const [isleniyor, setIsleniyor] = useState(null);

  const kontrolEt = useCallback(() => {
    api.kanban.hatirlatmalar().then(({ cards }) => setKartlar(cards)).catch(() => {});
  }, []);

  useEffect(() => {
    kontrolEt();
    const gorunurOlunca = () => { if (document.visibilityState === 'visible') kontrolEt(); };
    document.addEventListener('visibilitychange', gorunurOlunca);
    return () => document.removeEventListener('visibilitychange', gorunurOlunca);
  }, [kontrolEt]);

  const cevapla = async (kart, basvurdum) => {
    setIsleniyor(kart.id);
    try {
      await api.kanban.hatirlatmaCevap(kart.id, basvurdum, bugunYerel());
      setKartlar(prev => prev.filter(k => k.id !== kart.id));
      window.dispatchEvent(new Event(KANBAN_GUNCELLENDI));
    } catch {
      // ağ hatasında bant kalır, kullanıcı tekrar deneyebilir
    } finally {
      setIsleniyor(null);
    }
  };

  const kart = kartlar[0];
  if (!kart) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 mt-4" role="status">
      <div className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${dark ? 'border-amber-700/50 bg-amber-900/20 text-amber-100' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
        <BellRing className="h-5 w-5 shrink-0" />
        <p className="flex-1 min-w-[200px] text-sm">
          <strong>{kart.title}</strong> için resmi başvuru sayfasını açmıştın. <strong>Başvurunu tamamladın mı?</strong>
          {kartlar.length > 1 && <span className="opacity-70"> (+{kartlar.length - 1} program daha)</span>}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" disabled={isleniyor === kart.id} onClick={() => cevapla(kart, true)}
            className="rounded-xl bg-[#1E293B] px-3 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50">
            Evet, başvurdum
          </button>
          <button type="button" disabled={isleniyor === kart.id} onClick={() => cevapla(kart, false)}
            className={`rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50 ${dark ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-700 border border-amber-200'}`}>
            Henüz değil
          </button>
          <button type="button" onClick={onPanoyaGit} className="text-xs font-semibold underline underline-offset-2 opacity-80 hover:opacity-100">
            Başvurularım
          </button>
          <button type="button" onClick={() => cevapla(kart, false)} aria-label="Kapat" className="rounded-lg p-1 opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
