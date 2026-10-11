import React from 'react';
import { Construction } from 'lucide-react';

// ── Kurumsal bilgi sayfaları (Hakkımızda, İletişim, Kullanım Şartları) ───────
// TODO: İçerikler hazırlanacak — şimdilik "hazırlanıyor" yer tutucusu gösterilir.
const BILGI_SAYFALARI = {
  hakkimizda: { baslik: 'Hakkımızda', ikon: '💜', aciklama: 'Fortuno\'nun hikayesi, misyonu ve ekibi.' },
  iletisim: { baslik: 'İletişim', ikon: '✉️', aciklama: 'Soru, öneri ve iş birliği talepleriniz için bize ulaşın.' },
  sartlar: { baslik: 'Kullanım Şartları', ikon: '📄', aciklama: 'Platformun kullanım koşulları.' },
};

export default function BilgiSayfasi({ sayfa, dark }) {
  const bilgi = BILGI_SAYFALARI[sayfa];
  if (!bilgi) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 mt-12 pb-24">
      <div className={`rounded-3xl border p-10 text-center shadow-xl ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-krem-200'}`}>
        <div className="text-5xl mb-4">{bilgi.ikon}</div>
        <h2 className={`text-3xl font-black mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>{bilgi.baslik}</h2>
        <p className={`mb-8 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{bilgi.aciklama}</p>
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${dark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
          <Construction className="w-4 h-4" /> Bu sayfa hazırlanıyor, çok yakında burada olacak.
        </div>
      </div>
    </main>
  );
}
