import React, { useState } from 'react';
import { Globe, ExternalLink, ChevronDown, Plane, Building2, Award, TrendingUp, DollarSign, ShieldCheck, MapPin, Star } from 'lucide-react';

// ── Fuar Destekleri Verisi ──────────────────────────────────────────────────
const FUARLAR = [
  {
    id: 'ticaret-fuar',
    sira: 'A',
    kurum: 'Ticaret Bakanlığı',
    baslik: 'Yurt Dışı Fuar Desteği (5973 Sayılı Karar)',
    tur: '%50-75 Hibe Desteği',
    turIcon: <Globe className="w-4 h-4" />,
    turRenk: '#0ea5e9',
    link: 'https://ticaret.gov.tr',
    ozet: 'Yurt dışı fuarlara katılımda stand kirası, tasarım, nakliye ve seyahat giderlerinizin %50-75\'ini devlet karşılıyor.',
    grad: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
    rozet: 'Devlet Hibesi',
    rozetRenk: '#0284c7',
    detaylar: [
      {
        baslik: 'Destek Oranı',
        icerik: '%50 ila %70 hibe. Bakanlıkça belirlenen "Hedef Ülkeler" ve "Hedef Sektörler" için bu oran %75\'e kadar yükselir.',
        ikon: '📊',
      },
      {
        baslik: 'Kapsanan Giderler',
        icerik: 'Stand alanı yer kirası, stand tasarımı/kurulumu, ürünlerin nakliye giderleri ve firmanın 2 temsilcisinin ekonomi sınıfı uçak bileti ile konaklama harcamaları.',
        ikon: '✈️',
      },
      {
        baslik: '2026 Teşvik Limitleri',
        icerik: 'Sektörel Nitelikli Yurt Dışı Fuar: Azami 952.853 TL hibe. Prestijli Yurt Dışı Fuar: Azami 2.860.670 TL hibe.',
        ikon: '💰',
      },
    ],
  },
  {
    id: 'kosgeb-yurtdisi',
    sira: 'B',
    kurum: 'KOSGEB',
    baslik: 'Yurt Dışı Pazar Destek Programı (Kadın Girişimci İlavesiyle)',
    tur: '%70 Geri Ödemesiz Hibe',
    turIcon: <Award className="w-4 h-4" />,
    turRenk: '#8b5cf6',
    link: 'https://www.kosgeb.gov.tr',
    ozet: 'Kadın girişimcilere özel 150.000 TL ek limitli, toplam 450.000 TL\'ye varan fuar ve pazar desteği!',
    grad: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    rozet: 'Kadınlara +150K TL',
    rozetRenk: '#7c3aed',
    detaylar: [
      {
        baslik: 'Destek Oranı',
        icerik: '%70 geri ödemesiz hibe — yurt dışı fuar katılımı ve pazar araştırma seyahatleri için.',
        ikon: '🎯',
      },
      {
        baslik: 'Kadın Girişimci Avantajı',
        icerik: 'Programın genel bütçesi 300.000 TL\'dir ancak girişimcinin kadın olması durumunda bu limite 150.000 TL ek limit ilave edilir. Toplam 450.000 TL!',
        ikon: '💜',
      },
      {
        baslik: 'Kapsam',
        icerik: 'Yurt dışı fuar katılımı, pazar araştırma seyahatleri, stant harcamaları ve tanıtım giderleri.',
        ikon: '🌍',
      },
    ],
  },
  {
    id: 'halkbank-fuar',
    sira: 'C',
    kurum: 'Halkbank',
    baslik: 'Fuar ve Sergilere Katılma Kredisi',
    tur: 'Taksitli İşletme Kredisi',
    turIcon: <Building2 className="w-4 h-4" />,
    turRenk: '#059669',
    link: 'https://www.halkbankkobi.com.tr',
    ozet: 'Fuar katılım giderlerinizi önceden finanse edin — kadın girişimcilere 6 aya kadar ödemesiz dönem.',
    grad: 'linear-gradient(135deg, #047857, #059669)',
    rozet: '6 Ay Ödemesiz',
    rozetRenk: '#047857',
    detaylar: [
      {
        baslik: 'Destek Türü',
        icerik: 'Taksitli veya aylık eşit taksitli işletme kredisi. Azami 24 ay vade.',
        ikon: '🏦',
      },
      {
        baslik: 'Ödemesiz Dönem',
        icerik: 'Aylık eşit taksitli ödemelerde 6 aya kadar anapara ve faiz ödemesiz dönem imkanı. Kadın girişimcilere can suyu olması için tasarlandı.',
        ikon: '⏳',
      },
      {
        baslik: 'Teminat Kolaylığı',
        icerik: 'Teminatı yetersiz olan KOBİ\'ler için Kredi Garanti Fonu (KGF) kefaleti entegrasyonu mevcuttur.',
        ikon: '🛡️',
      },
    ],
  },
  {
    id: 'halkbank-ihracatci',
    sira: 'D',
    kurum: 'Halkbank',
    baslik: '"Büyüyen Kadın İhracatçı" Kredisi (Fuar Odaklı)',
    tur: 'Fuar Odaklı İhracat Kredisi',
    turIcon: <TrendingUp className="w-4 h-4" />,
    turRenk: '#dc2626',
    link: 'https://www.halkbankkobi.com.tr',
    ozet: 'Şirket hissesinin %50\'si kadınlara ait işletmeler için 15 milyon TL\'ye varan prestijli fuar kredisi.',
    grad: 'linear-gradient(135deg, #b91c1c, #dc2626)',
    rozet: '15M TL Limit',
    rozetRenk: '#b91c1c',
    detaylar: [
      {
        baslik: 'Azami Limit',
        icerik: '15.000.000 TL (veya 500.000 EUR karşılığı). 12 veya 24 ay vadeli.',
        ikon: '💎',
      },
      {
        baslik: 'Kimler Başvurabilir',
        icerik: 'Yurt dışındaki prestijli fuarlara katılarak ihracat hacmini artırmak isteyen, şirket hissesinin en az %50\'si kadınlara ait olan işletmeler.',
        ikon: '👑',
      },
      {
        baslik: 'Kullanım Amacı',
        icerik: 'Yurt dışı fuar stant bedelleri, lojistik gümrükleme masrafları, yurt dışı seyahat ve konaklama harcamaları.',
        ikon: '📦',
      },
    ],
  },
];

// ── İstatistik Kartları ────────────────────────────────────────────────────────
const istatistikler = [
  { deger: '4', label: 'Fuar Programı', ikon: '🌍' },
  { deger: '15M₺', label: 'En Yüksek Limit', ikon: '💎' },
  { deger: '%75', label: 'Maks Hibe Oranı', ikon: '📊' },
  { deger: '+150K₺', label: 'Kadın Ek Limiti', ikon: '💜' },
];

export default function FuarDestekleri({ dark }) {
  const [acikId, setAcikId] = useState(null);

  const card = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const detayBg = dark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200';

  return (
    <div className="max-w-5xl mx-auto px-4 mt-12 pb-24">

      {/* ── Başlık ─────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${dark ? 'bg-sky-900/40 text-sky-300' : 'bg-sky-50 text-sky-700'}`}>
          <Plane className="w-4 h-4" /> Fuar & Sergi Teşvikleri
        </div>
        <h2 className={`text-4xl font-black mb-3 ${text}`}>
          Dünyaya Açıl, Devlet Arkanda! 🌍
        </h2>
        <p className={`max-w-2xl mx-auto text-base ${sub}`}>
          Yurt dışı fuarlara katılım masraflarınızın büyük bölümünü devlet karşılıyor.
          <strong className={dark ? ' text-slate-200' : ' text-slate-700'}> Kadın girişimcilere özel ek limitleri</strong> kaçırmayın!
        </p>
      </div>

      {/* ── İstatistik Şeridi ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {istatistikler.map((s, i) => (
          <div key={i} className={`${card} border rounded-2xl p-4 text-center shadow`}>
            <div className="text-2xl mb-1">{s.ikon}</div>
            <div className={`text-2xl font-black ${dark ? 'text-sky-300' : 'text-sky-700'}`}>{s.deger}</div>
            <div className={`text-xs font-semibold ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Önemli Not ────────────────────────────────────────────── */}
      <div className={`mb-8 p-4 rounded-2xl border-l-4 border-purple-500 ${dark ? 'bg-purple-900/20 border-purple-500/50' : 'bg-purple-50 border-purple-500'}`}>
        <p className={`text-sm font-semibold ${dark ? 'text-purple-300' : 'text-purple-800'}`}>
          💜 <strong>Kadın Girişimci Avantajı:</strong> KOSGEB Yurt Dışı Pazar Programı'nda kadın girişimcilere
          <strong> 150.000 TL ek limit</strong> tanınıyor! Genel bütçe 300.000 TL iken kadınlar toplam 450.000 TL'lik destekten faydalanabiliyor.
        </p>
      </div>

      {/* ── Program Kartları ──────────────────────────────────────── */}
      <div className="space-y-5">
        {FUARLAR.map(fuar => {
          const acik = acikId === fuar.id;
          return (
            <div
              key={fuar.id}
              className={`${card} border rounded-2xl shadow-lg overflow-hidden transition-all duration-300`}
              style={{ boxShadow: acik ? `0 0 0 2px ${fuar.turRenk}55, 0 8px 32px rgba(0,0,0,0.12)` : undefined }}
            >
              {/* ── Kart Başlığı ── */}
              <button
                className="w-full text-left p-5 flex items-start gap-4"
                onClick={() => setAcikId(acik ? null : fuar.id)}
              >
                {/* Sol — Sıra harfi */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg"
                  style={{ background: fuar.grad }}
                >
                  {fuar.sira}
                </div>

                {/* Orta — Bilgiler */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-black px-2.5 py-1 rounded-full text-white"
                      style={{ background: fuar.rozetRenk }}
                    >
                      {fuar.rozet}
                    </span>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {fuar.turIcon} {fuar.tur}
                    </span>
                  </div>
                  <h3 className={`font-black text-base md:text-lg leading-snug ${text}`}>{fuar.baslik}</h3>
                  <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${sub}`}>{fuar.ozet}</p>
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

                  {/* Detaylar */}
                  <h4 className={`text-xs font-black uppercase tracking-widest mb-3 mt-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    📋 Program Detayları
                  </h4>
                  <div className="space-y-3 mb-5">
                    {fuar.detaylar.map((d, di) => (
                      <div key={di} className={`${detayBg} border rounded-xl p-4`}>
                        <div className="flex items-start gap-3">
                          <span className="text-xl shrink-0">{d.ikon}</span>
                          <div>
                            <p className={`font-bold text-sm mb-1 ${text}`}>{d.baslik}</p>
                            <p className={`text-xs leading-relaxed ${sub}`}>{d.icerik}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bağlantı Butonu */}
                  <a
                    href={fuar.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg hover:opacity-90 transition"
                    style={{ background: fuar.grad }}
                  >
                    <MapPin className="w-4 h-4" />
                    Resmi Kaynağa Git
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
        style={{ background: 'linear-gradient(135deg, #0284c7, #7c3aed, #dc2626)' }}>
        <div className="p-8 text-center text-white">
          <div className="text-4xl mb-3">✈️</div>
          <h3 className="text-2xl font-black mb-2">Fuarlarda Yerinizi Alın!</h3>
          <p className="text-sky-100 text-sm max-w-xl mx-auto mb-5">
            Devlet desteğiyle yurt dışı fuarlara katılın, ürünlerinizi dünyaya tanıtın.
            Kadın girişimciler KOSGEB'den 150.000 TL ek limit alıyor!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://ticaret.gov.tr"
              target="_blank"
              rel="noreferrer"
              className="bg-white text-sky-700 font-black px-6 py-2.5 rounded-xl hover:bg-sky-50 transition shadow-lg text-sm flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Ticaret Bakanlığı
            </a>
            <a
              href="https://www.kosgeb.gov.tr"
              target="_blank"
              rel="noreferrer"
              className="bg-white/20 backdrop-blur text-white font-bold px-6 py-2.5 rounded-xl hover:bg-white/30 transition text-sm border border-white/30"
            >
              KOSGEB Yurt Dışı Pazar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
