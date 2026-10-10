import React, { useMemo, useState } from 'react';
import { Wallet, AlertTriangle, ArrowRight, ShieldCheck, Gauge, Layers3, Sparkles, Download } from 'lucide-react';

// ── Nakit Akışı Simülatörü ───────────────────────────────────────────────────
// "Kasam ne zaman boşalır?" sorusunu 12 aylık projeksiyonla yanıtlar; zor
// senaryolarda (hammadde zammı, tahsilat gecikmesi, satış düşüşü) açığı ve
// kapatma önerilerini gösterir. (Eğitim sayfasından Araçlar menüsüne taşındı.)

const CASH_SCENARIOS = [
  { id: 'normal', label: 'Normal Dönem', rawMaterialChange: 0, receivablesDelay: 0, revenueDrop: 0, impactText: 'Standart operasyon ve düzenli tahsilat' },
  { id: 'hammadde', label: '%20 Hammadde Zammı', rawMaterialChange: 0.2, receivablesDelay: 0, revenueDrop: 0, impactText: 'Girdi maliyetleri yükseliyor' },
  { id: 'tahsilat', label: '30 Gün Gecikme', rawMaterialChange: 0, receivablesDelay: 30, revenueDrop: 0, impactText: 'Tahsilatta gecikme ve likidite baskısı' },
  { id: 'satıs', label: '%15 Satış Düşüşü', rawMaterialChange: 0, receivablesDelay: 0, revenueDrop: 0.15, impactText: 'Siparişlerde ve gelirde daralma' },
  { id: 'worst', label: 'En Kötü Senaryo', rawMaterialChange: 0.2, receivablesDelay: 30, revenueDrop: 0.15, impactText: 'Tüm risk dinamikleri aynı anda' },
];

const SIM_STEPS = [
  { id: 1, label: 'Bilgilerin' },
  { id: 2, label: 'Genel Durum' },
  { id: 3, label: 'Zor Senaryo' },
  { id: 4, label: 'Öneriler' },
  { id: 5, label: 'Yapılacaklar' },
];

export default function NakitAkisi({ dark }) {
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
      `Öneri: ${analysis.recommendation}`,
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
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-black mb-3 ${text}`}>Nakit Akışı Simülatörü</h2>
        <p className={`max-w-2xl mx-auto ${sub}`}>
          Gelir ve giderlerini gir, önümüzdeki 12 ayda kasanın nasıl değişeceğini ve zor bir dönemde ne kadar açık oluşabileceğini gör.
        </p>
      </div>

      {/* ── Gelişmiş Nakit Akışı Simülatörü ───────────────────────────────────── */}
      <div className={`rounded-3xl border shadow-xl overflow-hidden ${card}`}>
        <div className="px-6 py-5 border-b border-slate-200/20 bg-[#F8F3F4]">
          <div className="flex items-center gap-2 text-[#1E293B] font-black text-sm uppercase tracking-[0.14em]">
            <Wallet className="w-4 h-4" /> Nakit Akışı Simülatörü
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
                  <span>Zor Senaryo</span>
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
                  <ShieldCheck className="w-4 h-4" /> Zor Senaryo Özeti
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
                  <Layers3 className="w-4 h-4" /> Önerilen Adımlar
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
    </div>
  );
}
