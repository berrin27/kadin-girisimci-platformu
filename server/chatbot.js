// ── FortunoAI Sohbet Motoru ──────────────────────────────────────────────────
// Sistem prompt'u ve Gemini erişilemediğinde kullanılan kural tabanlı yanıtlar.
// (App.jsx'ten sunucuya taşındı — API key artık tarayıcıya gitmiyor.)

import { FORTUNO_AI_SYSTEM_PROMPT } from '../src/src/aiPromt.js';

const AI_DEFAULT_RESPONSES = FORTUNO_AI_SYSTEM_PROMPT?.defaultResponses ?? {};

const buildSystemPrompt = () => {
  const role = FORTUNO_AI_SYSTEM_PROMPT?.role || "Sen 'FortunoAI' platformunun akıllı finansal danışmanısın.";
  const defaults = AI_DEFAULT_RESPONSES;

  return [
    role,
    '',
    'Öncelikli davranış kuralları:',
    '- Kadın girişimcilere sıcak, samimi ve motive edici bir mentör gibi yaklaş.',
    '- Türkçe konuş; ağır akademik dile kaçma.',
    '- KOSGEB, TÜBİTAK ve vakıf desteklerini sürekli gündeme getir.',
    '- Finans konularını günlük hayat örnekleriyle açıkla.',
    '- Her yanıtı özgün, net ve uygulanabilir tut.',
    '',
    'Hazır cevap örnekleri:',
    `- Selamlama: ${defaults.selamlama || 'Merhaba girişimci ruh! Ben FortunoAI.'}`,
    `- KOSGEB: ${defaults.kosgeb || 'KOSGEB destekleri tam aradığın can suyu!'}`,
    `- TÜBİTAK: ${defaults.tubitak || 'TÜBİTAK 1512 BİGG teknoloji fikri için güçlü bir seçenek.'}`,
    `- Genel finans: ${defaults.genel_finans || 'Nakit akışı ve bütçe planlaması için adım adım rehberlik yap.'}`,
  ].join('\n');
};

// ─── SYSTEM PROMPT ───────────────────────────────────────────────────────────
export const SYSTEM_PROMPT = buildSystemPrompt();

// ─── FALLBACK & AKILLI KNOWLEDGE ENGINE ──────────────────────────────────────
export const getFallbackResponse = (input, history = []) => {
  const q = input.toLowerCase().trim();
  const lastBotMsg = history.filter(m => m.sender === 'bot').pop()?.text || '';
  const lastBotMsgLower = lastBotMsg.toLowerCase();

  // 1. Kullanıcı takılma/tekrarlama fark etmişse veya özel "şahıs / kişisel şirket evrakları" soruyorsa:
  if (
    q.includes('tekrarladın') ||
    q.includes('tekrar') ||
    q.includes('aynısını') ||
    (q.includes('kişisel') && q.includes('şirket')) ||
    (q.includes('şahıs') && (q.includes('gerekli') || q.includes('belge') || q.includes('evrak') || q.includes('ne lazım') || q.includes('nasıl')))
  ) {
    return `Şahıs (kişisel) şirketi kurmak için ihtiyacın olan tüm resmi belgeler ve adımlar şunlardır 📋:

1️⃣ **Gerekli Belgeler:**
• T.C. Kimlik Kartı fotokopisi
• e-Devlet'ten alınacak İkametgah Belgesi
• İşyeri adresin için Kira Kontratı veya Tapu fotokopisi (Ev adresi gösterilecekse ev kirası sözleşmesi)
• Noterden onaylı İmza Beyannamesi (1 nüsha)
• e-Devlet / İnteraktif Vergi Dairesi (ivd.gib.gov.tr) şifresi

2️⃣ **Maliyet ve Süreç:**
• Noter İmza Beyannamesi: ~400 - 600 TL
• Mali Müşavir Açılış Hizmet Bedeli: ~1.500 - 2.500 TL
• Toplam Açılış Maliyeti: ~2.000 - 3.000 TL
• Kurulum Süresi: 1-2 iş günü içinde vergi levhanız çıkar!

💡 **Kadın Girişimci Harika Teşviki:** 29 yaş altındaysanız veya Genç Girişimci Desteği'nden yararlanırsanız **1 yıl boyunca Bağ-Kur priminizi (aylık ~7.000 TL) devlet öder** ve 3 yıl boyunca 75.000 TL'ye kadar gelir vergisinden muaf olursunuz! 💜`;
  }

  // 2. Karma Soru: Hem şirket kurup hem hibe alma sırası (Şirket + Hibe / Önce hangisi?)
  if ((q.includes('şirket') || q.includes('kur')) && (q.includes('hibe') || q.includes('destek') || q.includes('kosgeb') || q.includes('önce'))) {
    return `Harika ve çok kritik bir soru! 🌟 Şirket kurma ile Hibe alma sırası hayati önem taşır:

⚠️ **Doğru Sıralama Adımları:**
1. **Girişimcilik Sertifikası:** İlk iş e-Devlet üzerinden KOSGEB online Girişimcilik Eğitimi'ni ücretsiz tamamla.
2. **Hibe Şartlarını İncele:** Bazı programlarda (Örn: TÜBİTAK BİGG) şirketi kurmadan ÖNCE projeyle başvurmak zorundasın.
3. **Şirket Kurulumu:** KOSGEB Geleneksel/İleri Girişimci desteğinde eğitimi bitirdikten sonra şahıs veya limited şirketini kurabilirsin.
4. **Fatura ve Ödeme:** Şirket kurulduktan sonraki alacağın makine, teçhizat ve kuruluş faturalarını KOSGEB'e sunarak hibeni alırsın.

Senin iş fikrin ne üzerine? Hangi aşamadasın, ona göre tam takvimi çıkaralım! 🎯`;
  }

  // 3. Limited veya Anonim Şirket Soruları:
  if (q.includes('limited') || q.includes('ltd') || q.includes('anonim') || q.includes('sermaye şirketi')) {
    return `Limited Şirket (LTD) kurmak için gereken şartlar ve maliyetler şöyledir 🏢:

1️⃣ **Gerekli Şartlar & Belgeler:**
• Asgari Sermaye: En az 10.000 TL (Yasa gereği)
• MERSİS sistemi üzerinden şirket ana sözleşmesinin hazırlanması
• Kurucuların kimlik ve ikametgah belgeleri
• Bankada sermaye blokaj hesabı açılması (en az %25'i yatırılır)
• Ticaret Odası kaydı ve tescil işlemi

2️⃣ **Maliyet ve Süre:**
• Ticaret odası harçları, noter, imza sirküleri ve sermaye blokajı dahil: ~8.000 - 12.000 TL
• Kurulum süresi: 3-5 iş günü

Hangi sektörde faaliyet göstereceksin? Yatırımcı almayı hedefliyorsan Limited şirket daha prestijlidir.`;
  }

  // 4. KOSGEB Detay ve Başvuru Şartları:
  if (q.includes('kosgeb') || q.includes('nace') || q.includes('geleneksel') || q.includes('ileri girişimci')) {
    if (lastBotMsgLower.includes('kosgeb') && (q.includes('nasıl') || q.includes('şart') || q.includes('başvuru'))) {
      return `KOSGEB başvurusunu adım adım gerçekleştirmek için şu yolu izlemelisin 🎯:

1. **e-Devlet KOSGEB Portalı:** 'Girişimcilik Eğitimi' bölümüne girip videoları tamamla (yaklaşık 4-5 saat).
2. **KOSGEB Veri Tabanı Kaydı:** edevlet.kosgeb.gov.tr adresinden işletmeni KOSGEB sistemine kaydet.
3. **KOBİ Beyannamesi:** Şirket bilgilerini doldurup onaylat.
4. **Destek Başvurusu:** Girişimci Destek Programı başvuru formunu doldurup iş planını yükle.

Kadın girişimci olduğun için hibe puanına **+%10 ek avantaj** yansıyacak! Başvuru esnasında takıldığın bir aşama var mı?`;
    }
    const kosgebCevaplar = [
      AI_DEFAULT_RESPONSES.kosgeb || 'KOSGEB, Türkiye\'deki en kapsamlı girişim destek kuruluşu! 💜 2026 yılı güncel tutarlarıyla:\n\n• Geleneksel Girişimci: 10.000 TL kuruluş desteği + performans ve personel desteği.\n• İleri Girişimci (İmalat/Yazılım): 300.000 TL\'ye varan makine, teçhizat ve yazılım hibesi.\n\nHangi sektörde iş kurmayı planlıyorsun? NACE koduna göre uygunluğunu kontrol edelim!',
      'KOSGEB başvurusu için en önemli kural: e-Devlet üzerindeki online Girişimcilik Eğitimi sertifikasını şirket açılışından ÖNCE veya açılıştan sonraki 3 yıl içinde tamamlamış olmaktır. Şirket türün ne olacak?',
    ];
    return kosgebCevaplar[Math.floor(Math.random() * kosgebCevaplar.length)];
  }

  // 5. TÜBİTAK 1512 BİGG Detay Soruları:
  if (q.includes('tubitak') || q.includes('tübitak') || q.includes('bigg') || q.includes('ar-ge') || q.includes('teknoloji') || q.includes('yazılım')) {
    return AI_DEFAULT_RESPONSES.tubitak || `TÜBİTAK 1512 BİGG (Bireysel Genç Girişim) Programı teknoloji girişimcileri için %100 hibe sunar 🔬:

1️⃣ **Kimler Başvurabilir?**
• Üniversite lisans son sınıf, yüksek lisans veya doktora öğrencisi/mezunu olanlar.
• Daha önce TÜBİTAK BİGG hibesi almamış olmak.

2️⃣ **Destek Miktarı (2026):**
• **900.000 TL %100 Hibe / Tohum Yatırım Desteği**
• Şirketleşme, patent ve prototip geliştirme masraflarının tamamı karşılanır.

Teknoloji, yapay zeka, biyoteknoloji veya yeşil dönüşüm odaklı bir fikrin varsa hemen uygulayıcı kuruluşlara başvurabilirsin!`;
  }

  // 6. Maliyet, Fiyat, Vergi, Bağkur Teşviki:
  if (q.includes('maliyet') || q.includes('fiyat') || q.includes('ücret') || q.includes('vergi') || q.includes('bağkur') || q.includes('muhasebe') || q.includes('kaç para') || q.includes('ne kadar')) {
    return `Kadın Girişimciler İçin Şirket Maliyetleri ve Vergi Teşvikleri 💰:

✨ **1. Genç Kadın Girişimci Bağ-Kur Teşviki:**
İlk defa mükellef olan kadın girişimcilerin 1 yıl boyunca aylık Bağ-Kur primlerini (aylık ~7.000 TL) devlet karşılar.

✨ **2. Gelir Vergisi Muafiyeti:**
3 vergilendirme dönemi boyunca elde edilen kazancın 75.000 TL'ye kadar olan kısmı gelir vergisinden muaftır.

✨ **3. Aylık Sabit Giderler:**
• Mali Müşavir: ~1.000 - 2.000 TL/ay
• KDV / Muhtasar Damga Vergileri: ~300 - 600 TL/ay

İşletmenin tahmini aylık cirosunu ve masraflarını birlikte hesaplayabiliriz!`;
  }

  // 7. Nakit Akışı / Bütçe / Finans:
  if (q.includes('nakit') || q.includes('akış') || q.includes('para') || q.includes('bütçe') || q.includes('finans')) {
    return AI_DEFAULT_RESPONSES.genel_finans || `Nakit akışını bir ev bütçesi yönetmek gibi düşün 📒:

Giren Para (Satış, hibe, yatırım) - Çıkan Para (Kira, maaş, hammadde, fatura) = Net Nakit Akışı.

💡 **3 Altın Tavsiye:**
1. İlk 6 ay için en az 3 aylık sabit giderlerini karşılayacak acil durum fonu ayır.
2. Müşterilerinden vadeli çalışıyorsan, tedarikçilerine de benzer vade uygula.
3. Kendi maaşını şirketin parasından ayrı tut ve sabit bir maaş belirle.

Finansal tablonu hazırlamamı ister misin?`;
  }

  // 8. Hibe / Destek / Vakıf genel soruları:
  if (q.includes('hibe') || q.includes('destek') || q.includes('fon') || q.includes('vakıf') || q.includes('sabancı')) {
    return `Kadın girişimcilere yönelik öne çıkan güncel hibe ve fon kaynakları 🌟:

1. **KOSGEB:** Girişimcilik ve KOBİ geliştirme hibeleri (10.000 - 300.000 TL)
2. **TÜBİTAK 1512 BİGG:** Teknoloji ve Ar-Ge projelerine 900.000 TL %100 hibe
3. **Sabancı Vakfı:** Sosyal etki odaklı projelere hibe ve mentorluk
4. **TKDK (IPARD III):** Kırsal alan, tarım, gıda ve turizm projelerine %70 hibe
5. **Ticaret Bakanlığı:** E-ihracat ve kadın kooperatifleri destekleri

Hangi sektördesin? Sana nokta atışı en uygun programı eşleştireyim!`;
  }

  // 9. Şirket Kurma Genel (Eğer henüz özel detay sorulmadıysa):
  if (q.includes('şirket') || q.includes('kur') || q.includes('kurmak') || q.includes('açmak')) {
    if (lastBotMsgLower.includes('şirket kurmak artık çok kolaylaştı')) {
      return `Şirket kurma konusunda detaya inelim! 🏢

• **Şahıs Şirketi:** 1-2 günde kurulur, düşük maliyetlidir (~2.000 TL), tek kişilik işler için idealdir.
• **Limited Şirket:** En az 10.000 TL sermaye gerektirir, kurumsal saygınlığı yüksektir, ortaklı işler için uygundur.

Senin planın tek başına başlamak mı yoksa ortaklı bir yapı mı kurgulamak? Şahıs şirketi evraklarını veya Limited şirket adımlarını detaylandırabilirim.`;
    }
    return `Şirket kurmak gözünü korkutmasın! 🏢 

• **Şahıs Şirketi:** Noter imza beyannamesi ve ikametgah ile 1-2 günde kurulur (Maliyet: ~2.000-3.000 TL).
• **Limited Şirket:** 10.000 TL sermaye ve Ticaret Odası tescili ile 3-5 günde kurulur (Maliyet: ~8.000-12.000 TL).

Hangi şirket türü aklına yatıyor? Gerekli belgeleri veya başvuru adımlarını paylaşabilirim.`;
  }

  // 10. Selamlama:
  if (q.includes('merhaba') || q.includes('selam') || q.includes('hey') || q.includes('günaydın') || q.includes('iyi günler')) {
    return AI_DEFAULT_RESPONSES.selamlama || `Merhaba! 👋 Ben FortunoAI Finans Mentörün.

Kadın girişimciler için hibe, teşvik, şirket kurulumu ve finansal planlama konularında yanındayım!

Bana şunları sorabilirsin:
• "Şahıs şirketi kurmak için hangi belgeler gerekli?"
• "KOSGEB 2026 hibe tutarları ne kadar?"
• "TÜBİTAK BİGG başvuru şartları nelerdir?"
• "Nakit akışı hesabı nasıl yapılır?"

Bugün hangi konuyu birlikte netleştirelim? 💜`;
  }

  // 11. Genel / Dinamik Yanıtlar:
  const genelYanitlar = [
    `Harika bir konudan bahsettin! 💡 Sana en doğru ve uygulanabilir rehberliği sunabilmem için: Girişiminin hangi aşamada olduğunu (Fikir mi, yeni kuruldu mu, büyüyor mu?) ve sektörünü paylaşır mısın?`,
    `Çok haklısın, bu detay girişiminin geleceği için kilit önem taşıyor! 🚀 Sektörünü ve tam olarak neye ihtiyaç duyduğunu (Hibe mi, şirket kurulumu mu, finansal bütçe mi?) belirtirsen adım adım planlayalım.`,
    `Harika bir soru! Türkiye'de kadın girişimcilere özel KOSGEB, TÜBİTAK, Ticaret Bakanlığı ve Sabancı Vakfı gibi bir çok fon bulunuyor. Konuyu daha detaylı ele almamı ister misin?`,
  ];
  return genelYanitlar[Math.floor(Math.random() * genelYanitlar.length)];
};
