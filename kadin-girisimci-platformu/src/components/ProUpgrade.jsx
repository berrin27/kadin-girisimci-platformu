import React, { useState } from 'react';
import {
  Crown, Check, X, Zap, Star, Shield, BarChart3,
  FileText, Bell, Users, Brain, Award, ChevronRight,
  Sparkles, Rocket, Lock, Infinity, Download, MessageSquare
} from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Ücretsiz',
    emoji: '🌱',
    price: 0,
    priceYear: 0,
    tag: null,
    color: '#64748b',
    grad: 'from-slate-500 to-slate-600',
    features: [
      { label: 'Ayda 3 hibe araması', ok: true },
      { label: 'Temel eşleştirme', ok: true },
      { label: '3 aktif başvuru takibi', ok: true },
      { label: 'Temel eğitim içerikleri', ok: true },
      { label: 'FortunoAI (5 soru/gün)', ok: true },
      { label: 'Gelişmiş AI analizi', ok: false },
      { label: 'Sınırsız başvuru takibi', ok: false },
      { label: 'Deadline SMS bildirimi', ok: false },
      { label: 'PDF/Excel rapor indirme', ok: false },
      { label: 'Hibe niyet mektubu taslağı', ok: false },
      { label: 'Öncelikli müşteri desteği', ok: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    emoji: '⚡',
    price: 149,
    priceYear: 999,
    tag: 'En Popüler',
    color: '#7c3aed',
    grad: 'from-purple-600 to-pink-600',
    features: [
      { label: 'Sınırsız hibe araması', ok: true },
      { label: 'Yapay zeka destekli detaylı analiz', ok: true },
      { label: 'Sınırsız başvuru takibi', ok: true },
      { label: 'Tüm eğitim içerikleri + canlı atölyeler', ok: true },
      { label: 'FortunoAI sınırsız', ok: true },
      { label: 'Kişiselleştirilmiş hibe planı', ok: true },
      { label: 'Deadline SMS/WhatsApp bildirimi', ok: true },
      { label: 'PDF/Excel rapor indirme', ok: true },
      { label: 'Hibe niyet mektubu taslağı (AI)', ok: true },
      { label: 'İş planı şablonları', ok: true },
      { label: 'Öncelikli müşteri desteği', ok: false },
    ],
  },
  {
    id: 'kurumsal',
    name: 'Kurumsal',
    emoji: '🏢',
    price: null,
    priceYear: null,
    tag: 'Teklif Al',
    color: '#059669',
    grad: 'from-emerald-500 to-teal-600',
    features: [
      { label: 'Pro paketteki her şey', ok: true },
      { label: 'Özel kurumsal dashboard', ok: true },
      { label: 'Ekip üyeleri (5 hesap)', ok: true },
      { label: 'Özel danışman atama', ok: true },
      { label: 'Toplu başvuru yönetimi', ok: true },
      { label: 'API entegrasyonu', ok: true },
      { label: 'Özel raporlama & analitik', ok: true },
      { label: 'SLA garantili destek', ok: true },
      { label: 'Özel eğitim & onboarding', ok: true },
      { label: 'Fatura & muhasebe entegrasyonu', ok: true },
      { label: '7/24 öncelikli destek', ok: true },
    ],
  },
];

const PRO_FEATURES = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Yapay Zeka Analizi',
    desc: 'Profilinizi analiz ederek hangi hibelere en yüksek şansla başvurabileceğinizi hesaplar ve stratejik öneriler sunar.',
    color: '#7c3aed',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Otomatik Belge Taslağı',
    desc: 'FortunoAI, KOSGEB ve TÜBİTAK başvuruları için niyet mektupları ve iş planı taslakları hazırlar.',
    color: '#db2777',
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: 'Akıllı Deadline Alarmı',
    desc: 'Son başvuru tarihlerine 30, 14 ve 3 gün kala WhatsApp ve SMS bildirimleriyle uyarılırsınız.',
    color: '#f97316',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Gelişmiş Raporlama',
    desc: 'Tüm başvurularınızı Excel ve PDF olarak indirin. Fon portföyünüzü analiz eden interaktif grafikler.',
    color: '#0891b2',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Mentorluk Ağı',
    desc: 'KOSGEB ve TÜBİTAK süreçlerini bilen deneyimli danışmanlarla bağlantı kurun. İlk görüşme ücretsiz.',
    color: '#059669',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Öncelikli Destek',
    desc: 'E-posta yerine canlı sohbet ile destek. Pro kullanıcılar ortalama 2 saat içinde yanıt alır.',
    color: '#7c3aed',
  },
];

const TESTIMONIALS = [
  {
    name: 'Ayşe Kaya',
    role: 'Teknoloji Girişimcisi, İstanbul',
    avatar: '👩‍💻',
    text: 'Fortuno Pro sayesinde TÜBİTAK 1512 başvurumu 2 haftada tamamladım. AI niyet mektubu taslağı harika çalışıyor!',
    stars: 5,
  },
  {
    name: 'Fatma Demir',
    role: 'Kadın Kooperatifi Kurucusu, Ankara',
    avatar: '🌸',
    text: 'KOSGEB başvurusunu daha önce 3 kez reddetmişlerdi. Pro\'nun danışman ağıyla bağlandım ve sonunda kabul aldım.',
    stars: 5,
  },
  {
    name: 'Zeynep Arslan',
    role: 'E-ticaret Girişimcisi, İzmir',
    avatar: '🛍️',
    text: 'Deadline alarmları hayat kurtarıcı. Daha önce bir başvuruyu kaçırmıştım, artık öyle bir sorunum yok.',
    stars: 5,
  },
];

export default function ProUpgrade({ dark, isPro, onUpgrade, onNavigate }) {
  const [billing, setBilling] = useState('yearly'); // monthly | yearly
  const [activePlan, setActivePlan] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const cardBase = dark ? 'bg-[#1e2840] border-slate-700' : 'bg-white border-slate-200';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';

  const handleSelectPlan = (planId) => {
    if (planId === 'free') return;
    if (planId === 'kurumsal') {
      window.open('mailto:pro@fortuno.app?subject=Kurumsal Teklif', '_blank');
      return;
    }
    setActivePlan(planId);
    // Simüle satın alma — gerçekte ödeme gateway'i entegre edilir
    setTimeout(() => {
      onUpgrade && onUpgrade();
      setShowSuccess(true);
    }, 1200);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/40 animate-bounce">
          <Crown className="w-12 h-12 text-white" />
        </div>
        <h2 className={`text-3xl font-black mb-3 ${text}`}>🎉 Fortuno Pro'ya Hoş Geldiniz!</h2>
        <p className={`max-w-md mx-auto text-base mb-8 ${sub}`}>
          Tüm Pro özellikler aktif edildi. Artık sınırsız hibe araması yapabilir, yapay zeka analizlerinize erişebilirsiniz.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('sihirbaz')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/30 hover:opacity-90 transition flex items-center gap-3"
        >
          <Rocket className="w-5 h-5" /> Hibe Sihirbazını Keşfet
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl mb-12 px-6 py-16 text-center"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        {/* Arka plan dekorasyon */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-pink-600/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-600/10 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white text-xs font-bold mb-6">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Fortuno Pro ile Daha Hızlı Büyüyün
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Hibe Başvurularında{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Rekabet Avantajı
            </span>{' '}
            Kazanın
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
            Yapay zeka destekli analizler, otomatik belge taslakları ve akıllı deadline bildirimleriyle hibe başvurularınızda başarı oranınızı artırın.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { value: '%3x', label: 'Daha Yüksek Başarı Oranı' },
              { value: '2.400+', label: 'Pro Kullanıcı' },
              { value: '₺85M+', label: 'Toplam Kazanılan Hibe' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FATURALAMA TOGGLE ─────────────────────────────────────────── */}
      <div className="flex justify-center mb-10">
        <div className={`flex items-center rounded-2xl border p-1 gap-1 ${dark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}>
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${billing === 'monthly' ? 'bg-white text-slate-800 shadow-md' : sub}`}
          >
            Aylık
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-white text-slate-800 shadow-md' : sub}`}
          >
            Yıllık
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">%44 indirim</span>
          </button>
        </div>
      </div>

      {/* ── FİYATLANDIRMA KARTLARI ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {PLANS.map((plan) => {
          const isPopular = plan.id === 'pro';
          const currentPrice = billing === 'yearly' ? plan.priceYear : plan.price;
          const isCurrentPlan = plan.id === 'free' && !isPro || plan.id === 'pro' && isPro;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border-2 transition-all duration-300 overflow-hidden
                ${isPopular
                  ? 'border-purple-500 shadow-2xl shadow-purple-500/25 scale-105'
                  : dark ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'
                }
                ${dark ? 'bg-[#1e2840]' : 'bg-white'}
              `}
            >
              {/* Popüler rozet */}
              {plan.tag && (
                <div className={`text-center py-2 text-xs font-black text-white bg-gradient-to-r ${plan.grad}`}>
                  {plan.id === 'pro' ? '⭐ ' + plan.tag : plan.tag}
                </div>
              )}

              {/* Gradient top bar */}
              {isPopular && (
                <div className={`h-1 w-full bg-gradient-to-r ${plan.grad}`} />
              )}

              <div className="p-7">
                {/* Plan başlığı */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.grad} flex items-center justify-center text-2xl shadow-lg`}>
                    {plan.emoji}
                  </div>
                  <div>
                    <p className={`font-black text-xl ${text}`}>{plan.name}</p>
                    {isCurrentPlan && (
                      <span className="text-[10px] font-black text-emerald-500">✓ Mevcut Planınız</span>
                    )}
                  </div>
                </div>

                {/* Fiyat */}
                <div className="mb-6">
                  {plan.price === null ? (
                    <p className={`text-3xl font-black ${text}`}>Özel Teklif</p>
                  ) : plan.price === 0 ? (
                    <p className={`text-3xl font-black ${text}`}>Ücretsiz</p>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black ${text}`}>
                          ₺{billing === 'yearly' ? Math.round(plan.priceYear / 12) : plan.price}
                        </span>
                        <span className={`text-sm font-bold ${sub}`}>/ay</span>
                      </div>
                      {billing === 'yearly' && (
                        <p className="text-xs text-emerald-500 font-bold mt-0.5">
                          Yıllık ₺{plan.priceYear} — ₺{(plan.price * 12) - plan.priceYear} tasarruf!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Butonu */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrentPlan && plan.id === 'free' || activePlan === plan.id}
                  className={`w-full py-3.5 rounded-xl font-black text-sm transition-all mb-6
                    ${plan.id === 'free'
                      ? dark ? 'bg-slate-700 text-slate-300 cursor-default' : 'bg-slate-100 text-slate-500 cursor-default'
                      : `bg-gradient-to-r ${plan.grad} text-white shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-95`
                    }
                    ${activePlan === plan.id ? 'opacity-70' : ''}
                  `}
                >
                  {activePlan === plan.id ? '⏳ İşleniyor...' :
                   isCurrentPlan && plan.id === 'free' ? '✓ Mevcut Plan' :
                   plan.id === 'free' ? 'Ücretsiz Başla' :
                   plan.id === 'kurumsal' ? '📧 Teklif Al' :
                   isPro ? '✓ Aktif Plan' : '⚡ Pro\'ya Geç'}
                </button>

                {/* Özellikler */}
                <div className="space-y-2.5">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className={`flex items-start gap-2.5 text-xs font-medium ${f.ok ? text : sub + ' opacity-50'}`}>
                      {f.ok
                        ? <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        : <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      }
                      {f.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PRO ÖZELLİKLER DETAY ─────────────────────────────────────── */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-4 ${dark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
            <Zap className="w-3.5 h-3.5" /> Pro Özellikler
          </div>
          <h2 className={`text-3xl font-black mb-3 ${text}`}>Pro ile Neler Kazanırsınız?</h2>
          <p className={`max-w-xl mx-auto text-sm ${sub}`}>
            Yüzlerce kadın girişimci, Fortuno Pro sayesinde hibe başvurularını daha hızlı ve başarılı tamamladı.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRO_FEATURES.map((f, i) => (
            <div key={i} className={`${cardBase} border rounded-2xl p-5 hover:shadow-lg transition-all group`}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg"
                style={{ background: f.color }}
              >
                {f.icon}
              </div>
              <h3 className={`font-black text-base mb-2 ${text}`}>{f.title}</h3>
              <p className={`text-xs leading-relaxed ${sub}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-black mb-3 ${text}`}>Başarı Hikayeleri</h2>
          <p className={`text-sm ${sub}`}>Pro kullanıcılarımızın deneyimleri</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`${cardBase} border rounded-2xl p-6 hover:shadow-lg transition-all`}>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.stars)].map((_, si) => (
                  <Star key={si} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className={`text-sm leading-relaxed mb-4 italic ${sub}`}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl">
                  {t.avatar}
                </div>
                <div>
                  <p className={`font-black text-sm ${text}`}>{t.name}</p>
                  <p className={`text-[10px] ${sub}`}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SSS ──────────────────────────────────────────────────────── */}
      <div className="mb-16 max-w-2xl mx-auto">
        <h2 className={`text-2xl font-black mb-6 text-center ${text}`}>Sıkça Sorulan Sorular</h2>
        {[
          {
            q: 'İstediğim zaman iptal edebilir miyim?',
            a: 'Evet, aboneliğinizi dilediğiniz zaman iptal edebilirsiniz. İptal ettiğinizde, ödeme döneminizin sonuna kadar Pro özelliklerine erişmeye devam edersiniz.'
          },
          {
            q: 'Ödeme yöntemleri nelerdir?',
            a: 'Kredi kartı, banka kartı ve havale/EFT ile ödeme kabul ediyoruz. Yıllık planda fatura kesilir.'
          },
          {
            q: 'Pro\'da oluşturduğum belgeler gerçekten işe yarıyor mu?',
            a: 'FortunoAI, KOSGEB ve TÜBİTAK başvuru formatlarına uygun taslaklar hazırlar. Ancak nihai belgeyi kendi bilgilerinizle düzenlemeniz ve bir danışmana inceletmenizi öneririz.'
          },
          {
            q: 'Ücretsiz planda ne kadar süre kalabilirim?',
            a: 'Ücretsiz plan süre sınırı olmaksızın kullanılabilir. Aylık 3 arama hakkınız her ay sıfırlanır.'
          },
        ].map((faq, i) => (
          <details key={i} className={`${cardBase} border rounded-2xl mb-3 overflow-hidden group`}>
            <summary className={`flex items-center justify-between p-5 cursor-pointer font-bold text-sm ${text} list-none`}>
              {faq.q}
              <ChevronRight className={`w-4 h-4 ${sub} group-open:rotate-90 transition-transform`} />
            </summary>
            <div className={`px-5 pb-5 text-sm leading-relaxed ${sub}`}>{faq.a}</div>
          </details>
        ))}
      </div>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #ec4899 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-10 -translate-x-10" />
        </div>
        <div className="relative z-10 px-8 py-14 text-center text-white">
          <Crown className="w-12 h-12 mx-auto mb-4 text-amber-400" />
          <h2 className="text-3xl font-black mb-3">Hemen Pro'ya Geçin</h2>
          <p className="text-purple-200 max-w-lg mx-auto text-sm mb-8">
            İlk 14 gün para iade garantisi. Memnun kalmazsanız, hiçbir soru sormadan ücretinizi iade ediyoruz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => handleSelectPlan('pro')}
              className="bg-white text-purple-700 px-8 py-4 rounded-2xl font-black text-base hover:bg-purple-50 transition shadow-xl flex items-center gap-2 justify-center"
            >
              <Zap className="w-5 h-5" /> ₺{billing === 'yearly' ? Math.round(999/12) : 149}/ay ile Başla
            </button>
            <button
              onClick={() => setBilling(b => b === 'yearly' ? 'monthly' : 'yearly')}
              className="border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition flex items-center gap-2 justify-center"
            >
              <Infinity className="w-4 h-4" /> Yıllık ₺999 — %44 İndirim
            </button>
          </div>
          <p className="text-purple-300 text-xs mt-4">💳 Kredi kartı gerekli değil • İptal kolayca yapılır</p>
        </div>
      </div>
    </div>
  );
}
