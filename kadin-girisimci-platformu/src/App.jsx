import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import HibeHesaplayici from './components/HibeHesaplayici';
import BasvuruTakip from './components/BasvuruTakip';
import TurkiyeHarita from './components/TurkiyeHarita';
import { GoogleGenAI } from '@google/genai';
import { supportData } from './data';
import {
  Sparkles, DollarSign, ArrowRight, CheckCircle2, MessageSquare, X,
  Building2, ExternalLink, Send, Loader2, BookOpen, Globe, Award,
  Heart, Sun, Moon, ChevronDown, Calendar, Zap, Users, TrendingUp
} from 'lucide-react';

// ─── SYSTEM PROMPT ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Sen 'FortunoAI' adlı bir finansal danışman yapay zekasısın. Türkiye'deki kadın girişimcilere destek sağlayan Fortuno platformu için çalışıyorsun.

Kimliğin:
- Adın FortunoAI, sıcak, samimi ve motive edici bir mentör gibi konuşursun
- Türkçe konuşursun, ağır akademik terimler kullanmazsın
- Kadın girişimcilerin hayallerini gerçekleştirmesine yardımcı olmak için buradasın

Uzmanlık alanların:
- KOSGEB destekleri ve başvuru süreçleri
- TÜBİTAK hibeleri (özellikle 1512 BİGG programı)
- Devlet teşvikleri ve vakıf fonları
- Nakit akışı, maliyet hesabı, amortisman gibi finans konuları (günlük örneklerle açıkla)
- İş planı oluşturma ve girişim aşamaları
- Kadın girişimcilere özel programlar (TKOB, Sabancı Vakfı vb.)

Kurallar:
- Her yanıt özgün ve konuya özel olsun, klişe cümleler kullanma
- Somut, uygulanabilir tavsiyeler ver
- Gerektiğinde KOSGEB/TÜBİTAK başvurusuna yönlendir
- Kısa ve öz yanıtlar ver (maksimum 3-4 paragraf)
- Emojiler kullanabilirsin ama abartma`;

// ─── FALLBACK ────────────────────────────────────────────────────────────────
const getFallbackResponse = (input) => {
  const q = input.toLowerCase();
  if (q.includes('kosgeb')) {
    const cevaplar = [
      'KOSGEB, Türkiye\'deki en kapsamlı girişim destek kuruluşu. Yeni girişimciler için İşletme Geliştirme Desteği\'nde 150.000 TL\'ye kadar hibe mevcut 💜 Başvuru için önce KOSGEB\'e kayıtlı girişimci olman gerekiyor: kosgeb.gov.tr adresinden online başvurabilirsin.',
      'KOSGEB destekleri 3 ana başlıkta toplanıyor: 1) Girişimcilik Destekleri (kuruluş ve kira giderleri), 2) KOBİ Geliştirme Destekleri (yazılım, danışmanlık), 3) Ar-Ge & İnovasyon Destekleri. Hangi aşamadasın, sana en uygununu birlikte bulalım! 🎯',
    ];
    return cevaplar[Math.floor(Math.random() * cevaplar.length)];
  }
  if (q.includes('tubitak') || q.includes('bigg') || q.includes('ar-ge') || q.includes('teknoloji')) {
    return 'TÜBİTAK 1512 BİGG programı teknoloji girişimcileri için muhteşem bir fırsat! ✨ %100 hibe ile 150.000 TL\'ye kadar destek alabilirsin. Koşul: teknoloji tabanlı, ölçeklenebilir bir iş fikrin olması. tubitak.gov.tr üzerinden başvurabilirsin — son başvuru tarihlerini takip etmeyi unutma!';
  }
  if (q.includes('nakit') || q.includes('akış') || q.includes('para') || q.includes('bütçe') || q.includes('maliyet')) {
    return 'Nakit akışını şöyle düşün: Aylık bir market defteri gibi 📒 Giren para (satış, hibe, kredi) eksi çıkan para (kira, maaş, hammadde) = net akış. Bu pozitif olduğu sürece işletmen yaşıyor demektir. İlk 6 ay için en az 3 aylık sabit gideri karşılayacak nakit rezervi bulundurmana tavsiye ederim.';
  }
  if (q.includes('hibe') || q.includes('destek') || q.includes('fon')) {
    return 'Türkiye\'deki başlıca hibe kaynakları şunlar 🌟\n\n1. KOSGEB — Devletin en büyük KOBİ destek fonu\n2. TÜBİTAK — Teknoloji ve Ar-Ge projeleri\n3. TKDK — Kırsal kalkınma hibeleri (AB fonu)\n4. Sabancı Vakfı — Kadın girişimcilere özel\n5. Garanti Girişim — Erken aşama startup desteği\n\nHangi sektördesin? Sana en uygun programı bulalım!';
  }
  if (q.includes('iş planı') || q.includes('plan') || q.includes('strateji')) {
    return 'İş planı yazmak göründüğü kadar zor değil! 📝 Şu 5 bölümü kapsarsan yeterli: 1) Ne satıyorsun? 2) Kime satıyorsun? 3) Rakiplerin kim? 4) Nasıl para kazanacaksın? 5) İlk 1 yıl ne kadar harcayacaksın?\n\nKOSGEB başvurusu için hazır şablonları kosgeb.gov.tr\'den indirebilirsin.';
  }
  if (q.includes('şirket') || q.includes('kur') || q.includes('kurmak') || q.includes('açmak')) {
    return 'Şirket kurmak artık çok kolaylaştı! 🏢 Şahıs şirketi için noter ve vergi dairesine gitmen yeterli — maliyeti yaklaşık 2.000-3.000 TL. Limited şirket için ise 10.000 TL sermaye ve 5-7 iş günü yeterli. E-devlet üzerinden de başlayabilirsin. Hangi şirket türünü düşünüyorsun?';
  }
  if (q.includes('merhaba') || q.includes('selam') || q.includes('hey')) {
    return 'Merhaba! 👋 Ben FortunoAI. Türkiye\'deki kadın girişimcilere hibe, teşvik ve finansal konularda rehberlik ediyorum.\n\nBana şunları sorabilirsin:\n• KOSGEB ve TÜBİTAK hibeleri\n• Nakit akışı ve bütçe planlaması\n• Şirket kurma süreci\n• İş planı hazırlama\n\nNe öğrenmek istersin?';
  }
  if (q.includes('vak') || q.includes('sabancı') || q.includes('tkob')) {
    return 'Kadın girişimcilere özel vakıf destekleri gerçekten değerli! 🌸\n\n• Sabancı Vakfı: "Hibe Programı" ile sosyal girişimlere 50.000 TL\'ye kadar\n• TKOB (Türkiye Kadın Girişimciler Derneği): Mentorluk + ağ desteği\n• Turkcell Kadın Kooperatifleri Fonu: Dijital dönüşüm hibeleri\n\nBu programların başvuru dönemleri değişiyor, takipte kal!';
  }
  const genel = [
    'Harika bir soru! 🤔 Sana en doğru bilgiyi verebilmek için biraz daha detay lazım. Hangi sektördesin ve girişiminin şu anki aşaması nedir?',
    'Bu konuda sana yardımcı olmak isterim! Girişiminin sektörünü ve neye ihtiyaç duyduğunu (hibe mi, finansman mı, mentorluk mu?) belirtirsen daha spesifik yönlendirebilirim. 💪',
    'Doğru yoldasın! Türkiye\'de kadın girişimciler için harika fırsatlar var. KOSGEB, TÜBİTAK veya özel vakıf desteklerinden hangisi seni daha çok ilgilendiriyor?',
  ];
  return genel[Math.floor(Math.random() * genel.length)];
};

// ─── KAYNAKÇA ────────────────────────────────────────────────────────────────
const kaynakca = [
  { kurum: 'KOSGEB', grad: 'linear-gradient(135deg,#2563eb,#1d4ed8)', aciklama: 'Küçük ve Orta Ölçekli İşletmeleri Geliştirme ve Destekleme İdaresi — girişimcilik, Ar-Ge ve KOBİ destekleri', link: 'https://www.kosgeb.gov.tr', etiket: 'Devlet Kurumu' },
  { kurum: 'TÜBİTAK 1512 BİGG', grad: 'linear-gradient(135deg,#7c3aed,#6d28d9)', aciklama: 'Teknoloji tabanlı girişimlere %100 hibe ile 150.000 TL\'ye kadar destek — üniversite öğrencileri ve mezunları öncelikli', link: 'https://www.tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari/icerik-1512', etiket: 'Ar-Ge Hibesi' },
  { kurum: 'TKDK — IPARD', grad: 'linear-gradient(135deg,#059669,#047857)', aciklama: 'AB destekli kırsal kalkınma hibeleri — tarım, hayvancılık ve agro-turizm projelerine %50\'ye kadar hibe', link: 'https://www.tkdk.gov.tr', etiket: 'AB Fonu' },
  { kurum: 'Sabancı Vakfı', grad: 'linear-gradient(135deg,#db2777,#be185d)', aciklama: 'Kadın girişimcilere ve sosyal etki projelerine özel hibe programları — mentorluk ve ağ desteği dahil', link: 'https://www.sabancivakfi.org', etiket: 'Vakıf' },
  { kurum: 'Garanti BBVA Girişim', grad: 'linear-gradient(135deg,#f97316,#ea580c)', aciklama: 'Erken aşama startup\'lara yatırım ve mentorluk — teknoloji ve fintech odaklı girişimler öncelikli', link: 'https://www.garantibbvagirisim.com', etiket: 'Özel Fon' },
  { kurum: 'TKOB', grad: 'linear-gradient(135deg,#e11d48,#be123c)', aciklama: 'Türkiye Kadın Girişimciler Derneği — eğitim, mentorluk, network ve hibe programları', link: 'https://www.tkob.org.tr', etiket: 'STK' },
];

// ─── BAŞVURU TAKVİMİ ─────────────────────────────────────────────────────────
// badgeStyle: inline style objesi (Tailwind v4 dinamik class yerine)
const basvuruTakvimi = [
  { ay: 'Ağustos 2025', program: 'KOSGEB Girişimci Desteği – 3. Dönem', durum: 'yaklaşıyor', badgeStyle: { color: '#92400e', background: '#fffbeb', borderColor: '#fcd34d' }, kurum: 'KOSGEB' },
  { ay: 'Eylül 2025', program: 'TÜBİTAK BİGG – Sonbahar Çağrısı', durum: 'yaklaşıyor', badgeStyle: { color: '#5b21b6', background: '#f5f3ff', borderColor: '#c4b5fd' }, kurum: 'TÜBİTAK' },
  { ay: 'Ekim 2025', program: 'Sabancı Vakfı Hibe Programı', durum: 'yaklaşıyor', badgeStyle: { color: '#9d174d', background: '#fdf2f8', borderColor: '#fbcfe8' }, kurum: 'Sabancı Vakfı' },
  { ay: 'Kasım 2025', program: 'TKDK IPARD – Kış Başvuru Dönemi', durum: 'yaklaşıyor', badgeStyle: { color: '#065f46', background: '#ecfdf5', borderColor: '#6ee7b7' }, kurum: 'TKDK' },
  { ay: 'Ocak 2026', program: 'Ticaret Bakanlığı E-İhracat Desteği', durum: 'planlanıyor', badgeStyle: { color: '#1e40af', background: '#eff6ff', borderColor: '#bfdbfe' }, kurum: 'Ticaret Bakanlığı' },
  { ay: 'Şubat 2026', program: 'Ashoka Türkiye Sosyal Girişim Çağrısı', durum: 'planlanıyor', badgeStyle: { color: '#3730a3', background: '#eef2ff', borderColor: '#c7d2fe' }, kurum: 'Ashoka' },
];

// ─── FAQ VERİSİ ───────────────────────────────────────────────────────────────
const faqVerisi = [
  { soru: 'KOSGEB\'e kimler başvurabilir?', cevap: 'KOSGEB\'e Türkiye\'de kurulu, 250 kişiden az istihdam eden ve yıllık net satış hasılatı 500 milyon TL\'yi aşmayan tüm KOBİ\'ler başvurabilir. Kadın girişimciler birçok programda ek puan avantajına sahiptir.' },
  { soru: 'TÜBİTAK BİGG için mutlaka şirket kurmam gerekiyor mu?', cevap: 'Ön başvuruda şirket gerekmez; ancak kazandığınızda destekten yararlanabilmek için şirket kurmanız istenir. TÜBİTAK bu süreçte size destek sağlar.' },
  { soru: 'Aynı anda birden fazla hibeden yararlanabilir miyim?', cevap: 'Evet! KOSGEB, TÜBİTAK ve vakıf destekleri çoğunlukla birbirini tamamlar. Ancak aynı gider kalemi için iki farklı destekten yararlanamayacağınızı unutmayın. Bir danışman ile portföyünüzü planlamak önerilir.' },
  { soru: 'Hibe mi, kredi mi tercih etmeliyim?', cevap: 'Mümkünse önce hibeler — geri ödemesiz oldukları için risksiz. Ancak hibe almak zaman alabilir. Kredi, hızlı başlangıç için idealdir; özellikle 6 ay ödemesiz Halkbank Genç Girişimci Kredisi başlangıç için çok uygun.' },
  { soru: 'Kaç günde başvuru sonuçlanır?', cevap: 'KOSGEB değerlendirmeleri ortalama 45-90 gün sürer. TÜBİTAK BİGG paneli ise yılda 2-3 kez toplanır. Sabancı Vakfı gibi vakıf programları 60-120 gün içinde sonuçlanır.' },
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
function AnimatedCounter({ target, suffix = '', duration = 1800 }) {
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
          else setVal(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref} className="stat-num">{val.toLocaleString('tr-TR')}{suffix}</span>;
}

// ─── HIZLI SORULAR ────────────────────────────────────────────────────────────
const hizliSorular = [
  'KOSGEB\'e nasıl başvurabilirim?',
  'TÜBİTAK BİGG nedir?',
  'Şirket kurmak zorunda mıyım?',
  'Kadınlara özel hibeler neler?',
];

// ─── LOGO SVG ─────────────────────────────────────────────────────────────────
function FortunoLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Fortuno Logo">
      <rect width="36" height="36" rx="10" fill="url(#logoGrad)" />
      <path d="M10 12h16M10 18h10M10 24h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="27" cy="22" r="5" fill="white" fillOpacity="0.25" />
      <path d="M24.5 22l2 2 3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ANA COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('fortuno-dark') === 'true'; } catch { return false; }
  });
  const [sektor, setSektor] = useState('');
  const [profil, setProfil] = useState('');
  const [asama, setAsama] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('sihirbaz'); // sihirbaz | kaynakca | hesaplayici | takip | harita | favoriler
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fortuno-favs') || '[]'); } catch { return []; }
  });
  const [heartPoppingId, setHeartPoppingId] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [kurumFilter, setKurumFilter] = useState('Tümü');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('fortuno-chat');
      return saved ? JSON.parse(saved) : [
        { id: 1, sender: 'bot', text: 'Merhaba! 👋 Ben FortunoAI. Türkiye\'deki kadın girişimcilere hibe, teşvik ve finansal konularda rehberlik ediyorum. Sana nasıl yardımcı olabilirim?' }
      ];
    } catch {
      return [{ id: 1, sender: 'bot', text: 'Merhaba! 👋 Ben FortunoAI. Nasıl yardımcı olabilirim?' }];
    }
  });
  const chatEndRef = useRef(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('fortuno-dark', String(dark)); } catch { }
  }, [dark]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  useEffect(() => {
    try { localStorage.setItem('fortuno-chat', JSON.stringify(chatMessages.slice(-40))); } catch { }
  }, [chatMessages]);

  useEffect(() => {
    try { localStorage.setItem('fortuno-favs', JSON.stringify(favorites)); } catch { }
  }, [favorites]);

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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleFav = useCallback((id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    setHeartPoppingId(id);
    setTimeout(() => setHeartPoppingId(null), 350);
  }, []);

  const handleFindSupport = (e) => {
    e.preventDefault();
    if (!sektor || !profil || !asama) return;
    setIsSkeletonLoading(true);
    setHasSearched(false);
    setTimeout(() => {
      const results = supportData.filter(item =>
        item.tags.includes(sektor) && item.tags.includes(profil) && item.tags.includes(asama)
      );
      setFilteredResults(results);
      setHasSearched(true);
      setIsSkeletonLoading(false);
      if (results.length > 0) {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 3000);
      }
    }, 1400);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
    const currentInput = chatInput;
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    try {
      if (!apiKey || apiKey === 'buraya_api_keyini_yaz') throw new Error('no_key');
      const ai = new GoogleGenAI({ apiKey });
      const history = chatMessages
        .filter(msg => msg.id !== 1)
        .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
      const chat = ai.chats.create({ model: 'gemini-2.0-flash', system: SYSTEM_PROMPT, history });
      const response = await chat.sendMessage({ message: currentInput });
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response.text }]);
    } catch {
      const fallback = getFallbackResponse(currentInput);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: fallback }]);
        setIsLoading(false);
      }, 700);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const sendQuickQuestion = useCallback((q) => {
    if (isLoading) return;
    const userMsg = { id: Date.now(), sender: 'user', text: q };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const runQuery = async () => {
      try {
        if (!apiKey || apiKey === 'buraya_api_keyini_yaz') throw new Error('no_key');
        const ai = new GoogleGenAI({ apiKey });
        const chat = ai.chats.create({ model: 'gemini-2.0-flash', system: SYSTEM_PROMPT, history: [] });
        const response = await chat.sendMessage({ message: q });
        setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response.text }]);
        setIsLoading(false);
      } catch {
        const fallback = getFallbackResponse(q);
        setTimeout(() => {
          setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: fallback }]);
          setIsLoading(false);
        }, 700);
      }
    };
    runQuery();
  }, [isLoading]);

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

  // Renk sınıfları (dark mode)
  const bg = dark ? 'bg-[#0d1117]' : 'bg-[#f8fafc]';
  const card = dark ? 'bg-[#1c2333] border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-[#0f172a]';
  const text = dark ? 'text-slate-100' : 'text-[#0f172a]';
  const subtext = dark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = dark
    ? 'bg-slate-800 border-slate-600 text-white focus:ring-purple-400'
    : 'bg-slate-50 border-slate-200 focus:ring-purple-500';

  // ── Sections ─────────────────────────────────────────────────────────────
  const showSihirbaz    = activeSection === 'sihirbaz';
  const showFavoriler   = activeSection === 'favoriler';
  const showKaynakca    = activeSection === 'kaynakca';
  const showHesaplayici = activeSection === 'hesaplayici';
  const showTakip       = activeSection === 'takip';
  const showHarita      = activeSection === 'harita';

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${bg} ${text} font-sans transition-colors duration-300`}>
      <Confetti active={confettiActive} />

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav className="bg-[#0f172a] text-white py-4 px-6 shadow-xl sticky top-0 z-40 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FortunoLogo />
            <div>
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
                FORTUNO
              </span>
              <span className="text-xs block text-purple-300 font-medium tracking-widest -mt-1">WOMEN TECH AI</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-slate-300 overflow-x-auto">
            {[
              { id: 'sihirbaz',    label: '🧭 Sihirbaz' },
              { id: 'hesaplayici', label: '🧮 Hesaplayıcı' },
              { id: 'harita',      label: '🗺️ Harita' },
              { id: 'takip',       label: '📋 Takip' },
              { id: 'kaynakca',    label: '📚 Kaynakça' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeSection === id
                    ? 'bg-purple-600 text-white'
                    : 'hover:text-white hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
            {favorites.length > 0 && (
              <button
                id="nav-favs"
                onClick={() => setActiveSection('favoriler')}
                className={`shrink-0 px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  activeSection === 'favoriler' ? 'bg-pink-600 text-white' : 'hover:text-white hover:bg-slate-700'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                Favoriler
                <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{favorites.length}</span>
              </button>
            )}
            <div className="w-px h-5 bg-slate-600 mx-1 shrink-0" />
            <button
              id="dark-mode-toggle"
              onClick={() => setDark(d => !d)}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition shrink-0"
              aria-label="Karanlık mod"
            >
              {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
            <span className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black">
              v2026
            </span>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <header className={`${dark ? 'hero-bg-dark' : 'hero-bg-light'} px-4 pt-16 pb-12`}>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className={`hero-title text-4xl md:text-5xl font-black tracking-tight mb-4 ${dark ? 'text-white' : 'text-[#0f172a]'}`}>
            Girişimci Kadınlar İçin Akıllı{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Finans ve Hibe</span>{' '}
            Eşleştirme Platformu
          </h1>
          <p className={`hero-subtitle text-lg max-w-2xl mx-auto font-medium mb-10 ${subtext}`}>
            Karmaşık formlarla, ağır akademik finans terimleriyle uğraşmayın. 3 adımda size en uygun devlet teşviklerini, vakıf fonlarını listeleyin.
          </p>

          {/* Stats Banner */}
          <div className="hero-stats flex flex-wrap justify-center gap-6 md:gap-12">
            {[
              { icon: <DollarSign className="w-5 h-5" />, label: 'Toplam Hibe Havuzu', value: 5200000, suffix: ' TL+' },
              { icon: <Users className="w-5 h-5" />, label: 'Desteklenen Program', value: 10, suffix: '+' },
              { icon: <TrendingUp className="w-5 h-5" />, label: 'Kadın Girişimci', value: 47000, suffix: '+' },
              { icon: <Zap className="w-5 h-5" />, label: 'Eşleşme Süresi', value: 3, suffix: ' Adım' },
            ].map((stat, i) => (
              <div key={i} className={`flex flex-col items-center ${dark ? 'text-slate-200' : 'text-[#0f172a]'}`}>
                <div className="flex items-center gap-1 text-purple-500 mb-1">{stat.icon}</div>
                <span className="text-2xl font-black">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </span>
                <span className={`text-xs font-semibold ${subtext}`}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── ANA İÇERİK ─────────────────────────────────────────────────────── */}
      {showSihirbaz ? (
        <main className="max-w-6xl mx-auto px-4 mt-12 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sol Kolon: Form */}
          <div className={`lg:col-span-1 ${card} p-6 rounded-2xl shadow-xl border h-fit`}>
            <div className={`flex items-center gap-2 mb-6 pb-3 border-b ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
              <Building2 className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold">Destek Sihirbazı</h2>
            </div>
            <form onSubmit={handleFindSupport} className="space-y-6">
              {[
                {
                  label: '1. Ne Tür Bir İş Kurmak Veya Büyütmek İstiyorsunuz?',
                  value: sektor, setter: setSektor, id: 'sektor-select',
                  options: [
                    ['', 'Sektör Seçiniz...'],
                    ['ev_emegi', 'Ev Emeği & Mikro Üretim (Şirketsiz)'],
                    ['yerel_isletme', 'Yerel İşletme (Kafe, Butik, Salon, Hizmet)'],
                    ['teknoloji', 'Teknoloji (Yazılım, Mobil Uygulama, Ar-Ge)'],
                    ['e_ticaret', 'E-Ticaret & Global İhracat'],
                    ['kooperatif', 'Kadın Kooperatifleri & Ortak Yerel Üretim'],
                    ['sosyal_girisim', 'Sosyal Girişim (Toplumsal Fayda & Çevre)'],
                    ['kırsal', 'Kırsal Alan / Tarım, Hayvancılık & Turizm'],
                  ],
                },
                {
                  label: '2. Yaşınız ve Eğitim Durumunuz Nedir?',
                  value: profil, setter: setProfil, id: 'profil-select',
                  options: [
                    ['', 'Profil Seçiniz...'],
                    ['genc_girisimci', 'Genç Girişimci (18-35 yaş arası veya Üni Mezunu/Öğrencisi)'],
                    ['standart', 'Standart Profil (35 yaş üstü girişimci kadınlar)'],
                  ],
                },
                {
                  label: '3. Girişiminizin Şu Anki Durumu Nedir?',
                  value: asama, setter: setAsama, id: 'asama-select',
                  options: [
                    ['', 'Aşama Seçiniz...'],
                    ['fikir', 'Fikir Aşaması (Şirket henüz kurulmadı)'],
                    ['yeni_kurulmus', 'Yeni Kurulmuş (Son 1 yıl içinde resmi açılış yapıldı)'],
                  ],
                },
              ].map(({ label, value, setter, id, options }) => (
                <div key={id}>
                  <label htmlFor={id} className={`block text-sm font-bold mb-2 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>
                  <select
                    id={id}
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className={`w-full p-3 border rounded-xl font-medium text-sm focus:outline-none focus:ring-2 transition ${inputCls} ${dark ? 'text-white' : ''}`}
                    required
                  >
                    {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                  </select>
                </div>
              ))}
              <button
                id="find-support-btn"
                type="submit"
                disabled={isSkeletonLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition disabled:opacity-70"
              >
                {isSkeletonLoading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Aranıyor...</>
                  : <>Uygun Teşvikleri Bul <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>

            {/* FAQ Accordion */}
            <div className={`mt-8 pt-6 border-t ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h3 className="font-bold text-sm mb-3 text-purple-500 flex items-center gap-1">
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

          {/* Sağ Kolon: Sonuçlar */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`${card} p-6 rounded-2xl shadow-xl border min-h-[460px]`}>
              <h3 className="text-xl font-bold mb-6 pb-3 border-b border-slate-100/20 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Eşleşen Finansal Destekler ve Teşvik Paketleri
                {hasSearched && filteredResults.length > 0 && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                    {filteredResults.length} sonuç
                  </span>
                )}
              </h3>

              {/* Kurum Filtrele */}
              {hasSearched && filteredResults.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {kurumlar.map(k => (
                    <button
                      key={k}
                      id={`filter-${k.replace(/\s/g, '-')}`}
                      onClick={() => setKurumFilter(k)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${kurumFilter === k
                          ? 'bg-purple-600 text-white border-purple-600'
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(n => <SkeletonCard key={n} dark={dark} />)}
                </div>
              ) : !hasSearched ? (
                <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <p className={`font-medium ${subtext}`}>
                    Soldaki sihirbazı kullanarak kriterlerinizi girin, FortunoAI arka plandaki tüm devlet ve vakıf veritabanını tarasın.
                  </p>
                </div>
              ) : displayedResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
                  <p className="text-red-500 font-bold mb-2">Tam Birebir Eşleşen Paket Bulunamadı.</p>
                  <p className={`text-sm max-w-sm ${subtext}`}>
                    Girdiğiniz kriter kombinasyonuna ait hibe paketi bulunamadı. Lütfen chatbot mentörümüz FortunoAI'a danışarak KOSGEB veya TÜBİTAK detaylarını öğrenin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedResults.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`card-animate border p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition group ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">{item.institution}</span>
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
                                className={`w-4 h-4 transition ${favorites.includes(item.id) ? 'text-pink-500 fill-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
                              />
                            </button>
                          </div>
                        </div>
                        <h4 className={`font-extrabold text-base mb-2 group-hover:text-purple-500 transition ${dark ? 'text-slate-100' : 'text-[#0f172a]'}`}>{item.title}</h4>
                        <p className={`text-xs line-clamp-3 mb-4 leading-relaxed ${subtext}`}>{item.description}</p>
                      </div>
                      <div>
                        <div className={`${dark ? 'bg-emerald-900/30 border-emerald-700/40' : 'bg-emerald-50 border-emerald-200/60'} border p-2.5 rounded-lg mb-3 flex items-center justify-between`}>
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-emerald-400' : 'text-emerald-800'}`}>Destek Limiti:</span>
                          <span className="text-base font-black text-[#22c55e] flex items-center gap-0.5">
                            <DollarSign className="w-4 h-4 -mt-0.5" /> {item.amount}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

      ) : showFavoriler ? (
        /* ── FAVORİLER ──────────────────────────────────────────────────────── */
        <main className="max-w-6xl mx-auto px-4 mt-12 pb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Heart className="w-4 h-4 fill-pink-500" /> Favori Programlarınız
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
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">{item.institution}</span>
                      <button onClick={() => toggleFav(item.id)} className="p-1">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                      </button>
                    </div>
                    <h4 className="font-extrabold text-base mb-2">{item.title}</h4>
                    <p className={`text-xs leading-relaxed mb-4 ${subtext}`}>{item.description}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200/60 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase">Destek Limiti:</span>
                    <span className="text-base font-black text-[#22c55e] flex items-center gap-0.5">
                      <DollarSign className="w-4 h-4" /> {item.amount}
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
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
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
              <Calendar className="w-5 h-5 text-purple-500" />
              Başvuru Takvimi — 2025/2026
            </h3>
            <div className="space-y-3">
              {basvuruTakvimi.map((item, i) => (
                <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className="text-xs font-black px-3 py-1 rounded-full shrink-0"
                      style={{
                        color: item.badgeStyle.color,
                        background: item.badgeStyle.background,
                        border: `1px solid ${item.badgeStyle.borderColor}`,
                      }}
                    >
                      {item.ay}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{item.program}</p>
                      <p className={`text-xs ${subtext}`}>{item.kurum}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${item.durum === 'yaklaşıyor' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.durum === 'yaklaşıyor' ? '⏰ Yaklaşıyor' : '📅 Planlanıyor'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alt bilgi */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center shadow-xl">
            <Award className="w-10 h-10 mx-auto mb-3 opacity-90" />
            <h3 className="text-2xl font-black mb-2">Hangi Destek Size Uygun?</h3>
            <p className="text-purple-100 mb-5 max-w-lg mx-auto">Kafanız karıştıysa endişelenmeyin! FortunoAI sizi 3 basit soruyla en uygun programa yönlendirir.</p>
            <button id="goto-sihirbaz-btn" onClick={() => setActiveSection('sihirbaz')}
              className="bg-white text-purple-700 font-black px-8 py-3 rounded-xl hover:bg-purple-50 transition shadow-lg">
              Destek Sihirbazını Başlat →
            </button>
          </div>
        </main>
      ) : null}

      {/* ── HİBE HESAPLAYICI ──────────────────────────────────────────────── */}
      {showHesaplayici && (
        <main className="max-w-4xl mx-auto px-4 mt-12 pb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              🧮 Finansal Araç
            </div>
            <h2 className={`text-3xl font-black mb-3 ${dark ? 'text-white' : 'text-[#0f172a]'}`}>Hibe Hesaplayıcı</h2>
            <p className={`max-w-xl mx-auto text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              3 adımda girişiminize uygun toplam hibe potansiyelinizi öğrenin.
            </p>
          </div>
          <HibeHesaplayici dark={dark} />
        </main>
      )}

      {/* ── BAŞVURU TAKİP ─────────────────────────────────────────────────── */}
      {showTakip && (
        <main className="max-w-7xl mx-auto px-4 mt-12 pb-24">
          <BasvuruTakip dark={dark} />
        </main>
      )}

      {/* ── TÜRKİYE HARİTASI ──────────────────────────────────────────────── */}
      {showHarita && (
        <main className="max-w-7xl mx-auto px-4 mt-12 pb-24">
          <TurkiyeHarita dark={dark} />
        </main>
      )}

      {/* ── CHATBOT ──────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className={`w-[340px] md:w-[380px] h-[520px] rounded-2xl shadow-2xl border mb-4 flex flex-col overflow-hidden ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            {/* Chat header */}
            <div className="bg-[#0f172a] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
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
                    setChatMessages([{ id: 1, sender: 'bot', text: 'Merhaba! 👋 Ben FortunoAI. Nasıl yardımcı olabilirim?' }]);
                    try { localStorage.removeItem('fortuno-chat'); } catch { }
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
                  className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border transition whitespace-nowrap ${dark ? 'bg-slate-700 border-slate-600 text-purple-300 hover:bg-slate-600' : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'}`}
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
                      ? 'bg-purple-600 text-white rounded-tr-none'
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
          className="bg-gradient-to-tr from-purple-600 via-purple-700 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}