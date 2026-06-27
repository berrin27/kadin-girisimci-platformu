import React, { useState } from 'react';
import { GraduationCap, ExternalLink, ChevronDown, Monitor, Users, Globe, BookOpen, CheckCircle2, Star, Clock, Award } from 'lucide-react';

// ── Eğitim Programları Verisi ──────────────────────────────────────────────────
const EGITIMLER = [
  {
    id: 'kosgeb-egitim',
    sira: 'A',
    kurum: 'KOSGEB',
    baslik: 'KOSGEB Online Girişimcilik Eğitimleri',
    tur: 'Sertifikalı & Tamamen Ücretsiz',
    turIcon: <Monitor className="w-4 h-4" />,
    turRenk: '#2563eb',
    link: 'https://lms.kosgeb.gov.tr',
    ozet: 'KOSGEB\'in 300.000 TL kuruluş hibesini alabilmek için zorunlu olan resmi eğitim platformu. Geleneksel ve İleri düzey iki modülden oluşur.',
    grad: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    rozet: 'Zorunlu & Ücretsiz',
    rozetRenk: '#1d4ed8',
    moduller: [
      {
        ad: 'Geleneksel Girişimci Eğitimi',
        aciklama: 'İş kurma süreçleri, yönetim ve pazarlama temelleri. KOSGEB\'in 300.000 TL\'lik kuruluş hibesini almak için bu eğitimi tamamlamak zorunludur.',
        sure: '~40 saat',
        sertifika: true,
      },
      {
        ad: 'İleri Girişimci Eğitimi',
        aciklama: 'İmalat, yazılım ve Ar-Ge tabanlı iş kuracak kadınların 2.000.000 TL\'ye varan desteklere başvurabilmesi için gerekli ileri düzey modül.',
        sure: '~60 saat',
        sertifika: true,
      },
    ],
  },
  {
    id: 'halkbank-akademi',
    sira: 'B',
    kurum: 'Halkbank Akademi',
    baslik: 'Halkbank Kadın Girişimci Akademisi',
    tur: 'Hibrit (Online & Fiziki Buluşmalar)',
    turIcon: <Users className="w-4 h-4" />,
    turRenk: '#d97706',
    link: 'https://www.halkbankkobi.com.tr',
    ozet: 'Halkbank Kadın Kredisi kullanan girişimcilerin işlerini batırmaması için tasarlanmış özel bir finansal mentörlük programı.',
    grad: 'linear-gradient(135deg, #b45309, #d97706)',
    rozet: 'Finansal Mentörlük',
    rozetRenk: '#b45309',
    moduller: [
      {
        ad: 'Temel İşletme Yönetimi & Finansal Okuryazarlık',
        aciklama: 'Nakit akışı kontrolü, bütçe planlaması ve muhasebe temelleri. Kredi kullanan her girişimci için hayati bilgiler.',
        sure: 'Esnek',
        sertifika: false,
      },
      {
        ad: 'Dijital Pazarlama & E-Ticaret Süreçleri',
        aciklama: 'Markalaşma, sosyal medya yönetimi ve online satış kanallarını kurma. Müşteri kitlesini büyütmek için pratik rehber.',
        sure: 'Esnek',
        sertifika: false,
      },
    ],
  },
  {
    id: 'tobb-akademi',
    sira: 'C',
    kurum: 'TOBB',
    baslik: 'TOBB "Türkiye\'nin Girişimci Kadın Gücü" Akademisi',
    tur: 'Online / Webinarlar & Mentorluk',
    turIcon: <Star className="w-4 h-4" />,
    turRenk: '#7c3aed',
    link: 'https://girisimcikadingucu.tobb.org.tr',
    ozet: 'Başarılı kadın girişimcilerden birebir mentorluk alma fırsatı, uluslararası ağlara entegrasyon ve teknolojik dönüşüm eğitimleri.',
    grad: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
    rozet: 'Uluslararası Ağ',
    rozetRenk: '#6d28d9',
    moduller: [
      {
        ad: 'Birebir Mentorluk Programı',
        aciklama: 'Sektörünüzde başarılı kadın girişimcilerle eşleştirme ve düzenli birebir mentörlük seansları. Ağ genişletme fırsatı.',
        sure: '6 ay',
        sertifika: false,
      },
      {
        ad: 'Sürdürülebilir Ticaret & Teknolojik Dönüşüm',
        aciklama: 'Yeşil mutabakat uyumu, uluslararası ağlara entegrasyon ve teknolojik dönüşüm stratejileri. Global rekabete hazırlık.',
        sure: 'Dönemsel',
        sertifika: true,
      },
    ],
  },
  {
    id: 'kagider-ups',
    sira: 'D',
    kurum: 'KAGİDER & UPS',
    baslik: '"Sınırları Aşan Kadınlar" Programı',
    tur: 'E-İhracat & Global Ticaret Eğitimi',
    turIcon: <Globe className="w-4 h-4" />,
    turRenk: '#059669',
    link: 'https://www.kagider.org',
    ozet: 'KAGİDER & UPS ortaklığıyla kadın üreticilerin ürünlerini Amazon, Etsy gibi global pazarlara nasıl açacağını öğreten pratik eğitim.',
    grad: 'linear-gradient(135deg, #047857, #059669)',
    rozet: 'Global Pazar',
    rozetRenk: '#047857',
    moduller: [
      {
        ad: 'Global Pazaryeri Yönetimi',
        aciklama: 'Amazon, Etsy ve Alibaba gibi uluslararası platformlarda ürün listeleme, fiyatlandırma ve satış optimizasyonu.',
        sure: '3 gün yoğun',
        sertifika: true,
      },
      {
        ad: 'Lojistik, Gümrükleme & E-İhracat Mevzuatı',
        aciklama: 'Uluslararası kargo süreçleri, gümrük beyannamesi, ihracat teşvikleri ve yasal mevzuata dair kapsamlı rehber.',
        sure: '2 gün yoğun',
        sertifika: true,
      },
    ],
  },
];

// ── İstatistik Kartları ────────────────────────────────────────────────────────
const istatistikler = [
  { deger: '4', label: 'Resmi Program', ikon: '🎓' },
  { deger: '8', label: 'Eğitim Modülü', ikon: '📚' },
  { deger: '%100', label: 'Ücretsiz', ikon: '💜' },
  { deger: '2M TL', label: 'Hibe Kapısı', ikon: '🚀' },
];

export default function EgitimPortali({ dark }) {
  const [acikId, setAcikId] = useState(null);

  const card = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const modul = dark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200';

  return (
    <div className="max-w-5xl mx-auto px-4 mt-12 pb-24">

      {/* ── Başlık ─────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${dark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
          <GraduationCap className="w-4 h-4" /> Kadın Girişimci Eğitim Portalı
        </div>
        <h2 className={`text-4xl font-black mb-3 ${text}`}>
          Bilgi = Güç = Para 💜
        </h2>
        <p className={`max-w-2xl mx-auto text-base ${sub}`}>
          Finansal ve operasyonel okuryazarlığınızı artıracak, hibe başvurularında öncelik kazandıracak
          <strong className={dark ? ' text-slate-200' : ' text-slate-700'}> ücretsiz ve resmi programlar</strong>.
        </p>
      </div>

      {/* ── İstatistik Şeridi ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {istatistikler.map((s, i) => (
          <div key={i} className={`${card} border rounded-2xl p-4 text-center shadow`}>
            <div className="text-2xl mb-1">{s.ikon}</div>
            <div className={`text-2xl font-black ${dark ? 'text-purple-300' : 'text-purple-700'}`}>{s.deger}</div>
            <div className={`text-xs font-semibold ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Önemli Not ────────────────────────────────────────────── */}
      <div className={`mb-8 p-4 rounded-2xl border-l-4 border-blue-500 ${dark ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50 border-blue-500'}`}>
        <p className={`text-sm font-semibold ${dark ? 'text-blue-300' : 'text-blue-800'}`}>
          💡 <strong>Önemli:</strong> KOSGEB'in 300.000 TL geri ödemesiz hibe desteğine başvurmak için
          önce KOSGEB Geleneksel Girişimci Eğitimi'ni tamamlamak <strong>zorunludur</strong>.
          Aşağıdan doğrudan platforma ulaşabilirsiniz.
        </p>
      </div>

      {/* ── Program Kartları ──────────────────────────────────────── */}
      <div className="space-y-5">
        {EGITIMLER.map(eg => {
          const acik = acikId === eg.id;
          return (
            <div
              key={eg.id}
              className={`${card} border rounded-2xl shadow-lg overflow-hidden transition-all duration-300`}
              style={{ boxShadow: acik ? `0 0 0 2px ${eg.turRenk}55, 0 8px 32px rgba(0,0,0,0.12)` : undefined }}
            >
              {/* ── Kart Başlığı ── */}
              <button
                className="w-full text-left p-5 flex items-start gap-4"
                onClick={() => setAcikId(acik ? null : eg.id)}
              >
                {/* Sol — Sıra harfi */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg"
                  style={{ background: eg.grad }}
                >
                  {eg.sira}
                </div>

                {/* Orta — Bilgiler */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-black px-2.5 py-1 rounded-full text-white"
                      style={{ background: eg.rozetRenk }}
                    >
                      {eg.rozet}
                    </span>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {eg.turIcon} {eg.tur}
                    </span>
                  </div>
                  <h3 className={`font-black text-base md:text-lg leading-snug ${text}`}>{eg.baslik}</h3>
                  <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${sub}`}>{eg.ozet}</p>
                </div>

                {/* Sağ — Chevron */}
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-transform duration-300 mt-1 ${sub} ${acik ? 'rotate-180' : ''}`}
                />
              </button>

              {/* ── Açılır Detay ── */}
              <div
                style={{
                  maxHeight: acik ? '600px' : '0',
                  opacity: acik ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease, opacity 0.3s ease',
                }}
              >
                <div className={`px-5 pb-5 pt-1 border-t ${dark ? 'border-slate-700' : 'border-slate-100'}`}>

                  {/* Modüller */}
                  <h4 className={`text-xs font-black uppercase tracking-widest mb-3 mt-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    📖 Eğitim Modülleri
                  </h4>
                  <div className="space-y-3 mb-5">
                    {eg.moduller.map((m, mi) => (
                      <div key={mi} className={`${modul} border rounded-xl p-4`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`font-bold text-sm ${text}`}>{m.ad}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {m.sertifika && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${dark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
                                <Award className="w-3 h-3" /> Sertifika
                              </span>
                            )}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                              <Clock className="w-3 h-3" /> {m.sure}
                            </span>
                          </div>
                        </div>
                        <p className={`text-xs leading-relaxed ${sub}`}>{m.aciklama}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bağlantı Butonu */}
                  <a
                    href={eg.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg hover:opacity-90 transition"
                    style={{ background: eg.grad }}
                  >
                    <BookOpen className="w-4 h-4" />
                    Programa Git
                    <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Alt Motivasyon Alanı ──────────────────────────────────── */}
      <div className="mt-10 rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b)' }}>
        <div className="p-8 text-center text-white">
          <div className="text-4xl mb-3">🎓</div>
          <h3 className="text-2xl font-black mb-2">Öğren, Başvur, Kazan!</h3>
          <p className="text-purple-100 text-sm max-w-xl mx-auto mb-5">
            KOSGEB eğitimini tamamlayan kadın girişimciler otomatik olarak 300.000 TL
            hibe başvurusuna hak kazanıyor. İlk adım eğitim, ikinci adım hibe!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://lms.kosgeb.gov.tr"
              target="_blank"
              rel="noreferrer"
              className="bg-white text-purple-700 font-black px-6 py-2.5 rounded-xl hover:bg-purple-50 transition shadow-lg text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              KOSGEB Eğitimine Başla
            </a>
            <a
              href="https://girisimcikadingucu.tobb.org.tr"
              target="_blank"
              rel="noreferrer"
              className="bg-white/20 backdrop-blur text-white font-bold px-6 py-2.5 rounded-xl hover:bg-white/30 transition text-sm border border-white/30"
            >
              TOBB Akademi'yi İncele
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
