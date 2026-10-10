import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import BasvuruTakip from './components/BasvuruTakip';
import EgitimPortali from './components/EgitimPortali';
import FuarDestekleri from './components/FuarDestekleri';
import ProfilDuzenle from './components/ProfilDuzenle';
import BasvuruFormu from './components/BasvuruFormu';
import GuncelDuyurular from './components/GuncelDuyurular';
import GizlilikGuvenlik from './components/GizlilikGuvenlik';
import IsPlani from './components/IsPlani';
import NakitAkisi from './components/NakitAkisi';
import BilgiSayfasi from './components/BilgiSayfasi';
import Navbar from './components/Navbar';
import DestekSorulari, { SecimOzeti } from './components/DestekSorulari';
import FortunoLogo from './components/FortunoLogo';
import { supportData, basvuruTakvimi, etkinlikler, ulusalIstatistikler, SON_KONTROL } from './data';
import { api } from './api';
import {
  Sparkles, CheckCircle2, MessageSquare, X,
  ExternalLink, Send, Loader2, BookOpen, Globe, Award,
  Heart, ChevronDown, Calendar,
  BadgeCheck, Gift, HandCoins, Hourglass, Banknote, Landmark, Ship, Handshake
} from 'lucide-react';

// Ana sayfa istatistikleri — uydurma rakam yerine sitedeki doğrulanmış veriden hesaplanır
const HERO_ISTATISTIK = (() => {
  const bugun = new Date().toISOString().slice(0, 10);
  const hibeler = supportData.filter(p => p.destekTuru === 'hibe');
  const enYuksekHibe = hibeler.reduce((a, p) => ((p.hibeUstLimit || 0) > (a?.hibeUstLimit || 0) ? p : a), null);
  const enYakin = etkinlikler
    .filter(e => (!e.baslangic || e.baslangic <= bugun) && bugun <= e.bitis)
    .sort((a, b) => a.bitis.localeCompare(b.bitis))[0];
  return {
    program: supportData.length,
    kurum: new Set(supportData.map(p => p.institution)).size,
    hibe: hibeler.length,
    enYuksekHibe,
    enYakin,
    enYakinGun: enYakin ? Math.max(0, Math.ceil((new Date(`${enYakin.bitis}T23:59:59`) - new Date()) / 86_400_000)) : 0,
  };
})();

const ISTATISTIK_IKONLARI = { Banknote, Landmark, Ship, Handshake };

// Footer bağlantıları: section → uygulama içi sayfa, href → resmi dış site
const FOOTER_LINKLERI = [
  ['Ürün', [
    { label: 'Destek Bul', section: 'sihirbaz' },
    { label: 'Fırsatlar', section: 'fuar' },
    { label: 'İş Planı', section: 'is-plani' },
    { label: 'Eğitimler', section: 'egitim' },
  ]],
  ['Şirket', [
    { label: 'Hakkımızda', section: 'hakkimizda' },
    { label: 'İletişim', section: 'iletisim' },
    { label: 'Gizlilik & Güvenlik', section: 'guvenlik' },
  ]],
  ['Kaynaklar', [
    { label: 'Hibe Rehberi & Kaynakça', section: 'kaynakca' },
    { label: 'Sık Sorulanlar', section: 'sihirbaz', anchor: 'sss' },
    { label: 'KOSGEB', href: 'https://www.kosgeb.gov.tr' },
    { label: 'TÜBİTAK', href: 'https://tubitak.gov.tr' },
  ]],
];

const CHAT_WELCOME = { id: 'welcome', sender: 'bot', text: 'Merhaba! 👋 Ben FortunoAI. Türkiye\'deki kadın girişimcilere hibe, teşvik ve finansal konularda rehberlik ediyorum. Sana nasıl yardımcı olabilirim?' };

// ─── EŞLEŞME MOTORU ───────────────────────────────────────────────────────────
// Sektör, yaş profili, aşama ve medeni durum ZORUNLU kriterlerdir: program
// etiketlerinde bulunmayan bir kritere sahip kullanıcıya o program gösterilmez.
// Tam eşleşme yoksa sırasıyla aşama, sonra yaş gevşetilerek "yakın" seçenekler sunulur.
const SEKTOR_TAGS = ['yerel_isletme', 'ev_emegi', 'teknoloji', 'e_ticaret', 'kooperatif', 'sosyal_girisim', 'kırsal'];
const MEDENI_TAGS = ['bekar', 'evli', 'dul', 'bosanmis'];

const medeniUygun = (item, medeniDurum) => medeniDurum === 'hepsi' || item.tags.includes(medeniDurum);

// Uyum puanı: eşleşen programlar arasında sıralama içindir.
// Sektöre/medeni duruma özel programlar genel olanlardan, hibe krediden önce gelir.
const calculateProgramMatchScore = ({ item, medeniDurum, yakin }) => {
  const sektorSayisi = item.tags.filter(t => SEKTOR_TAGS.includes(t)).length || SEKTOR_TAGS.length;
  const medeniSayisi = item.tags.filter(t => MEDENI_TAGS.includes(t)).length || MEDENI_TAGS.length;
  let score = 70;
  score += Math.round(15 * (SEKTOR_TAGS.length - sektorSayisi) / (SEKTOR_TAGS.length - 1)); // sektöre özellik
  if (medeniDurum !== 'hepsi' && medeniSayisi < MEDENI_TAGS.length) score += 5;            // duruma özel program
  if (item.destekTuru === 'hibe') score += 10;                                             // geri ödemesiz
  if (yakin) score -= 20;
  return Math.max(0, Math.min(100, score));
};

const buildMatchCandidates = ({ sektor, profil, asama, medeniDurum }) => {
  const asamalar = [
    { yakin: false, uygun: item => item.tags.includes(profil) && item.tags.includes(asama) },
    { yakin: 'asama', uygun: item => item.tags.includes(profil) },
    { yakin: 'profil', uygun: () => true },
  ];

  for (const { yakin, uygun } of asamalar) {
    const results = supportData
      .filter(item => item.tags.includes(sektor) && medeniUygun(item, medeniDurum) && uygun(item))
      .map(item => ({ ...item, yakin, combinedScore: calculateProgramMatchScore({ item, medeniDurum, yakin }) }))
      .sort((a, b) => b.combinedScore - a.combinedScore);
    if (results.length) return results;
  }
  return [];
};

// ─── KAYNAKÇA ────────────────────────────────────────────────────────────────
const kaynakca = [
  { kurum: 'KOSGEB', grad: 'linear-gradient(135deg,#2563eb,#1d4ed8)', aciklama: 'Girişimci Destek Programı: İş Kurma Desteği (geri ödemesiz, kadınlara +10.000 TL) ve İş Geliştirme Desteği (kadınlara 1.650.000 TL\'ye kadar, faizsiz geri ödemeli).', link: 'https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/1231/girisimci-destek-programi', etiket: 'Devlet Kurumu' },
  { kurum: 'Kadın Girişimci Portalı', grad: 'linear-gradient(135deg,#db2777,#be185d)', aciklama: 'Aile ve Sosyal Hizmetler Bakanlığı\'nın, kamu kurumları ve bankaların kadın girişimci desteklerini tek noktada topladığı resmi portal.', link: 'https://kadingirisimci.gov.tr/destek-ve-tesvikler/', etiket: 'Resmi Portal' },
  { kurum: 'TÜBİTAK BiGG', grad: 'linear-gradient(135deg,#7c3aed,#6d28d9)', aciklama: 'Üniversite öğrencisi ve mezunlarının teknoloji girişimlerine, kurulacak şirketin %3 hissesi karşılığında 1.350.000 TL yatırım (BiGG Yatırım / 1812).', link: 'https://tubitak.gov.tr/tr/duyuru', etiket: 'Yatırım' },
  { kurum: 'Tarım ve Orman Bakanlığı', grad: 'linear-gradient(135deg,#65a30d,#4d7c0f)', aciklama: 'Kırsal Kalkınma Yatırım Programı: tarımsal işleme, sera, arıcılık ve akıllı tarım projelerine %50-70 hibe; kadınlara %60 ve bütçenin en az %20\'si kadın ve gençlere.', link: 'https://kirsalkalkinma.tarimorman.gov.tr', etiket: 'Hibe' },
  { kurum: 'TKDK — IPARD III', grad: 'linear-gradient(135deg,#059669,#047857)', aciklama: 'AB destekli kırsal kalkınma hibeleri: kırsal turizm, el sanatları, yerel ürün işleme ve tarımsal yatırımlara %60-70 hibe; kadınlara sıralamada ek puan.', link: 'https://www.tkdk.gov.tr', etiket: 'AB Fonu' },
  { kurum: 'Halkbank Üreten Kadınlar', grad: 'linear-gradient(135deg,#0891b2,#0e7490)', aciklama: 'Kadın girişimci, sıfır faizli esnaf, kadın kooperatifi ve kadın ihracatçı kredileri; Üreten Kadınlar Akademisi eğitimleri.', link: 'https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/kadin-girisimci-kredisi.html', etiket: 'Kamu Bankası' },
];

// ─── BAŞVURU TAKVİMİ ─────────────────────────────────────────────────────────
// Tarihler data.js'te; durum bugünün tarihine göre hesaplanır, böylece takvim eskimez.
const TAKVIM_DURUM = {
  acik:       { label: '🟢 Başvurular açık', cls: 'bg-emerald-100 text-emerald-700' },
  yaklasiyor: { label: '⏰ Yaklaşıyor',      cls: 'bg-amber-100 text-amber-700' },
  kapandi:    { label: '✓ Tamamlandı',       cls: 'bg-slate-200 text-slate-600' },
};

const takvimDurumu = ({ baslangic, bitis }, bugun = new Date().toISOString().slice(0, 10)) => {
  if (bugun < baslangic) return 'yaklasiyor';
  if (bugun <= bitis) return 'acik';
  return 'kapandi';
};

const tarihAraligi = ({ baslangic, bitis }) => {
  const fmt = (d, opts) => new Date(`${d}T12:00:00`).toLocaleDateString('tr-TR', opts);
  return baslangic === bitis
    ? fmt(baslangic, { day: 'numeric', month: 'long', year: 'numeric' })
    : `${fmt(baslangic, { day: 'numeric', month: 'long' })} – ${fmt(bitis, { day: 'numeric', month: 'long', year: 'numeric' })}`;
};

// ─── FAQ VERİSİ ───────────────────────────────────────────────────────────────
const faqVerisi = [
  { soru: 'KOSGEB\'den geri ödemesiz destek alabilir miyim?', cevap: 'Evet, İş Kurma Desteği geri ödemesizdir: kuruluşunun ilk yılındaki şahıs işletmelerine 10.000 TL, sermaye şirketlerine 20.000 TL; kadın girişimcilere +10.000 TL ilave. Daha büyük tutarlı İş Geliştirme Desteği (kadınlara 1.650.000 TL\'ye kadar) ise faizsiz ama geri ödemelidir ve yalnızca imalat, yazılım/bilişim ve Ar-Ge sektörlerine açıktır.' },
  { soru: 'TÜBİTAK BiGG için şirket kurmuş olmam gerekir mi?', cevap: 'Hayır, tam tersi: başvuru tarihinde herhangi bir şirkette ortaklığınız olmamalı. Hızlandırma programını geçip yatırım almaya hak kazanırsanız şirket kurulur ve TÜBİTAK BiGG Fonu %3 hisse karşılığında yatırım yapar. Bu bir hibe değil, yatırımdır.' },
  { soru: 'Aynı anda birden fazla destekten yararlanabilir miyim?', cevap: 'Çoğu zaman evet; örneğin bir hibe ile bir banka kredisini birlikte kullanabilirsiniz. Ancak aynı gider kalemi için iki kamu desteği alınamaz ve bazı destekler birbirini dışlar (ör. KOSGEB İş Geliştirme Desteği ile Kredi Faiz Desteği aynı anda kullanılamaz). Başvurmadan önce program şartlarını okuyun.' },
  { soru: 'Hibe mi, kredi mi tercih etmeliyim?', cevap: 'Hibeler geri ödemesizdir ama çağrı dönemlerinde açılır ve rekabetçidir. Krediler hemen başvurulabilir; örneğin Halkbank Kadın Girişimci Kredisi 36 ay vadeli ve ilk 6 ayı anapara ödemesizdir. Çoğu girişimci ikisini birlikte planlar.' },
  { soru: 'Bilgiler ne kadar güncel?', cevap: `Program tutarları ve tarihleri ${SON_KONTROL} itibarıyla resmi kaynaklardan kontrol edildi. Tutarlar her yıl değişebilir; başvurudan önce programın resmi sayfasını mutlaka kontrol edin.` },
];

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
// Pieces are stable (generated once) to avoid Math.random() in render
const CONFETTI_PIECES = Array.from({ length: 48 }, (_, i) => {
  const colors = ['#6d28d9', '#ec4899', '#22c55e', '#f59e0b', '#06b6d4', '#f43f5e'];
  return {
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    color: colors[i % colors.length],
    size: 8 + Math.random() * 8,
    duration: 1.8 + Math.random(),
    round: Math.random() > 0.5,
  };
});

function Confetti({ active }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[999]" aria-hidden>
      {CONFETTI_PIECES.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard({ dark }) {
  const cls = dark ? 'skeleton-dark' : 'skeleton-light';
  return (
    <div className={`border ${dark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'} p-5 rounded-xl`}>
      <div className={`${cls} h-4 w-24 mb-3`} />
      <div className={`${cls} h-5 w-3/4 mb-2`} />
      <div className={`${cls} h-3 w-full mb-1`} />
      <div className={`${cls} h-3 w-5/6 mb-4`} />
      <div className={`${cls} h-9 w-full`} />
    </div>
  );
}

// ─── ANIMASYONLU SAYAÇ ────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '', decimals = 0, duration = 900 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(timer); }
          else setVal(decimals ? start : Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, decimals]);
  const metin = val.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span ref={ref} className="stat-num">{prefix}{metin}{suffix}</span>;
}

// ─── HIZLI SORULAR ────────────────────────────────────────────────────────────
const hizliSorular = [
  'KOSGEB\'e nasıl başvurabilirim?',
  'TÜBİTAK BİGG nedir?',
  'Şirket kurmak zorunda mıyım?',
  'Kadınlara özel hibeler neler?',
];

// ─── LOGO SVG ─────────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
// ANA COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function App({ user, onLogout }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('fortuno-dark') === 'true'; } catch { return false; }
  });
  const [sektor, setSektor] = useState('');
  const [profil, setProfil] = useState('');
  const [asama, setAsama] = useState('');
  const [medeniDurum, setMedeniDurum] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('sihirbaz'); // Navbar.jsx'teki NAV_MENU / HESAP_MENU sayfa kimlikleri
  const [favorites, setFavorites] = useState([]);
  const [heartPoppingId, setHeartPoppingId] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [kurumFilter, setKurumFilter] = useState('Tümü');
  const [profildenDolu, setProfildenDolu] = useState(false);
  const [basvuruProgram, setBasvuruProgram] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([CHAT_WELCOME]);
  const chatEndRef = useRef(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('fortuno-dark', String(dark)); } catch { }
  }, [dark]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Profil doluysa sihirbazın YALNIZCA boş alanlarını doldurur; kullanıcının
  // sihirbazda yaptığı seçimler ezilmez, sihirbazdaki değişiklik de profili değiştirmez.
  const profiliUygula = useCallback((p) => {
    if (!p) return;
    const alanlar = [[p.sektor, setSektor], [p.profilTipi, setProfil], [p.asama, setAsama], [p.medeniDurum, setMedeniDurum]];
    alanlar.forEach(([deger, setter]) => { if (deger) setter(mevcut => mevcut || deger); });
    if (alanlar.some(([deger]) => deger)) setProfildenDolu(true);
  }, []);

  // Eşleşen programları bulur. sessiz: profilden otomatik aramada bekleme/konfeti yok.
  const aramaYap = useCallback((d, { sessiz = false } = {}) => {
    if (!d.sektor || !d.profil || !d.asama || !d.medeniDurum) return;
    setSektor(d.sektor); setProfil(d.profil); setAsama(d.asama); setMedeniDurum(d.medeniDurum);
    const bitir = () => {
      const results = buildMatchCandidates(d);
      setKurumFilter('Tümü'); // önceki aramanın kurum filtresi yeni sonuçları gizlemesin
      setFilteredResults(results);
      setHasSearched(true);
      setIsSkeletonLoading(false);
      if (!sessiz && results.length > 0) {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 2000);
      }
    };
    if (sessiz) { bitir(); return; }
    setIsSkeletonLoading(true);
    setHasSearched(false);
    setTimeout(bitir, 900);
  }, []);

  // Kullanıcı verilerini sunucudan yükle
  useEffect(() => {
    api.favorites.list('program').then(({ ids }) => setFavorites(ids)).catch(() => {});
    api.profile.get().then(({ profile }) => {
      profiliUygula(profile);
      const { sektor: s, profilTipi: p, asama: a, medeniDurum: m } = profile;
      if (s && p && a && m) aramaYap({ sektor: s, profil: p, asama: a, medeniDurum: m }, { sessiz: true });
    }).catch(() => {});
    api.chat.history()
      .then(({ messages }) => { if (messages.length) setChatMessages([CHAT_WELCOME, ...messages]); })
      .catch(() => {});
  }, [profiliUygula, aramaYap]);

  // Confetti CSS inject (one-time)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ── Custom navigation event (from ProfilDuzenle) ───────────────────────────
  useEffect(() => {
    const handler = (e) => setActiveSection(e.detail);
    window.addEventListener('fortuno-navigate', handler);
    return () => window.removeEventListener('fortuno-navigate', handler);
  }, []);


  // ── Handlers ───────────────────────────────────────────────────────────────
  // anchor verilirse sayfa çizildikten sonra o bölüme kaydırılır (ör. footer → SSS)
  const goToSection = (id, anchor) => {
    setActiveSection(id);
    if (!anchor) { window.scrollTo({ top: 0 }); return; }
    setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const toggleFav = useCallback((id) => {
    // İyimser güncelleme: arayüz hemen değişir, sunucu yanıtıyla senkronlanır
    const isFav = favorites.includes(id);
    setFavorites(prev => isFav ? prev.filter(f => f !== id) : [...prev, id]);
    (isFav ? api.favorites.remove('program', id) : api.favorites.add('program', id))
      .then(({ ids }) => setFavorites(ids))
      .catch(() => api.favorites.list('program').then(({ ids }) => setFavorites(ids)).catch(() => {}));
    setHeartPoppingId(id);
    setTimeout(() => setHeartPoppingId(null), 350);
  }, [favorites]);

  // Sonuçlardan "en fazla ne kadar destek" özeti (eski Hibe Hesaplayıcı'nın yerini alır)
  const destekOzeti = useMemo(() => {
    const enYuksek = (turler, alan) => filteredResults
      .filter(p => turler.includes(p.destekTuru) && p[alan])
      .reduce((a, p) => (!a || p[alan] > a[alan] ? p : a), null);
    return {
      hibe: enYuksek(['hibe'], 'hibeUstLimit'),
      finansman: enYuksek(['kredi', 'geri_odemeli', 'yatirim'], 'finansmanUstLimit'),
      geriOdemesizSayisi: filteredResults.filter(p => p.destekTuru === 'hibe').length,
    };
  }, [filteredResults]);

  // Mesajı sunucuya gönderir; Gemini veya hazır yanıt motoru sunucuda çalışır.
  const sendChat = useCallback(async (text, { useHistory = true } = {}) => {
    const tempId = `tmp-${Date.now()}`;
    setChatMessages(prev => [...prev, { id: tempId, sender: 'user', text }]);
    setIsLoading(true);
    try {
      const { userMessage, botMessage } = await api.chat.send(text, { useHistory });
      setChatMessages(prev => [...prev.map(m => m.id === tempId ? userMessage : m), botMessage]);
    } catch (err) {
      setChatMessages(prev => [...prev, { id: `err-${Date.now()}`, sender: 'bot', text: `⚠️ ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    const text = chatInput;
    setChatInput('');
    sendChat(text);
  };

  const sendQuickQuestion = useCallback((q) => {
    if (isLoading) return;
    setChatInput('');
    sendChat(q, { useHistory: false });
  }, [isLoading, sendChat]);

  // Kurum filtreleme — memoized to avoid recalc on every render
  const kurumlar = useMemo(
    () => ['Tümü', ...Array.from(new Set(filteredResults.map(r => r.institution)))],
    [filteredResults]
  );
  const displayedResults = useMemo(
    () => kurumFilter === 'Tümü'
      ? filteredResults
      : filteredResults.filter(r => r.institution === kurumFilter),
    [filteredResults, kurumFilter]
  );
  // Tam eşleşme yoksa hangi kriterin gevşetildiği (tüm sonuçlar aynı seviyededir)
  const yakinEslesme = filteredResults[0]?.yakin || false;

  // Renk sınıfları (dark mode)
  const bg = 'bg-[#F5F5DC]';
  const card = dark ? 'bg-[#1E293B] border border-[#374151] text-white' : 'bg-[#FFFFFF] border border-[#EAE3D9] text-[#1E293B] shadow-[0_10px_30px_rgba(30,41,59,0.06)]';
  const text = dark ? 'text-white' : 'text-[#1E293B]';
  const subtext = dark ? 'text-slate-300' : 'text-[#5B6473]';
  const inputCls = dark
    ? 'bg-[#1E293B] border-[#4B5563] text-white focus:ring-[#F3D5D8]'
    : 'bg-[#FAF7F2] border-[#EAE3D9] text-[#1E293B] focus:ring-[#F3D5D8]';

  // ── Sections ─────────────────────────────────────────────────────────────
  const showSihirbaz    = activeSection === 'sihirbaz';
  const showFavoriler   = activeSection === 'favoriler';
  const showKaynakca    = activeSection === 'kaynakca';
  const showIsPlani     = activeSection === 'is-plani';
  const showTakip       = activeSection === 'takip';
  const showEgitim      = activeSection === 'egitim';
  const showFuar        = activeSection === 'fuar';
  const showProfil      = activeSection === 'profil';
  const showGuncel      = activeSection === 'guncel';
  const showGuvenlik    = activeSection === 'guvenlik';

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${bg} ${text} font-sans transition-colors duration-300`}>
      <Confetti active={confettiActive} />

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <Navbar
        activeSection={activeSection}
        onNavigate={goToSection}
        favoriSayisi={favorites.length}
        dark={dark}
        setDark={setDark}
        user={user}
        onLogout={onLogout}
      />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      {showSihirbaz && (
        <header className="px-4 pb-10 pt-12">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-[#EAE3D9] bg-[#1E2E3E] px-6 py-10 shadow-[0_12px_30px_rgba(30,41,59,0.04)] md:px-10 md:py-14 dark:border-[#374151] dark:bg-[#1E293B]">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#EAF4FB] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2B5472]">
                <Sparkles className="h-3.5 w-3.5" />
                Girişimci destek platformu
              </div>
              <h1 className="hero-title text-4xl font-medium tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
                Girişimci kadınlar için
                <span className="mt-2 block bg-[#DCE7F2] bg-clip-text font-semibold text-transparent">
                  akıllı finans ve hibe eşleştirme
                </span>
              </h1>
              <p className="hero-subtitle mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
                Karmaşık formları ve ağır finans jargonunu bir kenara bırakın. 3 adımda size uygun teşvik, hibe ve fon seçeneklerini net şekilde görün.
              </p>

              <div className="hero-stats mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => goToSection('sihirbaz', 'destek-sorulari')}
                  className="rounded-full border border-[#EAE3D9] bg-[#F3D5D8] px-6 py-3 text-sm font-bold text-[#4A1525] shadow-[0_12px_24px_rgba(244,196,203,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#eed0d5]"
                >
                  Destek Bul
                </button>
                <button
                  onClick={() => setActiveSection('fuar')}
                  className="rounded-full border border-[#EAE3D9] bg-[#F3D5D8] px-6 py-3 text-sm font-bold text-[#4A1525] shadow-[0_12px_24px_rgba(244,196,203,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#eed0d5]"
                >
                  Son fırsatları gör
                </button>
              </div>
            </div>

            {/* ── Fortuno'da: sitedeki doğrulanmış veriden ── */}
            <div className="hero-stats mt-10">
              <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#F3D5D8]">Fortuno'da</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {[
                  { Ikon: BadgeCheck, value: HERO_ISTATISTIK.program, label: 'Doğrulanmış destek programı', alt: `${HERO_ISTATISTIK.kurum} kurum ve bankadan` },
                  { Ikon: Gift, value: HERO_ISTATISTIK.hibe, label: 'Geri ödemesiz destek', alt: 'hibe ve gider desteği' },
                  HERO_ISTATISTIK.enYuksekHibe && { Ikon: HandCoins, value: HERO_ISTATISTIK.enYuksekHibe.hibeUstLimit / 1e6, suffix: ' milyon ₺', label: 'Tek programda en yüksek hibe', alt: HERO_ISTATISTIK.enYuksekHibe.title, section: 'sihirbaz' },
                  HERO_ISTATISTIK.enYakin && { Ikon: Hourglass, value: HERO_ISTATISTIK.enYakinGun, suffix: ' gün', label: 'En yakın son başvuruya', alt: HERO_ISTATISTIK.enYakin.baslik, section: 'fuar' },
                ].filter(Boolean).map(({ Ikon, value, suffix, label, alt, section }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={section ? () => goToSection(section) : undefined}
                    className={`rounded-2xl border border-slate-700 bg-slate-800/80 p-3 sm:p-5 text-center transition ${section ? 'hover:border-[#F3D5D8]/60 hover:bg-slate-800 cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F3D5D8]/15 text-[#F3D5D8]">
                      <Ikon className="h-5 w-5" />
                    </div>
                    <div className="text-xl sm:text-3xl font-medium tracking-[-0.04em] text-white">
                      <AnimatedCounter target={value} suffix={suffix} />
                    </div>
                    <div className="mt-2 text-[10px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.14em] text-slate-300">{label}</div>
                    <div className="mt-1 text-[11px] text-slate-400 line-clamp-1">{alt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Türkiye'de kadın girişimciliği: resmi kaynaklı rakamlar ── */}
            <div className="hero-stats mt-8">
              <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#A8D5F2]">Türkiye'de kadın girişimciliği</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {ulusalIstatistikler.map(st => {
                  const Ikon = ISTATISTIK_IKONLARI[st.ikon] || Landmark;
                  return (
                    <div key={st.id} className="rounded-2xl border border-slate-700/70 bg-slate-900/40 p-3 sm:p-5 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#A8D5F2]/15 text-[#A8D5F2]">
                        <Ikon className="h-5 w-5" />
                      </div>
                      <div className="text-xl sm:text-2xl font-medium tracking-[-0.03em] text-white">
                        <AnimatedCounter target={st.deger} decimals={st.ondalik} prefix={st.onEk} suffix={st.sonEk} />
                      </div>
                      <div className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-200">{st.baslik}</div>
                      <div className="mt-1 text-[11px] text-slate-400">{st.aciklama}</div>
                      <a href={st.kaynak} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[10px] text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline">
                        Kaynak: {st.kaynakAd} ↗
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ── ANA İÇERİK ─────────────────────────────────────────────────────── */}
      {showSihirbaz ? (
        <main className="max-w-6xl mx-auto px-4 mt-12 pb-24 space-y-6">

          {/* Sorular (adım adım) ya da tamamlandıysa seçim özeti */}
          {!hasSearched && !isSkeletonLoading ? (
            <DestekSorulari
              key={`${sektor}-${profil}-${asama}-${medeniDurum}`}
              degerler={{ sektor, profil, asama, medeniDurum }}
              onTamamla={aramaYap}
              dark={dark}
              profildenDolu={profildenDolu}
            />
          ) : (
            <SecimOzeti degerler={{ sektor, profil, asama, medeniDurum }} onDegistir={() => setHasSearched(false)} dark={dark} />
          )}

          {/* Sonuçlar */}
          {(hasSearched || isSkeletonLoading) && (
          <div className="space-y-6">
            <div className={`${card} p-6 rounded-2xl shadow-xl border`}>
              <h3 className="text-xl font-bold mb-4 pb-3 border-b border-slate-100/20 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Eşleşen Finansal Destekler ve Teşvik Paketleri</span>
                {hasSearched && filteredResults.length > 0 && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                    {filteredResults.length} sonuç
                  </span>
                )}
              </h3>

              {hasSearched && yakinEslesme && (
                <div className={`mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${dark ? 'border-amber-700/50 bg-amber-900/20 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                  <span>💡</span>
                  <span>
                    {yakinEslesme === 'asama'
                      ? 'Girişiminizin şu anki aşamasına tam uyan bir program bulamadık. Aşağıda sektörünüze ve profilinize uygun, farklı aşamalar için açılan programlar var — başvuru şartlarını mutlaka kontrol edin.'
                      : 'Yaş profilinize ve aşamanıza tam uyan bir program bulamadık. Aşağıda sektörünüze uygun yakın seçenekler var — başvuru şartlarını mutlaka kontrol edin.'}
                  </span>
                </div>
              )}

              {hasSearched && filteredResults.length > 0 && (
                <div className="mb-5 grid gap-3 md:grid-cols-3">
                  {[
                    destekOzeti.hibe && { baslik: 'Geri ödemesiz destek', deger: `${destekOzeti.hibe.hibeUstLimit.toLocaleString('tr-TR')} ₺'ye kadar`, alt: destekOzeti.hibe.title, renk: 'text-emerald-600' },
                    destekOzeti.finansman && { baslik: 'Kredi / geri ödemeli finansman', deger: `${destekOzeti.finansman.finansmanUstLimit.toLocaleString('tr-TR')} ₺'ye kadar`, alt: destekOzeti.finansman.title, renk: dark ? 'text-sky-300' : 'text-sky-700' },
                    { baslik: 'Eşleşen program', deger: `${filteredResults.length} program`, alt: `${destekOzeti.geriOdemesizSayisi} tanesi geri ödemesiz`, renk: dark ? 'text-white' : 'text-[#1E293B]' },
                  ].filter(Boolean).map(k => (
                    <div key={k.baslik} className={`${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-xl p-4`}>
                      <div className={`text-[11px] font-bold uppercase tracking-wider ${subtext}`}>{k.baslik}</div>
                      <div className={`mt-1.5 text-xl font-black ${k.renk}`}>{k.deger}</div>
                      <div className={`mt-0.5 text-xs ${subtext} line-clamp-1`}>{k.alt}</div>
                    </div>
                  ))}
                  <p className={`md:col-span-3 -mt-1 text-[11px] ${subtext}`}>Tutarlar tek bir programdaki en yüksek resmi üst limittir; destekler genelde birbirine eklenmez.</p>
                </div>
              )}

              {/* Kurum Filtrele */}
              {hasSearched && filteredResults.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {kurumlar.map(k => (
                    <button
                      key={k}
                      id={`filter-${k.replace(/\s/g, '-')}`}
                      onClick={() => setKurumFilter(k)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${kurumFilter === k
                          ? 'bg-[#1E293B] text-white border-[#1E293B]'
                          : dark
                            ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}

              {/* İçerik */}
              {isSkeletonLoading ? (
                <div key="loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(n => <SkeletonCard key={n} dark={dark} />)}
                </div>
              ) : displayedResults.length === 0 ? (
                <div key="no-results" className="flex flex-col items-center justify-center text-center pt-16 px-4">
                  <p className="text-red-500 font-bold mb-2">Tam Birebir Eşleşen Paket Bulunamadı.</p>
                  <p className={`text-sm max-w-sm ${subtext}`}>
                    Girdiğiniz kriter kombinasyonuna ait hibe paketi bulunamadı. Lütfen chatbot mentörümüz FortunoAI'a danışarak KOSGEB veya TÜBİTAK detaylarını öğrenin.
                  </p>
                </div>
              ) : (
                <div key="results" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedResults.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`card-animate border p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition group ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-xs font-bold text-[#1E293B] bg-[#F3D5D8] px-2.5 py-1 rounded-md">{item.institution}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold ${dark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-500'} border px-2 py-0.5 rounded-md`}>{item.type}</span>
                            {/* Favori butonu */}
                            <button
                              id={`fav-${item.id}`}
                              onClick={() => toggleFav(item.id)}
                              aria-label={favorites.includes(item.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                              className={`p-1 rounded-lg transition ${heartPoppingId === item.id ? 'heart-pop' : ''}`}
                            >
                              <Heart
                                className={`w-4 h-4 transition ${favorites.includes(item.id) ? 'text-[#4A1525] fill-[#4A1525]' : 'text-slate-400 hover:text-[#4A1525]'}`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${subtext}`}>Eşleşme</span>
                          <span className="text-xs font-black text-emerald-500">{item.combinedScore}/100</span>
                        </div>
                        <h4 className={`font-extrabold text-base mb-2 group-hover:text-[#1E293B] transition ${dark ? 'text-white' : 'text-[#1E293B]'}`}>{item.title}</h4>
                        <p className={`text-xs line-clamp-3 mb-3 leading-relaxed ${subtext}`}>{item.description}</p>
                        <p className={`text-[11px] font-semibold mb-4 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>📅 {item.basvuruDurumu}</p>
                      </div>
                      <div>
                        <div className={`${dark ? 'bg-emerald-900/30 border-emerald-700/40' : 'bg-emerald-50 border-emerald-200/60'} border p-2.5 rounded-lg mb-3 flex items-center justify-between`}>
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-emerald-400' : 'text-emerald-800'}`}>Destek Limiti:</span>
                          <span className="text-base font-black text-[#22c55e] text-right">
                            {item.amount}
                          </span>
                        </div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className={`w-full text-xs font-bold py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition ${dark ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                        >
                          Resmi Başvuru Linki <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setBasvuruProgram(item)}
                          className="w-full mt-2 text-xs font-black py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition bg-[#1E293B] text-white hover:opacity-90 shadow-md"
                        >
                          🚀 Hadi Başvur!
                        </button>
                        <a
                          href={item.kaynak}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-2 block text-center text-[10px] underline-offset-2 hover:underline ${subtext}`}
                        >
                          Kaynak · {SON_KONTROL}'da kontrol edildi
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Sık sorulan sorular */}
          <div className={`${card} p-6 rounded-2xl border`}>
            {/* FAQ Accordion */}
            <div id="sss" className="scroll-mt-24">
              <h3 className="font-bold text-sm mb-3 text-[#1E293B] flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Sık Sorulan Sorular
              </h3>
              <div className="space-y-2">
                {faqVerisi.map((faq, i) => (
                  <div key={i} className={`rounded-xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <button
                      id={`faq-btn-${i}`}
                      onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                      className={`w-full text-left px-4 py-3 text-xs font-bold flex justify-between items-center transition ${dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'}`}
                    >
                      {faq.soru}
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${openFaqIdx === i ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className="faq-body"
                      style={{ maxHeight: openFaqIdx === i ? '200px' : '0', opacity: openFaqIdx === i ? 1 : 0 }}
                    >
                      <p className={`px-4 py-3 text-xs leading-relaxed ${dark ? 'text-slate-400 bg-slate-900' : 'text-slate-600 bg-white'}`}>
                        {faq.cevap}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

      ) : showFavoriler ? (
        /* ── FAVORİLER ──────────────────────────────────────────────────────── */
        <main className="max-w-6xl mx-auto px-4 mt-12 pb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#F3D5D8] text-[#4A1525] px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Heart className="w-4 h-4 fill-[#4A1525]" /> Favori Programlarınız
            </div>
            <h2 className={`text-3xl font-black mb-3 ${dark ? 'text-white' : 'text-[#0f172a]'}`}>Kaydettiğiniz Destekler</h2>
          </div>
          {favorites.length === 0 ? (
            <p className={`text-center ${subtext}`}>Henüz favori programınız yok. Sonuçlarda kalp ikonuna tıklayarak ekleyebilirsiniz.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportData.filter(s => favorites.includes(s.id)).map((item, idx) => (
                <div key={item.id} className={`card-animate ${card} border p-5 rounded-xl shadow-lg flex flex-col justify-between`} style={{ animationDelay: `${idx * 80}ms` }}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-[#1E293B] bg-[#F3D5D8] px-2.5 py-1 rounded-md">{item.institution}</span>
                      <button onClick={() => toggleFav(item.id)} className="p-1">
                        <Heart className="w-4 h-4 text-[#4A1525] fill-[#4A1525]" />
                      </button>
                    </div>
                    <h4 className="font-extrabold text-base mb-2">{item.title}</h4>
                    <p className={`text-xs leading-relaxed mb-4 ${subtext}`}>{item.description}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200/60 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase">Destek Limiti:</span>
                    <span className="text-base font-black text-[#22c55e] text-right">
                      {item.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

      ) : showKaynakca ? (
        /* ── KAYNAKÇA ───────────────────────────────────────────────────────────── */
        <main className="max-w-6xl mx-auto px-4 mt-12 pb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#F3D5D8] text-[#4A1525] px-4 py-2 rounded-full text-sm font-bold mb-4">
              <BookOpen className="w-4 h-4" /> Güncel & Doğrulanmış Kaynaklar
            </div>
            <h2 className={`text-3xl font-black mb-3 ${dark ? 'text-white' : 'text-[#0f172a]'}`}>Resmi Hibe ve Destek Kaynakları</h2>
            <p className={`max-w-xl mx-auto ${subtext}`}>
              Türkiye'deki kadın girişimciler için resmi hibe, teşvik ve destek programlarının kaynakları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {kaynakca.map((k, i) => (
              <div key={i} className={`${card} rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group card-animate`} style={{ animationDelay: `${i * 80}ms` }}>
                <div style={{ background: k.grad }} className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-black text-lg">{k.kurum}</h3>
                    <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-md">{k.etiket}</span>
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <p className={`text-sm leading-relaxed mb-5 ${subtext}`}>{k.aciklama}</p>
                  <a href={k.link} target="_blank" rel="noreferrer"
                    className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-2.5 px-4 rounded-xl border transition ${dark ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`}>
                    <Globe className="w-4 h-4" /> Resmi Siteye Git <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ── BAŞVURU TAKVİMİ ───────────────────────────────────────────── */}
          <div className={`${card} rounded-2xl shadow-xl border p-6 mb-10`}>
            <h3 className="font-black text-xl mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1E293B]" />
              Başvuru Takvimi
            </h3>
            <p className={`text-xs mb-5 -mt-3 ${subtext}`}>Yeni dönem tarihleri açıklandıkça güncellenir. Sürekli açık programlar (banka kredileri vb.) takvimde yer almaz.</p>
            <div className="space-y-3">
              {basvuruTakvimi.map((item, i) => { const durum = TAKVIM_DURUM[takvimDurumu(item)]; return (
                <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-xs font-black px-3 py-1 rounded-full shrink-0 border ${dark ? 'border-slate-600 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
                      {tarihAraligi(item)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm">{item.program}</p>
                      <p className={`text-xs ${subtext}`}>{item.kurum}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${durum.cls}`}>
                    {durum.label}
                  </span>
                </div>
              ); })}
            </div>
          </div>

          {/* Alt bilgi */}
          <div className="bg-[#1E293B] rounded-2xl p-8 text-white text-center shadow-xl">
            <Award className="w-10 h-10 mx-auto mb-3 opacity-90" />
            <h3 className="text-2xl font-black mb-2">Hangi Destek Size Uygun?</h3>
            <p className="text-slate-200 mb-5 max-w-lg mx-auto">Kafanız karıştıysa endişelenmeyin! FortunoAI sizi 3 basit soruyla en uygun programa yönlendirir.</p>
            <button id="goto-sihirbaz-btn" onClick={() => goToSection('sihirbaz', 'destek-sorulari')}
              className="bg-[#F3D5D8] text-[#4A1525] font-black px-8 py-3 rounded-xl hover:bg-[#eed0d5] transition shadow-lg">
              Destek Sihirbazını Başlat →
            </button>
          </div>
        </main>
      ) : null}

      {/* ── MODÜLER İŞ PLANI ─────────────────────────────────────────────── */}
      {activeSection === 'nakit-akisi' && <NakitAkisi dark={dark} />}

      {showIsPlani && (
        <IsPlani dark={dark} />
      )}

      {/* ── HİBE HESAPLAYICI ──────────────────────────────────────────────── */}

      {/* ── BAŞVURU TAKİP ─────────────────────────────────────────────────── */}
      {showTakip && (
        <main className="max-w-7xl mx-auto px-4 mt-12 pb-24">
          <BasvuruTakip dark={dark} />
        </main>
      )}

      {/* ── EĞİTİM PORTALI ────────────────────────────────────────────────── */}
      {showEgitim && <EgitimPortali dark={dark} />}

      {/* ── FUAR DESTEKLERİ ──────────────────────────────────────────────────── */}
      {(showFuar || showGuncel) && (
        <div className="max-w-6xl mx-auto px-4 mt-8 -mb-4">
          <div className={`inline-flex rounded-2xl border p-1 ${dark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`} role="tablist" aria-label="Fırsatlar">
            {[['fuar', 'Başvurusu Açık'], ['guncel', 'Haberler']].map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={activeSection === id} onClick={() => goToSection(id)}
                className={`rounded-xl px-5 py-2 text-sm font-bold transition ${activeSection === id ? 'bg-[#1E293B] text-white' : dark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      {showFuar && <FuarDestekleri dark={dark} />}

      {/* ── PROFİL DÜZENLE ───────────────────────────────────────────────────── */}
      {showProfil && <ProfilDuzenle dark={dark} onProfilChange={profiliUygula} />}

      {/* ── GÜNCEL DUYURULAR ─────────────────────────────────────────────── */}
      {showGuncel && <GuncelDuyurular dark={dark} />}

      {/* ── GİZLİLİK & GÜVENLİK ──────────────────────────────────────────── */}
      {showGuvenlik && <GizlilikGuvenlik dark={dark} onHesapSilindi={onLogout} />}

      {/* ── HAKKIMIZDA / İLETİŞİM / ŞARTLAR (içerikler hazırlanacak) ────────── */}
      <BilgiSayfasi sayfa={activeSection} dark={dark} />

      {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
      <footer className="mt-16 bg-[#0c1a30] text-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#1E293B] p-2 shadow-[0_8px_20px_rgba(30,41,59,0.15)]">
                  <FortunoLogo />
                </div>
                <div>
                  <div className="text-lg font-black tracking-[0.18em] text-blue-300">FORTUNO</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Women Tech AI</div>
                </div>
              </div>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-300">
                Kadın girişimciler için daha şeffaf, daha akıllı ve daha insan odaklı bir destek deneyimi sunuyoruz.
              </p>
            </div>

            {FOOTER_LINKLERI.map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{title}</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {links.map(({ label, section, anchor, href }) => (
                    <li key={label}>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer" className="transition hover:text-white">{label} ↗</a>
                      ) : (
                        <button onClick={() => goToSection(section, anchor)} className="text-left transition hover:text-white">{label}</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-slate-700/80 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Fortuno. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => goToSection('guvenlik', 'gizlilik-politikasi')} className="transition hover:text-white">Gizlilik</button>
              <button onClick={() => goToSection('sartlar')} className="transition hover:text-white">Şartlar</button>
              <button onClick={() => goToSection('iletisim')} className="transition hover:text-white">İletişim</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── BAŞVURU FORMU MODAL ──────────────────────────────────────────── */}
      {basvuruProgram && (
        <BasvuruFormu
          dark={dark}
          program={basvuruProgram}
          onClose={() => setBasvuruProgram(null)}
        />
      )}

      {/* ── CHATBOT ──────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className={`w-[340px] md:w-[380px] h-[520px] rounded-2xl shadow-2xl border mb-4 flex flex-col overflow-hidden ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            {/* Chat header */}
            <div className="bg-[#0f172a] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#F3D5D8] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">FortunoAI Finans Mentörü</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold block">● Çevrimiçi Danışman</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="clear-chat-btn"
                  onClick={() => {
                    setChatMessages([CHAT_WELCOME]);
                    api.chat.clear().catch(() => {});
                  }}
                  className="text-slate-400 hover:text-white transition text-xs"
                  title="Sohbeti sıfırla"
                >
                  Temizle
                </button>
                <button id="close-chat-btn" onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Hızlı sorular */}
            <div className={`px-3 pt-2 pb-1 flex gap-2 overflow-x-auto scrollbar-hide ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              {hizliSorular.map((q, i) => (
                <button
                  key={i}
                  id={`quick-q-${i}`}
                  onClick={() => sendQuickQuestion(q)}
                  className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border transition whitespace-nowrap ${dark ? 'bg-[#2A3544] border-[#4B5563] text-[#F3D5D8] hover:bg-[#374151]' : 'bg-[#F3D5D8] border-[#EAD3D7] text-[#4A1525] hover:bg-[#eed0d5]'}`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Mesajlar */}
            <div className={`flex-1 p-4 overflow-y-auto space-y-3 ${dark ? 'bg-slate-900' : 'bg-slate-50/50'}`}>
              {chatMessages.map(msg => (
                <div key={msg.id} className={`chat-bubble flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs font-medium leading-relaxed whitespace-pre-wrap ${msg.sender === 'user'
                      ? 'bg-[#1E293B] text-white rounded-tr-none'
                      : dark
                        ? 'bg-slate-800 text-slate-200 shadow-sm border border-slate-700 rounded-tl-none'
                        : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start chat-bubble">
                  <div className={`shadow-sm border rounded-2xl rounded-tl-none p-3 flex items-center gap-2 ${dark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-400'}`}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-xs">FortunoAI düşünüyor...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className={`p-3 border-t flex gap-2 ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
              <input
                id="chat-input"
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="KOSGEB başvurusu nasıl yapılır?..."
                disabled={isLoading}
                className={`flex-1 p-2.5 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 disabled:opacity-50 transition ${inputCls} ${dark ? 'text-white placeholder-slate-500' : ''}`}
              />
              <button
                id="chat-send-btn"
                type="submit"
                disabled={isLoading || !chatInput.trim()}
                className="bg-[#0f172a] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

        <button
          id="open-chat-btn"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-[#1E293B] text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}