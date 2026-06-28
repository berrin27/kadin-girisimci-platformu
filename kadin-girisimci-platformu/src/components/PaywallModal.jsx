import React from 'react';
import { Crown, X, Check, Zap, Lock } from 'lucide-react';

const LIMIT_MESSAGES = {
  arama: {
    title: 'Aylık Arama Limitine Ulaştınız',
    desc: 'Ücretsiz planda ayda 3 hibe araması yapabilirsiniz. Pro\'ya geçerek sınırsız arama ve yapay zeka destekli analizlere erişin.',
    icon: '🔍',
  },
  takip: {
    title: 'Başvuru Takip Limitine Ulaştınız',
    desc: 'Ücretsiz planda en fazla 3 aktif başvuru takip edebilirsiniz. Pro ile sınırsız başvuru takibi ve Excel/PDF raporlama yapın.',
    icon: '📋',
  },
  rapor: {
    title: 'Bu Özellik Pro Kullanıcılara Özel',
    desc: 'PDF ve Excel rapor indirme özelliği yalnızca Pro üyeler içindir. Hemen geçerek raporlama araçlarına erişin.',
    icon: '📊',
  },
  egitim: {
    title: 'Bu İçerik Pro\'ya Özel',
    desc: 'Canlı atölyeler ve premium eğitim içerikleri yalnızca Pro kullanıcılar içindir.',
    icon: '🎓',
  },
  default: {
    title: 'Bu Özellik Pro Kullanıcılara Özel',
    desc: 'Fortuno Pro\'ya geçerek tüm premium özelliklere erişin ve hibe başvurularınızda rekabet avantajı kazanın.',
    icon: '⚡',
  },
};

const PRO_BULLETS = [
  'Sınırsız hibe araması',
  'Yapay zeka destekli analiz',
  'Sınırsız başvuru takibi',
  'Deadline SMS/WhatsApp bildirimi',
  'PDF/Excel rapor indirme',
  'Hibe niyet mektubu taslağı (AI)',
];

export default function PaywallModal({ dark, type = 'default', onClose, onUpgrade }) {
  const msg = LIMIT_MESSAGES[type] || LIMIT_MESSAGES.default;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-md rounded-3xl border overflow-hidden shadow-2xl ${dark ? 'bg-[#1e2840] border-slate-700' : 'bg-white border-slate-200'}`}
        style={{ animation: 'paywall-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <style>{`
          @keyframes paywall-pop {
            from { opacity: 0; transform: scale(0.85) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Gradient header */}
        <div className="relative px-6 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* İkon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-3xl mb-3 border border-white/20">
            {msg.icon}
          </div>

          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full text-amber-300 text-[11px] font-black mb-3">
            <Crown className="w-3 h-3" /> FORTUNO PRO
          </div>

          <h2 className="text-xl font-black text-white mb-2">{msg.title}</h2>
          <p className="text-sm text-purple-200 leading-relaxed">{msg.desc}</p>
        </div>

        {/* Pro bullets */}
        <div className="px-6 py-5">
          <p className={`text-xs font-black uppercase tracking-widest mb-3 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
            Pro ile neler kazanırsınız?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PRO_BULLETS.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className={`text-[11px] font-bold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fiyat & CTA */}
        <div className="px-6 pb-6 space-y-3">
          <div className={`rounded-2xl p-4 flex items-center justify-between ${dark ? 'bg-slate-800/60' : 'bg-purple-50'}`}>
            <div>
              <p className={`text-xs font-bold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Yıllık planda</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${dark ? 'text-white' : 'text-[#0f172a]'}`}>₺83</span>
                <span className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>/ay</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-500">Aylık ₺149 yerine — %44 tasarruf</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 mb-1">veya</p>
              <p className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-700'}`}>₺149/ay</p>
              <p className="text-[10px] text-slate-400">aylık öde</p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); onUpgrade(); }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-base shadow-xl shadow-purple-500/30 hover:opacity-90 transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" /> Pro'ya Geç — İlk 14 Gün Ücretsiz
          </button>

          <p className={`text-[11px] text-center ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            💳 Kredi kartı gerekmez • İstediğinde iptal et
          </p>

          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Şimdi değil, ücretsiz devam et
          </button>
        </div>
      </div>
    </div>
  );
}
