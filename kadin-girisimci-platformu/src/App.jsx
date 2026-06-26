import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { supportData } from './data';
import { Sparkles, DollarSign, ArrowRight, CheckCircle2, MessageSquare, X, Building2, ExternalLink, Send, Loader2, BookOpen, Globe, Award } from 'lucide-react';

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

// Akıllı fallback cevap sistemi — API çalışmadığında devreye girer
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

  if (q.includes('merhaba') || q.includes('selam') || q.includes('merhaba') || q.includes('hey')) {
    return 'Merhaba! 👋 Ben FortunoAI. Türkiye\'deki kadın girişimcilere hibe, teşvik ve finansal konularda rehberlik ediyorum.\n\nBana şunları sorabilirsin:\n• KOSGEB ve TÜBİTAK hibeleri\n• Nakit akışı ve bütçe planlaması\n• Şirket kurma süreci\n• İş planı hazırlama\n\nNe öğrenmek istersin?';
  }

  if (q.includes('vak') || q.includes('sabancı') || q.includes('tkob')) {
    return 'Kadın girişimcilere özel vakıf destekleri gerçekten değerli! 🌸\n\n• Sabancı Vakfı: "Hibe Programı" ile sosyal girişimlere 50.000 TL\'ye kadar\n• TKOB (Türkiye Kadın Girişimciler Derneği): Mentorluk + ağ desteği\n• Turkcell Kadın Kooperatifleri Fonu: Dijital dönüşüm hibeleri\n\nBu programların başvuru dönemleri değişiyor, takipte kal!';
  }

  // Genel fallback
  const genel = [
    'Harika bir soru! 🤔 Sana en doğru bilgiyi verebilmek için biraz daha detay lazım. Hangi sektördesin ve girişiminin şu anki aşaması nedir?',
    'Bu konuda sana yardımcı olmak isterim! Girişiminin sektörünü ve neye ihtiyaç duyduğunu (hibe mi, finansman mı, mentorluk mu?) belirtirsen daha spesifik yönlendirebilirim. 💪',
    'Doğru yoldasın! Türkiye\'de kadın girişimciler için harika fırsatlar var. KOSGEB, TÜBİTAK veya özel vakıf desteklerinden hangisi seni daha çok ilgilendiriyor?',
  ];
  return genel[Math.floor(Math.random() * genel.length)];
};

// Resmi Kaynakça verileri
const kaynakca = [
  {
    kurum: 'KOSGEB',
    renk: 'from-blue-600 to-blue-700',
    aciklama: 'Küçük ve Orta Ölçekli İşletmeleri Geliştirme ve Destekleme İdaresi — girişimcilik, Ar-Ge ve KOBİ destekleri',
    link: 'https://www.kosgeb.gov.tr',
    etiket: 'Devlet Kurumu',
  },
  {
    kurum: 'TÜBİTAK 1512 BİGG',
    renk: 'from-purple-600 to-purple-700',
    aciklama: 'Teknoloji tabanlı girişimlere %100 hibe ile 150.000 TL\'ye kadar destek — üniversite öğrencileri ve mezunları öncelikli',
    link: 'https://www.tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari/icerik-1512',
    etiket: 'Ar-Ge Hibesi',
  },
  {
    kurum: 'TKDK — IPARD',
    renk: 'from-emerald-600 to-emerald-700',
    aciklama: 'AB destekli kırsal kalkınma hibeleri — tarım, hayvancılık ve agro-turizm projelerine %50\'ye kadar hibe',
    link: 'https://www.tkdk.gov.tr',
    etiket: 'AB Fonu',
  },
  {
    kurum: 'Sabancı Vakfı',
    renk: 'from-pink-600 to-pink-700',
    aciklama: 'Kadın girişimcilere ve sosyal etki projelerine özel hibe programları — mentorluk ve ağ desteği dahil',
    link: 'https://www.sabancivakfi.org',
    etiket: 'Vakıf',
  },
  {
    kurum: 'Garanti BBVA Girişim',
    renk: 'from-orange-500 to-orange-600',
    aciklama: 'Erken aşama startup\'lara yatırım ve mentorluk — teknoloji ve fintech odaklı girişimler öncelikli',
    link: 'https://www.garantibbvagirisim.com',
    etiket: 'Özel Fon',
  },
  {
    kurum: 'TKOB',
    renk: 'from-rose-600 to-rose-700',
    aciklama: 'Türkiye Kadın Girişimciler Derneği — eğitim, mentorluk, network ve hibe programları',
    link: 'https://www.tkob.org.tr',
    etiket: 'STK',
  },
];

export default function App() {
  const [sektor, setSektor] = useState('');
  const [profil, setProfil] = useState('');
  const [asama, setAsama] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeSection, setActiveSection] = useState('sihirbaz'); // 'sihirbaz' | 'kaynakca'

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Merhaba! 👋 Ben FortunoAI. Türkiye\'deki kadın girişimcilere hibe, teşvik ve finansal konularda rehberlik ediyorum. Sana nasıl yardımcı olabilirim?' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const handleFindSupport = (e) => {
    e.preventDefault();
    if (!sektor || !profil || !asama) return;
    const results = supportData.filter(item =>
      item.tags.includes(sektor) && item.tags.includes(profil) && item.tags.includes(asama)
    );
    setFilteredResults(results);
    setHasSearched(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
    const currentInput = chatInput;
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Gemini API dene, başarısız olursa akıllı fallback kullan
    try {
      if (!apiKey || apiKey === 'buraya_api_keyini_yaz') throw new Error('no_key');

      const ai = new GoogleGenAI({ apiKey });
      const history = chatMessages
        .filter(msg => msg.id !== 1)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

      const chat = ai.chats.create({
        model: 'gemini-2.0-flash',
        system: SYSTEM_PROMPT,
        history,
      });

      const response = await chat.sendMessage({ message: currentInput });
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response.text }]);
    } catch {
      // API çalışmıyorsa akıllı fallback devreye girer
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans">

      {/* NAVBAR */}
      <nav className="bg-[#0f172a] text-white py-4 px-6 shadow-xl sticky top-0 z-40 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">FORTUNO</span>
              <span className="text-xs block text-purple-300 font-medium tracking-widest -mt-1">WOMEN TECH AI</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-300">
            <button
              onClick={() => setActiveSection('sihirbaz')}
              className={`hover:text-white transition cursor-pointer ${activeSection === 'sihirbaz' ? 'text-white' : ''}`}
            >
              Destek Sihirbazı
            </button>
            <button
              onClick={() => setActiveSection('kaynakca')}
              className={`hover:text-white transition cursor-pointer ${activeSection === 'kaynakca' ? 'text-white' : ''}`}
            >
              Resmi Kaynakça
            </button>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-md">Hackathon Panel v2026</span>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-5xl mx-auto text-center mt-12 px-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0f172a] mb-4">
          Girişimci Kadınlar İçin Akıllı <span className="text-purple-600">Finans ve Hibe</span> Eşleştirme Platformu
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
          Karmaşık formlarla, ağır akademik finans terimleriyle uğraşmayın. 3 adımda size en uygun devlet teşviklerini, vakıf fonlarını listeleyin.
        </p>
      </header>

      {/* ANA İÇERİK */}
      {activeSection === 'sihirbaz' ? (
        <main className="max-w-6xl mx-auto px-4 mt-12 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* SOL KOLON: FORM */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 h-fit">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-[#0f172a]">Destek Sihirbazı</h2>
            </div>
            <form onSubmit={handleFindSupport} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">1. Ne Tür Bir İş Kurmak Veya Büyütmek İstiyorsunuz?</label>
                <select value={sektor} onChange={(e) => setSektor(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                  <option value="">Sektör Seçiniz...</option>
                  <option value="ev_emegi">Ev Emeği & Mikro Üretim (Şirketsiz)</option>
                  <option value="yerel_isletme">Yerel İşletme (Kafe, Butik, Salon, Hizmet)</option>
                  <option value="teknoloji">Teknoloji (Yazılım, Mobil Uygulama, Ar-Ge)</option>
                  <option value="e_ticaret">E-Ticaret & Global İhracat</option>
                  <option value="kooperatif">Kadın Kooperatifleri & Ortak Yerel Üretim</option>
                  <option value="sosyal_girisim">Sosyal Girişim (Toplumsal Fayda & Çevre)</option>
                  <option value="kırsal">Kırsal Alan / Tarım, Hayvancılık & Turizm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">2. Yaşınız ve Eğitim Durumunuz Nedir?</label>
                <select value={profil} onChange={(e) => setProfil(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                  <option value="">Profil Seçiniz...</option>
                  <option value="genc_girisimci">Genç Girişimci (18-35 yaş arası veya Üni Mezunu/Öğrencisi)</option>
                  <option value="standart">Standart Profil (35 yaş üstü girişimci kadınlar)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">3. Girişiminizin Şu Anki Durumu Nedir?</label>
                <select value={asama} onChange={(e) => setAsama(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                  <option value="">Aşama Seçiniz...</option>
                  <option value="fikir">Fikir Aşaması (Şirket henüz kurulmadı)</option>
                  <option value="yeni_kurulmus">Yeni Kurulmuş (Son 1 yıl içinde resmi açılış yapıldı)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition">
                Uygun Teşvikleri Bul <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* SAĞ KOLON: SONUÇLAR */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 min-h-[460px]">
              <h3 className="text-xl font-bold text-[#0f172a] mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Eşleşen Finansal Destekler ve Teşvik Paketleri
              </h3>
              {!hasSearched ? (
                <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 font-medium">Soldaki sihirbazı kullanarak kriterlerinizi girin, FortunoAI arka plandaki tüm devlet ve vakıf veritabanını tarasın.</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
                  <p className="text-red-500 font-bold mb-2">Tam Birebir Eşleşen Paket Bulunamadı.</p>
                  <p className="text-slate-500 text-sm max-w-sm">Girdiğiniz kriter kombinasyonuna ait hibe paketi bulunamadı. Lütfen chatbot mentörümüz FortunoAI'a danışarak KOSGEB veya TÜBİTAK detaylarını öğrenin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredResults.map((item) => (
                    <div key={item.id} className="border border-slate-100 bg-slate-50/50 p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition group">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">{item.institution}</span>
                          <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{item.type}</span>
                        </div>
                        <h4 className="font-extrabold text-base text-[#0f172a] mb-2 group-hover:text-purple-600 transition">{item.title}</h4>
                        <p className="text-slate-600 text-xs line-clamp-3 mb-4 leading-relaxed">{item.description}</p>
                      </div>
                      <div>
                        <div className="bg-emerald-50 border border-emerald-200/60 p-2.5 rounded-lg mb-3 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Destek Limiti:</span>
                          <span className="text-base font-black text-[#22c55e] flex items-center gap-0.5">
                            <DollarSign className="w-4 h-4 -mt-0.5" /> {item.amount}
                          </span>
                        </div>
                        <a href={item.link} target="_blank" rel="noreferrer" className="w-full bg-white text-slate-700 text-xs font-bold py-2 px-3 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-50 transition">
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
      ) : (
        /* RESMİ KAYNAKÇA BÖLÜMÜ */
        <main className="max-w-6xl mx-auto px-4 mt-12 pb-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <BookOpen className="w-4 h-4" />
              Güncel & Doğrulanmış Kaynaklar
            </div>
            <h2 className="text-3xl font-black text-[#0f172a] mb-3">Resmi Hibe ve Destek Kaynakları</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Türkiye'deki kadın girişimciler için resmi hibe, teşvik ve destek programlarının kaynakları. Tüm linkler doğrudan resmi kurum sitelerine yönlendirir.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kaynakca.map((k, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className={`bg-gradient-to-r ${k.renk} p-5`}>
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-black text-lg">{k.kurum}</h3>
                    <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-md">{k.etiket}</span>
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">{k.aciklama}</p>
                  <a
                    href={k.link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-2.5 px-4 rounded-xl border border-slate-200 transition"
                  >
                    <Globe className="w-4 h-4" />
                    Resmi Siteye Git
                    <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Alt bilgi kartı */}
          <div className="mt-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center shadow-xl">
            <Award className="w-10 h-10 mx-auto mb-3 opacity-90" />
            <h3 className="text-2xl font-black mb-2">Hangi Destek Size Uygun?</h3>
            <p className="text-purple-100 mb-5 max-w-lg mx-auto">Kafanız karıştıysa endişelenmeyin! FortunoAI sizi 3 basit soruyla en uygun programa yönlendirir.</p>
            <button
              onClick={() => setActiveSection('sihirbaz')}
              className="bg-white text-purple-700 font-black px-8 py-3 rounded-xl hover:bg-purple-50 transition shadow-lg"
            >
              Destek Sihirbazını Başlat →
            </button>
          </div>
        </main>
      )}

      {/* CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white w-[340px] md:w-[380px] h-[480px] rounded-2xl shadow-2xl border border-slate-200/80 mb-4 flex flex-col overflow-hidden">
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
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs font-medium leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-400 shadow-sm border border-slate-100 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-xs">FortunoAI düşünüyor...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="KOSGEB başvurusu nasıl yapılır?..."
                disabled={isLoading}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !chatInput.trim()}
                className="bg-[#0f172a] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-gradient-to-tr from-purple-600 via-purple-700 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center">
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
}