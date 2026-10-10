import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';

// ── Modüler İş Planı ─────────────────────────────────────────────────────────
// Her kullanıcı birden fazla iş planı tutabilir. Planlar profilden bağımsızdır
// (çalışan sayısı, gelir/gider gibi alanlar iş fikrine özeldir) ve yazdıkça
// sunucuya otomatik kaydedilir.

const OTOMATIK_KAYIT_MS = 800;

const BOS_FORM = {
  projectName: '', sector: '',
  monthlyRevenue: '', monthlyExpense: '', monthlyDebtService: '',
  startupCost: '', equity: '', loanAmount: '', teamSize: '',
  market: '', traction: '',
};

// Boş alanlarda silik ipucu olarak görünür; "Örnek verilerle doldur" ile forma yazılır.
const ORNEK_FORM = {
  projectName: 'Sofra Hane',
  sector: 'Gıda / Ev Üretimi',
  monthlyRevenue: 120000,
  monthlyExpense: 76000,
  monthlyDebtService: 22000,
  startupCost: 450000,
  equity: 180000,
  loanAmount: 270000,
  teamSize: 3,
  market: 'Yerel kadın girişimcileri ve e-ticaret müşterileri',
  traction: 'İlk 3 ay içinde 40 müşteri, 3 aylık düzenli sipariş akışı',
};

// Profildeki sektör kodu → yeni plan için önerilen sektör metni
const SEKTOR_ADLARI = {
  yerel_isletme: 'Yerel İşletme',
  ev_emegi: 'Ev Emeği / El İşi',
  teknoloji: 'Teknoloji / Yazılım',
  e_ticaret: 'E-Ticaret',
  kooperatif: 'Kadın Kooperatifi',
  sosyal_girisim: 'Sosyal Girişim',
  kırsal: 'Kırsal Alan / Tarım',
};

export default function IsPlani({ dark }) {
  const [plans, setPlans] = useState([]);
  const [aktifId, setAktifId] = useState(null);
  const [template, setTemplate] = useState('onePage');
  const [form, setForm] = useState(BOS_FORM);
  const [yuklendi, setYuklendi] = useState(false);
  const [kayit, setKayit] = useState('kaydedildi'); // bekliyor | kaydediliyor | kaydedildi | hata
  const [hata, setHata] = useState('');
  const [profilSektoru, setProfilSektoru] = useState(''); // yeni planlara önerilen sektör
  const bekleyen = useRef(null); // { id, veri, sablon, zamanlayici } — henüz gönderilmemiş değişiklik

  // ── Kaydetme ──────────────────────────────────────────────────────────────
  const kaydet = useCallback(async ({ id, veri, sablon }) => {
    setKayit('kaydediliyor');
    try {
      const { plan } = await api.plans.save(id, { veri, sablon });
      setPlans(prev => prev.map(p => (p.id === id ? plan : p)));
      setKayit(bekleyen.current ? 'bekliyor' : 'kaydedildi');
    } catch {
      setKayit('hata');
    }
  }, []);

  // Bekleyen değişikliği hemen gönder (plan değiştirirken, sayfadan çıkarken)
  const bekleyeniGonder = useCallback(() => {
    const b = bekleyen.current;
    if (!b) return null;
    clearTimeout(b.zamanlayici);
    bekleyen.current = null;
    return kaydet(b);
  }, [kaydet]);

  // Her değişiklikte durumu güncelle ve gecikmeli kaydı yeniden kur
  const degistir = (yeniForm, yeniSablon) => {
    setForm(yeniForm);
    setTemplate(yeniSablon);
    if (!aktifId) return;
    clearTimeout(bekleyen.current?.zamanlayici);
    const kayitBilgisi = { id: aktifId, veri: yeniForm, sablon: yeniSablon };
    bekleyen.current = {
      ...kayitBilgisi,
      zamanlayici: setTimeout(() => { bekleyen.current = null; kaydet(kayitBilgisi); }, OTOMATIK_KAYIT_MS),
    };
    setKayit('bekliyor');
  };

  const planiAc = (plan) => {
    setAktifId(plan.id);
    setForm({ ...BOS_FORM, ...plan.veri });
    setTemplate(plan.sablon);
  };

  const yeniPlan = async () => {
    await bekleyeniGonder();
    try {
      const { plan } = await api.plans.create({ veri: { ...BOS_FORM, sector: profilSektoru } });
      setPlans(prev => [plan, ...prev]);
      planiAc(plan);
      setHata('');
    } catch (err) {
      setHata(err.message);
    }
  };

  // ── İlk yükleme: planları getir, hiç yoksa profil sektörüyle boş bir plan aç ─
  useEffect(() => {
    let iptal = false;
    (async () => {
      try {
        const [{ plans: liste }, { profile }] = await Promise.all([
          api.plans.list(),
          api.profile.get().catch(() => ({ profile: {} })),
        ]);
        if (iptal) return;
        const sektor = SEKTOR_ADLARI[profile.sektor] || '';
        setProfilSektoru(sektor);
        if (liste.length) {
          setPlans(liste);
          planiAc(liste[0]);
        } else {
          const { plan } = await api.plans.create({ veri: { ...BOS_FORM, sector: sektor } });
          if (iptal) return;
          setPlans([plan]);
          planiAc(plan);
        }
        setYuklendi(true);
      } catch (err) {
        if (!iptal) setHata(`İş planları yüklenemedi: ${err.message}`);
      }
    })();
    return () => { iptal = true; };
  }, []);

  // Sayfadan çıkarken bekleyen değişikliği kaybetme
  useEffect(() => () => { bekleyeniGonder(); }, [bekleyeniGonder]);

  const planDegistir = async (id) => {
    await bekleyeniGonder();
    const plan = plans.find(p => p.id === Number(id));
    if (plan) planiAc(plan);
  };

  const planiSil = async () => {
    const ad = form.projectName || 'Adsız plan';
    if (!window.confirm(`"${ad}" planı kalıcı olarak silinsin mi?`)) return;
    clearTimeout(bekleyen.current?.zamanlayici);
    bekleyen.current = null;
    try {
      await api.plans.remove(aktifId);
      const kalan = plans.filter(p => p.id !== aktifId);
      setPlans(kalan);
      if (kalan.length) planiAc(kalan[0]);
      else await yeniPlan();
      setKayit('kaydedildi');
    } catch (err) {
      setHata(err.message);
    }
  };

  // Sektör profilden önceden dolabildiği için "boş form" kontrolüne katılmaz
  const formBos = Object.entries(form).every(([k, v]) => k === 'sector' || v === '' || v == null);

  const adjustedRevenue = Number(form.monthlyRevenue || 0);
  const adjustedExpense = Number(form.monthlyExpense || 0);
  const adjustedDebt = Number(form.monthlyDebtService || 0);
  const netCash = adjustedRevenue - adjustedExpense - adjustedDebt;
  const startupCost = Number(form.startupCost || 0);
  const equity = Number(form.equity || 0);
  const loanAmount = Number(form.loanAmount || 0);
  const breakEven = netCash > 0 ? `${Math.ceil(startupCost / netCash)} ay` : 'Hesaplanamıyor';
  const planAdi = form.projectName || 'Adsız plan';
  const dscr = adjustedDebt > 0 ? (Math.max(0, (adjustedRevenue - adjustedExpense) / adjustedDebt)).toFixed(2) : '0.00';
  const debtRatio = loanAmount + equity > 0 ? Math.round((loanAmount / (loanAmount + equity)) * 100) : 0;

  const planSummary = {
    onePage: `Tek Sayfalık Hızlı Özet
- İş: ${planAdi}
- Sektör: ${form.sector}
- Pazar: ${form.market}
- Model: Gelir artışını ve düşük sermaye yoğunluğu ile büyüme potansiyelini öne çıkaran operasyonel yapı.
- Odak Noktası: ${form.traction}`,
    bank: `Banka Kredisi / KGF Odaklı Klasik İş Planı
- Girişimin temel finansal görünümü: ${planAdi}, ${form.sector}
- Başlangıç maliyeti: ${startupCost.toLocaleString('tr-TR')} TL
- Öz sermaye: ${equity.toLocaleString('tr-TR')} TL
- Kredi ihtiyacı: ${loanAmount.toLocaleString('tr-TR')} TL
- DSCR: ${dscr}
- Aylık net nakit akışı: ${netCash.toLocaleString('tr-TR')} TL
- Borç oranı: %${debtRatio}
- Yatırımın geri dönüşü için operasyonel verimlilik ve nakit kontrollü büyüme hedeflenir.`,
    investor: `Hibe / Yatırımcı Odaklı Büyüme Planı
- İş fikri: ${planAdi}
- Pazar potansiyeli: ${form.market}
- Ürün ve büyüme hedefi: ${form.traction}
- Aylık gelir: ${adjustedRevenue.toLocaleString('tr-TR')} TL
- Aylık gider: ${adjustedExpense.toLocaleString('tr-TR')} TL
- Aylık net nakit akışı: ${netCash.toLocaleString('tr-TR')} TL
- Başlangıç yatırımına göre beklenen geri dönüş süresi: ${breakEven}
- Çalışan sayısı: ${form.teamSize} kişi`
  }[template];

  const handleField = (key, value) => degistir({ ...form, [key]: value }, template);
  const handleSayi = (key, value) => handleField(key, value === '' ? '' : Math.max(0, Number(value)));

  const exportPlan = (format = 'txt') => {
    const cleanContent = planSummary;
    const blob = new Blob([cleanContent], { type: format === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${planAdi.toLocaleLowerCase('tr-TR').replace(/\s+/g, '-')}-${template}.${format === 'html' ? 'html' : 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printExport = () => {
    const templateLabel = template === 'onePage' ? 'Tek Sayfalık' : template === 'bank' ? 'Banka / KGF' : 'Yatırımcı / Büyüme';
    const escapeHtml = value =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const printHtml = `<!doctype html>
      <html lang="tr">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(form.projectName)} İş Planı</title>
        <style>
          :root {
            --bg: #f8fafc;
            --card: #ffffff;
            --border: #e2e8f0;
            --muted: #475569;
            --text: #0f172a;
            --primary: #7c3aed;
            --accent: #ec4899;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: Arial, Helvetica, sans-serif;
            padding: 24px;
          }
          .page {
            max-width: 980px;
            margin: 0 auto;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 20px;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            overflow: hidden;
          }
          .header {
            padding: 28px 30px 18px;
            background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.12));
            border-bottom: 1px solid var(--border);
          }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 999px;
            background: rgba(124,58,237,0.14);
            color: var(--primary);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          h1 {
            margin: 16px 0 8px;
            font-size: 32px;
            line-height: 1.2;
          }
          .subtitle {
            margin: 0;
            color: var(--muted);
            font-size: 13px;
          }
          .content {
            padding: 26px 30px 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(180px, 1fr));
            gap: 14px;
            margin-bottom: 18px;
          }
          .item {
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 12px 14px;
          }
          .item strong {
            display: block;
            font-size: 11px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 4px;
          }
          .plan-box {
            border: 1px solid var(--border);
            border-radius: 14px;
            background: #fff;
            padding: 18px 16px;
          }
          pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            border-radius: 12px;
            background: #f8fafc;
            border: 1px solid var(--border);
            padding: 16px;
            font-family: 'SFMono-Regular', Consolas, monospace;
            font-size: 13px;
            line-height: 1.7;
          }
          .actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            padding: 0 30px 28px;
          }
          button {
            appearance: none;
            border: none;
            border-radius: 10px;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
          }
          .primary { background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; }
          .secondary { background: #e2e8f0; color: var(--text); }
          @media print {
            body { background: white; padding: 0; }
            .page { box-shadow: none; border: none; border-radius: 0; }
            .actions { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <span class="badge">İş Planı</span>
            <h1>${escapeHtml(planAdi)}</h1>
            <p class="subtitle">${escapeHtml(templateLabel)} görünüm • Hazırlama tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
          </div>
          <div class="content">
            <div class="summary-grid">
              <div class="item"><strong>Şablon</strong>${escapeHtml(templateLabel)}</div>
              <div class="item"><strong>Aylık Nakit</strong>${escapeHtml(netCash.toLocaleString('tr-TR'))} TL</div>
              <div class="item"><strong>DSCR</strong>${escapeHtml(dscr)}</div>
              <div class="item"><strong>Break-even</strong>${escapeHtml(String(breakEven))}</div>
            </div>
            <div class="plan-box">
              <pre>${escapeHtml(planSummary)}</pre>
            </div>
          </div>
          <div class="actions">
            <button class="secondary" onclick="window.print()">Yazdır</button>
            <button class="primary" onclick="window.close()">Kapat</button>
          </div>
        </div>
      </body>
      </html>`;

    const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
    const printUrl = URL.createObjectURL(blob);
    const printWindow = window.open(printUrl, '_blank', 'width=1200,height=900');

    if (!printWindow) {
      URL.revokeObjectURL(printUrl);
      alert('Yazdırma penceresi engellendi. Lütfen pop-up izinlerini açın.');
      return;
    }

    printWindow.document.title = `${planAdi} İş Planı`;
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        try {
          printWindow.focus();
        } catch (error) {
          console.warn('Pencere odaklanamadı:', error);
        }
      }, 150);
    }, { once: true });
  };

  const fieldClass = dark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400';
  const cardClass = dark ? 'bg-[#1c2333] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const subClass = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 pt-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
          📄 İş Planı Mimarisi
        </div>
        <h2 className={`text-3xl font-black mb-3 ${dark ? 'text-white' : 'text-[#0f172a]'}`}>Modüler İş Planı Oluşturucu</h2>
        <p className={`max-w-2xl mx-auto ${subClass}`}>
          Tek sayfalık hızlı özet, banka/KGF odaklı klasik plan ve yatırımcı odaklı büyüme planı arasında kolayca geçiş yapın.
        </p>
      </div>

      {hata && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{hata}</div>
      )}

      {/* ── Plan seçici & kayıt durumu ── */}
      <div className={`${cardClass} border rounded-2xl p-4 shadow-xl mb-4 flex flex-wrap items-center gap-3`}>
        <label className={`text-xs font-bold uppercase tracking-wide ${subClass}`} htmlFor="plan-secici">Planım</label>
        <select
          id="plan-secici"
          value={aktifId ?? ''}
          onChange={e => planDegistir(e.target.value)}
          disabled={!yuklendi}
          className={`min-w-[200px] flex-1 sm:flex-none border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`}
        >
          {plans.map(p => (
            <option key={p.id} value={p.id}>
              {(p.id === aktifId ? form.projectName : p.veri.projectName) || 'Adsız plan'}
            </option>
          ))}
        </select>
        <button onClick={() => yeniPlan()} disabled={!yuklendi} className="rounded-xl bg-[#1E293B] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">＋ Yeni plan</button>
        <button onClick={planiSil} disabled={!yuklendi} className={`rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50 ${dark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>Sil</button>
        {formBos && yuklendi && (
          <button onClick={() => degistir({ ...ORNEK_FORM, sector: form.sector || ORNEK_FORM.sector }, template)} className={`rounded-xl px-3 py-2 text-xs font-bold ${dark ? 'bg-[#2A3544] text-slate-200' : 'bg-[#F3D5D8] text-[#4A1525]'}`}>
            Örnek verilerle doldur
          </button>
        )}
        <span className={`ml-auto text-xs font-semibold ${kayit === 'hata' ? 'text-red-500' : kayit === 'kaydedildi' ? 'text-emerald-500' : subClass}`}>
          {!yuklendi ? 'Yükleniyor…'
            : kayit === 'kaydedildi' ? '✓ Kaydedildi'
            : kayit === 'hata' ? '⚠ Kaydedilemedi, değişiklik yapınca tekrar denenecek'
            : 'Kaydediliyor…'}
        </span>
      </div>

      <div className={`${cardClass} border rounded-2xl p-4 shadow-xl mb-6`}>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'onePage', label: 'Tek Sayfa' },
            { id: 'bank', label: 'Banka / KGF' },
            { id: 'investor', label: 'Yatırımcı / Büyüme' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => degistir(form, item.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${template === item.id ? 'bg-[#1E293B] text-white' : dark ? 'bg-[#2A3544] text-slate-200' : 'bg-[#F3D5D8] text-[#4A1525]'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
        <div className={`${cardClass} border rounded-2xl p-5 shadow-xl`}>
          <h3 className="text-lg font-black mb-5">İşlem Verileri</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1E293B]">İş adı
              <input value={form.projectName} placeholder={ORNEK_FORM.projectName} onChange={e => handleField('projectName', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1E293B]">Sektör
              <input value={form.sector} placeholder={ORNEK_FORM.sector} onChange={e => handleField('sector', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1E293B]">Aylık gelir (TL)
              <input type="number" value={form.monthlyRevenue} placeholder={ORNEK_FORM.monthlyRevenue} onChange={e => handleSayi('monthlyRevenue', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1E293B]">Aylık gider (TL)
              <input type="number" value={form.monthlyExpense} placeholder={ORNEK_FORM.monthlyExpense} onChange={e => handleSayi('monthlyExpense', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1E293B]">Aylık borç servisi (TL)
              <input type="number" value={form.monthlyDebtService} placeholder={ORNEK_FORM.monthlyDebtService} onChange={e => handleSayi('monthlyDebtService', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1E293B]">Başlangıç maliyeti (TL)
              <input type="number" value={form.startupCost} placeholder={ORNEK_FORM.startupCost} onChange={e => handleSayi('startupCost', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1E293B]">Öz sermaye (TL)
              <input type="number" value={form.equity} placeholder={ORNEK_FORM.equity} onChange={e => handleSayi('equity', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1E293B]">Kredi tutarı (TL)
              <input type="number" value={form.loanAmount} placeholder={ORNEK_FORM.loanAmount} onChange={e => handleSayi('loanAmount', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#1E293B]">Çalışan sayısı
              <input type="number" value={form.teamSize} placeholder={ORNEK_FORM.teamSize} onChange={e => handleSayi('teamSize', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block md:col-span-2 text-xs font-bold uppercase tracking-wide text-[#1E293B]">Pazar hedefi
              <textarea rows={3} value={form.market} placeholder={ORNEK_FORM.market} onChange={e => handleField('market', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
            <label className="block md:col-span-2 text-xs font-bold uppercase tracking-wide text-[#1E293B]">Büyüme / traksiyon açıklaması
              <textarea rows={3} value={form.traction} placeholder={ORNEK_FORM.traction} onChange={e => handleField('traction', e.target.value)} className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F3D5D8] ${fieldClass}`} />
            </label>
          </div>
        </div>

        <div className={`${cardClass} border rounded-2xl p-5 shadow-xl`}>
          <h3 className="text-lg font-black mb-5">Otomatik Finansal Özeti</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3`}>
              <div className={`text-[10px] uppercase tracking-wide ${subClass}`}>Aylık Nakit</div>
              <div className="mt-2 text-xl font-black text-emerald-500">{netCash.toLocaleString('tr-TR')} TL</div>
            </div>
            <div className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3`}>
              <div className={`text-[10px] uppercase tracking-wide ${subClass}`}>Break-even</div>
              <div className="mt-2 text-xl font-black text-[#1E293B]">{breakEven}</div>
            </div>
            <div className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3`}>
              <div className={`text-[10px] uppercase tracking-wide ${subClass}`}>DSCR</div>
              <div className="mt-2 text-xl font-black text-orange-500">{dscr}</div>
            </div>
            <div className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3`}>
              <div className={`text-[10px] uppercase tracking-wide ${subClass}`}>Borç Oranı</div>
              <div className="mt-2 text-xl font-black text-cyan-500">%{debtRatio}</div>
            </div>
          </div>

          <div className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-xl p-4 mb-4`}>
            <div className={`text-[10px] uppercase tracking-wide ${subClass}`}>Şablon önizleme</div>
            <pre className={`mt-3 whitespace-pre-wrap text-xs leading-relaxed ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{planSummary}</pre>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportPlan('txt')} className="bg-[#1E293B] text-white px-4 py-2.5 rounded-xl text-sm font-bold">TXT Dışa Aktar</button>
            <button onClick={printExport} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold">PDF / Yazdır</button>
            <button onClick={() => exportPlan('html')} className="bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold">Word Formatı</button>
          </div>
        </div>
      </div>
    </div>
  );
}
