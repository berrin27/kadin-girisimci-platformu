import React, { useMemo, useState } from 'react';
import { GraduationCap, ExternalLink, ChevronDown, Monitor, Users, Globe, BookOpen, CheckCircle2, Star, Clock, Award, TrendingDown, Wallet, AlertTriangle, ArrowRight, ShieldCheck, Gauge, Layers3, Sparkles, Download } from 'lucide-react';

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

const CASH_SCENARIOS = [
  { id: 'normal', label: 'Normal Dönem', rawMaterialChange: 0, receivablesDelay: 0, revenueDrop: 0, impactText: 'Standart operasyon ve düzenli tahsilat' },
  { id: 'hammadde', label: '%20 Hammadde Zammı', rawMaterialChange: 0.2, receivablesDelay: 0, revenueDrop: 0, impactText: 'Girdi maliyetleri yükseliyor' },
  { id: 'tahsilat', label: '30 Gün Gecikme', rawMaterialChange: 0, receivablesDelay: 30, revenueDrop: 0, impactText: 'Tahsilatta gecikme ve likidite baskısı' },
  { id: 'satıs', label: '%15 Satış Düşüşü', rawMaterialChange: 0, receivablesDelay: 0, revenueDrop: 0.15, impactText: 'Siparişlerde ve gelirde daralma' },
  { id: 'worst', label: 'En Kötü Senaryo', rawMaterialChange: 0.2, receivablesDelay: 30, revenueDrop: 0.15, impactText: 'Tüm risk dinamikleri aynı anda' },
];

const SIM_STEPS = [
  { id: 1, label: 'Profiling' },
  { id: 2, label: 'Dashboard' },
  { id: 3, label: 'Stres Testi' },
  { id: 4, label: 'Reçete' },
  { id: 5, label: 'Aksiyon' },
];

export default function EgitimPortali({ dark }) {
  const [acikId, setAcikId] = useState(null);
  const [simStep, setSimStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scenario, setScenario] = useState('worst');
  const [cashForm, setCashForm] = useState({
    availableCash: 90000,
    revenue: 420000,
    fixedCosts: 220000,
    stockCost: 120000,
    payroll: 85000,
    receivablesDays: 21,
    kvdPayments: 42000,
    seasonalBonus: 16000,
    stockTurnover: 45,
  });

  const card = dark ? 'bg-[#1c2333] border-slate-700' : 'bg-white border-slate-200';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const modul = dark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200';
  const inputClass = dark
    ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-[#F3D5D8]'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-[#F3D5D8]';

  const selectedScenario = useMemo(
    () => CASH_SCENARIOS.find(item => item.id === scenario) || CASH_SCENARIOS[4],
    [scenario]
  );

  const formatNumber = value => new Intl.NumberFormat('tr-TR').format(Math.round(value));

  const analysis = useMemo(() => {
    const startingCash = Number(cashForm.availableCash || 0);
    const revenue = Number(cashForm.revenue || 0);
    const fixedCosts = Number(cashForm.fixedCosts || 0);
    const stockCost = Number(cashForm.stockCost || 0);
    const payroll = Number(cashForm.payroll || 0);
    const receivablesDays = Number(cashForm.receivablesDays || 0);
    const kvdPayments = Number(cashForm.kvdPayments || 0);
    const seasonalBonus = Number(cashForm.seasonalBonus || 0);
    const stockTurnover = Number(cashForm.stockTurnover || 45);

    const adjustedRevenue = revenue * (1 - selectedScenario.revenueDrop);
    const adjustedStockCost = stockCost * (1 + selectedScenario.rawMaterialChange);
    const delayedCollection = receivablesDays + selectedScenario.receivablesDelay;
    const collectionLoss = adjustedRevenue * (delayedCollection / 90) * 0.12;
    const monthlyOperationalCash = adjustedRevenue - fixedCosts - adjustedStockCost - payroll - kvdPayments - seasonalBonus;
    const cashBuffer = startingCash + monthlyOperationalCash - collectionLoss;

    const monthLabels = ['Ay 1', 'Ay 2', 'Ay 3', 'Ay 4', 'Ay 5', 'Ay 6', 'Ay 7', 'Ay 8', 'Ay 9', 'Ay 10', 'Ay 11', 'Ay 12'];
    const baseSeries = monthLabels.map((_, index) => {
      const seasonalShift = 1 + (index - 5.5) * 0.07;
      return Math.round((startingCash + monthlyOperationalCash * (index + 1) * seasonalShift) - (index * 15000));
    });

    const stressSeries = monthLabels.map((_, index) => {
      let value = baseSeries[index];
      const scenarioPenalty = (selectedScenario.revenueDrop || 0) * adjustedRevenue * 0.35;
      const delayPenalty = (selectedScenario.receivablesDelay || 0) * (index + 1) * 2200;
      const materialPenalty = adjustedStockCost * selectedScenario.rawMaterialChange * (index + 1) * 0.25;
      const stockPenalty = (45 - stockTurnover) * 2000;
      value -= scenarioPenalty + delayPenalty + materialPenalty + stockPenalty;
      return Math.round(value);
    });

    const stressWorst = Math.min(...stressSeries);
    const baseWorst = Math.min(...baseSeries);
    const shortfall = Math.max(0, Math.abs(Math.min(0, stressWorst)));
    const fundingNeed = Math.max(0, shortfall + 25000);
    const riskMonth = stressSeries.findIndex(value => value < 0);
    const monthText = riskMonth >= 0 ? `${riskMonth + 1}. Ay` : 'Risk yok';
    const coverage = startingCash > 0 ? Math.max(0, (cashBuffer / (fixedCosts + payroll + stockCost + kvdPayments + seasonalBonus || 1)) * 100) : 0;

    let recommendation = 'Kasa akışı kararlı görünüyor. Ölçekleme için stok döngüsünü optimize edin.';
    if (stressWorst < 0) {
      recommendation = `Kredi ve hibe kombinasyonunu ${riskMonth + 1}. aydan önce değerlendirin. En az ${formatNumber(fundingNeed)} TL likidite tamponu önerilir.`;
    }

    return {
      baseSeries,
      stressSeries,
      shortfall,
      fundingNeed,
      riskMonth,
      monthText,
      coverage,
      recommendation,
      selectedScenario,
      cashBuffer,
      monthLabels,
      baseWorst,
    };
  }, [cashForm, selectedScenario]);

  const handleDownloadReport = () => {
    const reportText = [
      'Nakit Risk ve Duyarlılık Analizi Raporu',
      '====================================',
      `Senaryo: ${analysis.selectedScenario.label}`,
      `Temel Kasa Bakiye: ${formatNumber(cashForm.availableCash)} TL`,
      `Aylık Gelir: ${formatNumber(cashForm.revenue)} TL`,
      `Aylık Gider: ${formatNumber(cashForm.fixedCosts + cashForm.payroll + cashForm.stockCost + cashForm.kvdPayments + cashForm.seasonalBonus)} TL`,
      `En kritik dönem: ${analysis.monthText}`,
      `Öngörülen açık: ${formatNumber(analysis.shortfall)} TL`,
      `Önerilen finansman: ${formatNumber(analysis.fundingNeed)} TL`,
      `Aksiyon: ${analysis.recommendation}`,
    ].join('\n');

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nakit-risk-raporu.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNextStep = () => setSimStep(prev => Math.min(prev + 1, 5));
  const handlePrevStep = () => setSimStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-5xl mx-auto px-4 mt-12 pb-24">

      {/* ── Başlık ─────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${dark ? 'bg-[#2A3544] text-[#F3D5D8]' : 'bg-[#F3D5D8] text-[#4A1525]'}`}>
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
            <div className={`text-2xl font-black ${dark ? 'text-[#F3D5D8]' : 'text-[#4A1525]'}`}>{s.deger}</div>
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

      {/* ── Gelişmiş Nakit Akışı Simülatörü ───────────────────────────────────── */}
      <div className={`mt-12 rounded-3xl border shadow-xl overflow-hidden ${card}`}>
        <div className="px-6 py-5 border-b border-slate-200/20 bg-[#F8F3F4]">
          <div className="flex items-center gap-2 text-[#1E293B] font-black text-sm uppercase tracking-[0.14em]">
            <Wallet className="w-4 h-4" /> Nakit Akışı ve Stres Testi Simülatörü
          </div>
          <h3 className={`mt-2 text-2xl font-black ${text}`}>Kasam ne zaman boşalacak? Açığımı nasıl kapatmalıyım?</h3>
        </div>

        <div className="p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            {SIM_STEPS.map(step => (
              <button
                key={step.id}
                onClick={() => setSimStep(step.id)}
                className={`px-3 py-2 rounded-full border text-xs font-black transition ${simStep === step.id ? 'bg-[#1E293B] text-white border-transparent' : dark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
              >
                {step.id}. {step.label}
              </button>
            ))}
          </div>

          {simStep === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                <label className={`block text-xs font-bold uppercase tracking-[0.12em] ${sub}`}>
                  Mevcut kasa bakiyesi (TL)
                  <input
                    type="number"
                    value={cashForm.availableCash}
                    onChange={e => setCashForm(prev => ({ ...prev, availableCash: Number(e.target.value) }))}
                    className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${inputClass}`}
                  />
                </label>
              </div>

              <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                <label className={`block text-xs font-bold uppercase tracking-[0.12em] ${sub}`}>
                  Aylık sabit giderler (TL)
                  <input
                    type="number"
                    value={cashForm.fixedCosts}
                    onChange={e => setCashForm(prev => ({ ...prev, fixedCosts: Number(e.target.value) }))}
                    className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${inputClass}`}
                  />
                </label>
              </div>

              <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                <label className={`block text-xs font-bold uppercase tracking-[0.12em] ${sub}`}>
                  Beklenen aylık gelir (TL)
                  <input
                    type="number"
                    value={cashForm.revenue}
                    onChange={e => setCashForm(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                    className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${inputClass}`}
                  />
                </label>
              </div>

              <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                <label className={`block text-xs font-bold uppercase tracking-[0.12em] ${sub}`}>
                  Ortalama alacak vadesi (gün)
                  <input
                    type="number"
                    value={cashForm.receivablesDays}
                    onChange={e => setCashForm(prev => ({ ...prev, receivablesDays: Number(e.target.value) }))}
                    className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${inputClass}`}
                  />
                </label>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-bold ${dark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  {showAdvanced ? 'Gelişmiş Ayarları Gizle' : 'Gelişmiş Ayarlar'}
                </button>
              </div>

              {showAdvanced && (
                <>
                  <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                    <label className={`block text-xs font-bold uppercase tracking-[0.12em] ${sub}`}>
                      Stok devir hızı (gün)
                      <input
                        type="number"
                        value={cashForm.stockTurnover}
                        onChange={e => setCashForm(prev => ({ ...prev, stockTurnover: Number(e.target.value) }))}
                        className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${inputClass}`}
                      />
                    </label>
                  </div>

                  <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                    <label className={`block text-xs font-bold uppercase tracking-[0.12em] ${sub}`}>
                      KDV / dönemsel ödemeler (TL)
                      <input
                        type="number"
                        value={cashForm.kvdPayments}
                        onChange={e => setCashForm(prev => ({ ...prev, kvdPayments: Number(e.target.value) }))}
                        className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${inputClass}`}
                      />
                    </label>
                  </div>

                  <div className={`md:col-span-2 rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                    <label className={`block text-xs font-bold uppercase tracking-[0.12em] ${sub}`}>
                      Dönemsel prim / ani harcama (TL)
                      <input
                        type="number"
                        value={cashForm.seasonalBonus}
                        onChange={e => setCashForm(prev => ({ ...prev, seasonalBonus: Number(e.target.value) }))}
                        className={`mt-2 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${inputClass}`}
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {simStep === 2 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className={`rounded-xl border p-3 ${dark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white'}`}>
                  <div className={`text-[10px] uppercase tracking-[0.12em] ${sub}`}>Kasa Dengesi</div>
                  <div className="mt-2 text-xl font-black text-emerald-500">{formatNumber(analysis.cashBuffer)} TL</div>
                </div>
                <div className={`rounded-xl border p-3 ${dark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white'}`}>
                  <div className={`text-[10px] uppercase tracking-[0.12em] ${sub}`}>En Kritik Ay</div>
                  <div className="mt-2 text-xl font-black text-amber-500">{analysis.monthText}</div>
                </div>
                <div className={`rounded-xl border p-3 ${dark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white'}`}>
                  <div className={`text-[10px] uppercase tracking-[0.12em] ${sub}`}>Risk Oranı</div>
                  <div className="mt-2 text-xl font-black text-rose-500">{analysis.coverage.toFixed(0)}%</div>
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between text-[11px] uppercase tracking-[0.12em] mb-3 text-slate-500">
                  <span>Mevcut Durum</span>
                  <span>Stres Testi</span>
                </div>
                <div className="flex items-end gap-3 h-56">
                  {analysis.baseSeries.map((value, index) => {
                    const stressValue = analysis.stressSeries[index];
                    const maxAbsValue = Math.max(...analysis.baseSeries.map(Math.abs), ...analysis.stressSeries.map(Math.abs), 1);
                    const baseHeight = (Math.abs(value) / maxAbsValue) * 100;
                    const stressHeight = (Math.abs(stressValue) / maxAbsValue) * 100;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full h-36 flex items-end justify-center gap-1">
                          <div
                            className={`w-2 rounded-t-md ${value >= 0 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ height: `${Math.max(baseHeight, 10)}%` }}
                            title={`Mevcut: ${formatNumber(value)} TL`}
                          />
                          <div
                            className={`w-2 rounded-t-md ${stressValue >= 0 ? 'bg-violet-500' : 'bg-rose-500'}`}
                            style={{ height: `${Math.max(stressHeight, 10)}%` }}
                            title={`Stres: ${formatNumber(stressValue)} TL`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{analysis.monthLabels[index].split(' ')[1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {simStep === 3 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CASH_SCENARIOS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setScenario(item.id)}
                    className={`rounded-2xl border p-4 text-left transition ${scenario === item.id ? 'border-[#1E293B] bg-[#F3D5D8]/15' : dark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="text-sm font-black mb-1">{item.label}</div>
                    <div className={`text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{item.impactText}</div>
                  </button>
                ))}
              </div>

              <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2 text-amber-500 font-black text-sm uppercase tracking-[0.12em]">
                  <ShieldCheck className="w-4 h-4" /> Stres Testi Özeti
                </div>
                <p className={`mt-3 text-sm leading-relaxed ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {analysis.selectedScenario.label} senaryosunda en düşük bakiye {formatNumber(Math.min(...analysis.stressSeries))} TL seviyesine iner. Bu durumda {analysis.monthText} dönemi için likidite planlaması şarttır.
                </p>
              </div>
            </div>
          )}

          {simStep === 4 && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-[0.12em]">
                  <AlertTriangle className="w-4 h-4" /> Nakit Açığı
                </div>
                <div className="mt-3 text-3xl font-black text-rose-500">{formatNumber(analysis.shortfall)} TL</div>
                <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Öngörülen en sert dönemdeki açık tutarı.</p>
              </div>

              <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-2 text-violet-500 font-black text-xs uppercase tracking-[0.12em]">
                  <Gauge className="w-4 h-4" /> Finansman İhtiyacı
                </div>
                <div className="mt-3 text-3xl font-black text-violet-500">{formatNumber(analysis.fundingNeed)} TL</div>
                <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Kredi veya hibe ile öncelikle kapatılması gereken tutar.</p>
              </div>

              <div className={`rounded-2xl border p-4 ${dark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-[0.12em]">
                  <Layers3 className="w-4 h-4" /> Aksiyon Reçetesi
                </div>
                <div className="mt-3 text-base font-bold text-emerald-500">{analysis.selectedScenario.label}</div>
                <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{analysis.recommendation}</p>
              </div>
            </div>
          )}

          {simStep === 5 && (
            <div className="space-y-5">
              <div className={`rounded-2xl border p-5 ${dark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2 text-[#1E293B] font-black text-sm uppercase tracking-[0.12em]">
                  <Sparkles className="w-4 h-4" /> Eylem Havuzu
                </div>
                <p className={`text-base leading-relaxed ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <strong>{analysis.monthText}</strong> döneminde yaklaşık <strong>{formatNumber(analysis.fundingNeed)} TL</strong> likidite açığı öngörülüyor. En uygun geçiş: <strong>3. Ayın Sonunda 36 Ay Vadeli İşletme Kredisi</strong> veya <strong>KOSGEB Hibe Başvurusu</strong> ile finansal boşluğu kapatmak.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-2 bg-[#1E293B] text-white px-5 py-3 rounded-xl font-black shadow-lg"
                >
                  <Download className="w-4 h-4" /> Nakit Risk Raporu İndir
                </button>
                <button
                  className="inline-flex items-center gap-2 bg-slate-700 text-white px-5 py-3 rounded-xl font-black"
                >
                  <ArrowRight className="w-4 h-4" /> Bu Kredi İçin Başvuru Dosyası Oluştur
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between gap-3">
            <button
              onClick={handlePrevStep}
              disabled={simStep === 1}
              className={`px-4 py-2 rounded-xl font-bold ${simStep === 1 ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-700 text-white'}`}
            >
              Geri
            </button>
            <button
              onClick={handleNextStep}
              disabled={simStep === 5}
              className="bg-[#1E293B] text-white px-5 py-2.5 rounded-xl font-bold"
            >
              {simStep === 5 ? 'Tamamlandı' : 'Sonraki Adım'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Alt Motivasyon Alanı ──────────────────────────────────── */}
      <div className="mt-10 rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b)' }}>
        <div className="p-8 text-center text-white">
          <div className="text-4xl mb-3">🎓</div>
          <h3 className="text-2xl font-black mb-2">Öğren, Başvur, Kazan!</h3>
          <p className="text-slate-200 text-sm max-w-xl mx-auto mb-5">
            KOSGEB eğitimini tamamlayan kadın girişimciler otomatik olarak 300.000 TL
            hibe başvurusuna hak kazanıyor. İlk adım eğitim, ikinci adım hibe!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://lms.kosgeb.gov.tr"
              target="_blank"
              rel="noreferrer"
              className="bg-[#F3D5D8] text-[#4A1525] font-black px-6 py-2.5 rounded-xl hover:bg-[#eed0d5] transition shadow-lg text-sm flex items-center gap-2"
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
