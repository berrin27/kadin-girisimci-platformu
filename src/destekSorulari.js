// ── Destek Bul soruları ──────────────────────────────────────────────────────
// Değerler data.js etiketleriyle aynıdır (eşleşme motoru bunları kullanır).
// kisa: seçim özetinde ve profil notunda gösterilen kısa ad.
export const DESTEK_SORULARI = [
  {
    alan: 'sektor',
    soru: 'Ne tür bir iş yapıyorsun ya da yapmak istiyorsun?',
    secenekler: [
      { deger: 'ev_emegi', ikon: '🏠', ad: 'Ev emeği & el işi', aciklama: 'Evde üretim, şirket kurmadan', kisa: 'Ev emeği' },
      { deger: 'yerel_isletme', ikon: '🏪', ad: 'Yerel işletme', aciklama: 'Kafe, butik, salon, hizmet', kisa: 'Yerel işletme' },
      { deger: 'teknoloji', ikon: '💻', ad: 'Teknoloji', aciklama: 'Yazılım, uygulama, Ar-Ge', kisa: 'Teknoloji' },
      { deger: 'e_ticaret', ikon: '🛒', ad: 'E-ticaret & ihracat', aciklama: 'Online satış, yurt dışı', kisa: 'E-ticaret' },
      { deger: 'kooperatif', ikon: '🤝', ad: 'Kadın kooperatifi', aciklama: 'Ortak üretim ve satış', kisa: 'Kooperatif' },
      { deger: 'sosyal_girisim', ikon: '🌱', ad: 'Sosyal girişim', aciklama: 'Toplumsal fayda, çevre', kisa: 'Sosyal girişim' },
      { deger: 'kırsal', ikon: '🌾', ad: 'Kırsal & tarım', aciklama: 'Tarım, hayvancılık, kırsal turizm', kisa: 'Kırsal' },
    ],
  },
  {
    alan: 'profil',
    soru: 'Kaç yaşındasın?',
    secenekler: [
      { deger: 'genc_uni', ikon: '🎓', ad: '18-25', aciklama: 'Öğrenci veya yeni mezun', kisa: '18-25 yaş' },
      { deger: 'genc_girisimci', ikon: '💼', ad: '26-35', aciklama: 'Genç girişimci', kisa: '26-35 yaş' },
      { deger: 'standart', ikon: '🌟', ad: '36-50', aciklama: 'Deneyimli girişimci', kisa: '36-50 yaş' },
      { deger: 'olgun_girisimci', ikon: '👑', ad: '50+', aciklama: 'Köklü deneyim', kisa: '50+ yaş' },
    ],
  },
  {
    alan: 'asama',
    soru: 'İşin şu an hangi aşamada?',
    secenekler: [
      { deger: 'fikir', ikon: '💡', ad: 'Fikir aşaması', aciklama: 'Henüz şirket kurmadım', kisa: 'Fikir' },
      { deger: 'yeni_kurulmus', ikon: '🌱', ad: 'Yeni kuruldu', aciklama: 'Son 1 yıl içinde açıldı', kisa: 'Yeni kurulmuş' },
      { deger: 'buyume', ikon: '📈', ad: 'Büyüyor', aciklama: '1-3 yıllık, büyümek istiyorum', kisa: 'Büyüme' },
      { deger: 'kriz_donemi', ikon: '🔄', ad: 'Zor bir dönemde', aciklama: 'Tutunmak için desteğe ihtiyacım var', kisa: 'Zor dönem' },
      { deger: 'kokenlesik', ikon: '🏆', ad: 'Köklü işletme', aciklama: '3 yıldan fazla, ölçeklenmek istiyorum', kisa: 'Köklü' },
    ],
  },
  {
    alan: 'medeniDurum',
    soru: 'Medeni durumun?',
    not: 'Bazı sosyal destekler yalnızca belirli medeni durumlara verilir; bilgin sadece eşleştirme için kullanılır.',
    secenekler: [
      { deger: 'hepsi', ikon: '💜', ad: 'Belirtmek istemiyorum', aciklama: 'Tüm programlar gösterilir', kisa: 'Fark etmez' },
      { deger: 'bekar', ikon: '🌸', ad: 'Bekar', aciklama: '', kisa: 'Bekar' },
      { deger: 'evli', ikon: '💍', ad: 'Evli', aciklama: '', kisa: 'Evli' },
      { deger: 'dul', ikon: '🕊️', ad: 'Eşimi kaybettim', aciklama: '', kisa: 'Dul' },
      { deger: 'bosanmis', ikon: '🔓', ad: 'Boşandım / ayrı yaşıyorum', aciklama: '', kisa: 'Boşanmış' },
    ],
  },
];

export const kisaAd = (alan, deger) =>
  DESTEK_SORULARI.find(s => s.alan === alan)?.secenekler.find(o => o.deger === deger)?.kisa || '';
