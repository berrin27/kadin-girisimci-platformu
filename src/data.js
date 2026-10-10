// ── Destek Programları — TEK VERİ KAYNAĞI ────────────────────────────────────
// Tüm tutarlar, oranlar ve tarihler resmi kaynaklardan kontrol edilmiştir
// (her programın `kaynak` alanı). Tutarlar sık değişir: güncellerken
// `sonKontrol` tarihini de değiştir.
//
// Etiketler (tags) — eşleşme motoru bunları ZORUNLU kriter olarak kullanır:
//   Sektör : yerel_isletme, ev_emegi, teknoloji, e_ticaret, kooperatif, sosyal_girisim, kırsal
//   Yaş    : genc_uni (18-25), genc_girisimci (26-35), standart (36-50), olgun_girisimci (50+)
//   Aşama  : fikir, yeni_kurulmus, buyume, kriz_donemi, kokenlesik
//   Medeni : bekar, evli, dul, bosanmis
//
// destekTuru: 'hibe' (geri ödemesiz) | 'kredi' | 'geri_odemeli' | 'yatirim'
//             | 'vergi' | 'sosyal_yardim' | 'mentorluk'
// hibeUstLimit / finansmanUstLimit: hesaplayıcı için sayısal üst limit (TL);
//   resmi sabit bir tutar yoksa null.

export const SON_KONTROL = 'Ekim 2026';

const TUM_YASLAR = ['genc_uni', 'genc_girisimci', 'standart', 'olgun_girisimci'];
const TUM_MEDENI = ['bekar', 'evli', 'dul', 'bosanmis'];

export const supportData = [
    // ── KOSGEB ────────────────────────────────────────────────────────────────
    {
        id: "kosgeb-is-kurma",
        title: "KOSGEB İş Kurma Desteği",
        institution: "KOSGEB",
        amount: "30.000 TL'ye kadar + personel desteği",
        type: "Geri Ödemesiz Destek",
        destekTuru: "hibe",
        hibeUstLimit: 30000,
        finansmanUstLimit: null,
        link: "https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/1231/girisimci-destek-programi",
        kaynak: "https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/1231/girisimci-destek-programi",
        basvuruDurumu: "KOSGEB çağrı dönemlerinde açılır",
        tags: ["yerel_isletme", "ev_emegi", "teknoloji", "e_ticaret",
               "fikir", "yeni_kurulmus",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Kuruluşunun ilk yılındaki işletmelere geri ödemesiz kuruluş desteği: şahıs işletmesine 10.000 TL, sermaye şirketine 20.000 TL. Kadın girişimcilere +10.000 TL ilave edilir. Ayrıca 3 yıl boyunca, her yıl 1 aylık asgari ücret maliyeti kadar personel desteği verilir (yıllık prim günü toplamı 360 ve üzeri olmalı).",
        highlight: "Kadınlara +10.000 TL ilave"
    },
    {
        id: "kosgeb-is-gelistirme",
        title: "KOSGEB İş Geliştirme Desteği",
        institution: "KOSGEB",
        amount: "1.650.000 TL'ye kadar (kadınlara)",
        type: "Geri Ödemeli Destek (Faizsiz)",
        destekTuru: "geri_odemeli",
        hibeUstLimit: null,
        finansmanUstLimit: 1650000,
        link: "https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/1231/girisimci-destek-programi",
        kaynak: "https://www.kosgeb.gov.tr/site/tr/genel/detay/9374/girisimci-destek-programi-is-gelistirme-cagrisi-2026-yili-2-donem-basvurulari-basladi",
        basvuruDurumu: "2026-2. dönem 20 Nisan – 8 Mayıs 2026'da kapandı, yeni çağrı bekleniyor",
        tags: ["teknoloji",
               "yeni_kurulmus", "buyume",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "İmalat, telekomünikasyon, yazılım/bilişim ve Ar-Ge sektörlerindeki 0-3 yaş işletmelere personel, makine, yazılım ve hizmet alımı giderleri için %80 oranında, faizsiz ve geri ödemeli destek. Üst limit 1.500.000 TL; kadın girişimcilere +150.000 TL. Geri ödeme 36 aylık program süresi bitince başlar. Rekabetçi değerlendirme: ülke genelinde ilk 500 proje desteklenir.",
        highlight: "Faizsiz, 36 ay sonra geri ödeme"
    },
    {
        id: "kosgeb-kredi-faiz",
        title: "KOSGEB Kadın Girişimci Kredi Faiz Desteği",
        institution: "KOSGEB",
        amount: "1.000.000 TL kredi, faizin %50'si KOSGEB'den",
        type: "Kredi Faiz Desteği",
        destekTuru: "kredi",
        hibeUstLimit: null,
        finansmanUstLimit: 1000000,
        link: "https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/1231/girisimci-destek-programi",
        kaynak: "https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/1231/girisimci-destek-programi",
        basvuruDurumu: "İş Geliştirme çağrısıyla birlikte açılır",
        tags: ["teknoloji",
               "yeni_kurulmus", "buyume",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "İş Geliştirme çağrısında jüri puanı 50 ve üzeri olan kadın (veya genç) girişimcilere, KOSGEB'le anlaşmalı bankalardan 1.000.000 TL'ye kadar işletme sermayesi kredisi. Kredi faizinin %50'si KOSGEB tarafından geri ödemesiz karşılanır, vade 36 ay. İş Geliştirme Desteği ile aynı anda kullanılamaz.",
        highlight: "Faizin yarısını KOSGEB öder"
    },

    // ── TÜBİTAK ───────────────────────────────────────────────────────────────
    {
        id: "tubitak-bigg-yatirim",
        title: "TÜBİTAK BiGG Yatırım Programı (1812)",
        institution: "TÜBİTAK",
        amount: "1.350.000 TL yatırım (+1.350.000 TL devam yatırımı)",
        type: "Hisse Karşılığı Yatırım",
        destekTuru: "yatirim",
        hibeUstLimit: null,
        finansmanUstLimit: 1350000,
        link: "https://tubitak.gov.tr/tr/duyuru",
        kaynak: "https://www.internethaber.com/bigg-yatirim-programi-2026-ikinci-cagrisi-suruyor-kimler-basvurabilir-son-tarih-ne-zaman-2459072h.htm",
        basvuruDurumu: "2026-2 çağrısı 18 Eylül 2026'da kapandı, sonuçlar 24-27 Kasım 2026",
        tags: ["teknoloji",
               "fikir",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Teknoloji ve yenilik odaklı iş fikri olan üniversite öğrencileri ve mezunları için. Önce bir uygulayıcı kuruluşun hızlandırma programına katılınır; başarılı girişimlerin kuracağı şirkete TÜBİTAK BiGG Fonu %3 hisse karşılığında 1.350.000 TL yatırım yapar. Hibe değildir. Başvuru tarihinde herhangi bir şirkette ortaklığınız olmamalı ve kazanırsanız şirkette tam zamanlı çalışmalısınız.",
        highlight: "%3 hisse karşılığı yatırım"
    },

    // ── TİCARET BAKANLIĞI ─────────────────────────────────────────────────────
    {
        id: "ticaret-koopdes",
        title: "KOOP-DES Kadın Kooperatifleri Desteği",
        institution: "Ticaret Bakanlığı",
        amount: "1.000.000 TL'ye kadar ekipman + personel desteği",
        type: "Hibe (%50-75)",
        destekTuru: "hibe",
        hibeUstLimit: 750000,
        finansmanUstLimit: null,
        link: "https://ticaret.gov.tr",
        kaynak: "https://www.alomaliye.com/2026/04/09/2026-yili-kooperatiflerin-desteklenmesi-programi-koop-des-duyurusu/",
        basvuruDurumu: "2026 başvuruları 13 Nisan – 15 Mayıs 2026'da kapandı, her yıl açılır",
        tags: ["kooperatif",
               "yeni_kurulmus", "buyume", "kriz_donemi", "kokenlesik",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Ortaklarının çoğunluğu kadın olan kooperatiflerin makine-ekipman alımları için 1.000.000 TL'ye kadar proje. Ortaklarının en az %90'ı kadın olan kooperatiflerde destek oranı %75 (diğerlerinde ile göre %50-75). Ekipman desteği alan kooperatiflere ayrıca nitelikli personel için kişi başı yıllık 420.000 TL (en fazla 2 kişi). Başvuru Ticaret İl Müdürlüğüne yapılır.",
        highlight: "%90+ kadın ortaklıya %75 hibe"
    },
    {
        id: "ticaret-eihracat",
        title: "Ticaret Bakanlığı E-İhracat Destekleri",
        institution: "Ticaret Bakanlığı",
        amount: "Giderlerin %50-75'i",
        type: "Gider Desteği (Geri Ödemesiz)",
        destekTuru: "hibe",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://ticaret.gov.tr/ihracat",
        kaynak: "https://www.alomaliye.com/2026/01/17/e-ihracat-destekleri-hakkinda-kararda-degisiklik-karar-sayisi-10881/",
        basvuruDurumu: "Sürekli — harcama sonrası başvurulur",
        tags: ["e_ticaret",
               "yeni_kurulmus", "buyume", "kokenlesik",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Yurt dışı pazaryerlerinde (Amazon, Etsy vb.) satış yapan işletmelerin pazaryeri komisyonu, reklam, tanıtım ve lojistik giderlerinin bir kısmı geri ödemesiz karşılanır. 2026 düzenlemesiyle destek oranı en fazla %75; hedef ülkelerde (2026'da 60 ülke) oran yükselir. Kalem bazlı üst limitler her yıl güncellenir.",
        highlight: "Hedef ülkelerde daha yüksek oran"
    },
    {
        id: "ticaret-fuar",
        title: "Ticaret Bakanlığı Yurt Dışı Fuar Desteği",
        institution: "Ticaret Bakanlığı",
        amount: "Giderlerin %50'si (hedef ülkede %70)",
        type: "Gider Desteği (Geri Ödemesiz)",
        destekTuru: "hibe",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://ticaret.gov.tr/ihracat/fuarlar",
        kaynak: "https://ticaret.gov.tr/ihracat/fuarlar",
        basvuruDurumu: "Fuar bazında — ihracatçı birliği duyurularını takip edin",
        tags: ["yerel_isletme", "teknoloji", "e_ticaret", "kooperatif",
               "yeni_kurulmus", "buyume", "kokenlesik",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Yurt dışı fuarlara katılımda stand kirası, tasarım/kurulum ve nakliye gibi giderlerin %50'si, Bakanlığın belirlediği hedef ülkelerde %70'i, hedef sektörlerde %75'e kadarı karşılanır. Üst limit fuara göre değişir; güncel limitler Bakanlığın 'Yıllar Bazında Fuar Destek Üst Limitleri' tablosunda yayımlanır.",
        highlight: "Hedef ülkelerde %70'e kadar"
    },

    // ── TARIM & KIRSAL ────────────────────────────────────────────────────────
    {
        id: "tarim-kirsal-kalkinma",
        title: "Kırsal Kalkınma Yatırım Programı",
        institution: "Tarım ve Orman Bakanlığı",
        amount: "Proje: 100.000 TL – 30.000.000 TL",
        type: "Hibe (kadınlara %60)",
        destekTuru: "hibe",
        hibeUstLimit: 18000000,
        finansmanUstLimit: null,
        link: "https://kirsalkalkinma.tarimorman.gov.tr",
        kaynak: "https://www.alomaliye.com/2026/04/30/kirsal-kalkinma-yatirim-programi-2026-basvuru-donemi-basladi/",
        basvuruDurumu: "2026 başvuruları 12 Haziran 2026'da kapandı, her yıl açılır",
        tags: ["kırsal", "kooperatif",
               "fikir", "yeni_kurulmus", "buyume", "kokenlesik",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Tarımsal ürün işleme-paketleme-depolama, modern sera, arıcılık, kültür mantarı, hayvancılık, akıllı tarım ve tasarruflu sulama yatırımları için KDV dahil %50-70 hibe. Kadın ve genç başvurularında oran %60; bütçenin en az %20'si kadın ve genç girişimcilere ayrılır. Vadesi geçmiş vergi/SGK borcu olanlar yararlanamaz.",
        highlight: "Bütçenin %20'si kadın ve gençlere"
    },
    {
        id: "tkdk-ipard",
        title: "TKDK IPARD III Kırsal Kalkınma Hibeleri",
        institution: "Tarım ve Kırsal Kalkınmayı Destekleme Kurumu",
        amount: "Proje tutarının %60-70'i",
        type: "AB Destekli Hibe",
        destekTuru: "hibe",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://www.tkdk.gov.tr",
        kaynak: "https://www.alomaliye.com/2026/03/16/kirsala-241-milyon-avro-hibe-destegi-saglanacak/",
        basvuruDurumu: "2026'da 4 tedbirde çağrı yapılıyor — TKDK çağrı takvimini takip edin",
        tags: ["kırsal", "kooperatif",
               "fikir", "yeni_kurulmus", "buyume", "kokenlesik",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "AB ve Türkiye ortak finansmanıyla kırsal ekonomik faaliyetlerin çeşitlendirilmesi (kırsal turizm, el sanatları, yerel ürün işleme vb.), tarımsal üretim ve gıda işleme yatırımlarına hibe. Çiftlik faaliyetlerinin çeşitlendirilmesinde baz oran %60, genç başvurularda %70. Kadınlar ve 40 yaş altı gençler sıralamada ek puan alır. 2026 çağrılarında toplam 241 milyon avro hibe öngörülüyor.",
        highlight: "Kadınlara sıralamada ek puan"
    },

    // ── HALKBANK ──────────────────────────────────────────────────────────────
    {
        id: "halkbank-kadin",
        title: "Halkbank Kadın Girişimci Kredisi",
        institution: "Halkbank",
        amount: "1.000.000 TL'ye kadar",
        type: "Taksitli İşletme Kredisi",
        destekTuru: "kredi",
        hibeUstLimit: null,
        finansmanUstLimit: 1000000,
        link: "https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/kadin-girisimci-kredisi.html",
        kaynak: "https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/kadin-girisimci-kredisi.html",
        basvuruDurumu: "Sürekli — şubelerden başvurulur",
        tags: ["yerel_isletme", "ev_emegi", "teknoloji", "e_ticaret", "sosyal_girisim", "kırsal",
               "fikir", "yeni_kurulmus", "buyume", "kriz_donemi", "kokenlesik",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "İlk kez iş kuracak veya işini kurmuş kadınlara: faaliyet süresi 6 ayı geçmeyen yeni işletmelere 600.000 TL, işini kurmuş kadın girişimcilere 1.000.000 TL'ye kadar. Vade 36 ay, bunun 6 ayı anapara ödemesiz. Şahıs işletmesi olmalı ya da hisselerin en az %50'si kadınlara ait olmalı.",
        highlight: "6 ay anapara ödemesiz"
    },
    {
        id: "halkbank-sifir-faiz-esnaf",
        title: "Halkbank Kadın Girişimcilere Sıfır Faizli Esnaf Kredisi",
        institution: "Halkbank",
        amount: "300.000 TL – 1.000.000 TL",
        type: "Faizsiz Esnaf Kredisi",
        destekTuru: "kredi",
        hibeUstLimit: null,
        finansmanUstLimit: 1000000,
        link: "https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/kadin-girisimcilere-sifir-faizli-esnaf-kredisi",
        kaynak: "https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/kadin-girisimcilere-sifir-faizli-esnaf-kredisi",
        basvuruDurumu: "Sürekli — şubelerden başvurulur",
        tags: ["yerel_isletme", "ev_emegi",
               "fikir", "yeni_kurulmus",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "KOSGEB Uygulamalı Girişimcilik Eğitimi'ni tamamlamış, projesi KOSGEB onaylı 35 yaş altı kadınlara 300.000 TL. En az 1 yıllık ustalık belgesiyle son 1 yıl içinde işletme kuranlara veya kaybolmaya yüz tutan meslek kollarında Esnaf Vergi Muafiyet Belgesi olanlara 1.000.000 TL'ye kadar.",
        highlight: "Ustalık belgesiyle 1.000.000 TL"
    },
    {
        id: "halkbank-kooperatif",
        title: "Halkbank Kadın Kooperatifleri Destek Paketi",
        institution: "Halkbank",
        amount: "2.700.000 TL'ye varan kredi",
        type: "Kooperatif Kredi Paketi",
        destekTuru: "kredi",
        hibeUstLimit: null,
        finansmanUstLimit: 2700000,
        link: "https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/kadin-kooperatifleri-destek-paketi",
        kaynak: "https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/kadin-kooperatifleri-destek-paketi",
        basvuruDurumu: "Sürekli — şubelerden başvurulur",
        tags: ["kooperatif",
               "yeni_kurulmus", "buyume", "kriz_donemi", "kokenlesik",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Ortaklarının veya hisselerinin en az %50'si kadınlara ait kooperatiflere: makine-ekipman 500.000 TL (60 ay), ticari araç 1.500.000 TL (60 ay), işletme kredisi 500.000 TL (36 ay) ve 200.000 TL teminat mektubu. Nakdi kredilerde ilk 6 ay anapara ödemesiz.",
        highlight: "İlk 6 ay anapara ödemesiz"
    },
    {
        id: "halkbank-kadin-ihracatci",
        title: "Halkbank Büyüyen Kadın İhracatçı Kredisi",
        institution: "Halkbank",
        amount: "25.000.000 TL (500.000 EUR)",
        type: "İhracat Finansmanı",
        destekTuru: "kredi",
        hibeUstLimit: null,
        finansmanUstLimit: 25000000,
        link: "https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/buyuyen-kadin-ihracatcikredisi",
        kaynak: "https://www.halkbank.com.tr/tr/ureten-kadinlar/kadin-girisimci-kredileri/buyuyen-kadin-ihracatcikredisi",
        basvuruDurumu: "Sürekli — şubelerden başvurulur",
        tags: ["yerel_isletme", "teknoloji", "e_ticaret",
               "yeni_kurulmus", "buyume", "kokenlesik",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Hisselerinin en az %50'si kadınlara ait ihracatçı, imalatçı-ihracatçı veya döviz kazandırıcı hizmet veren işletmelere ihracat öncesi finansman. Azami 25.000.000 TL veya 500.000 EUR; 12 ya da 24 ay vade, aylık eşit taksit.",
        highlight: "İhracatçı kadınlara özel"
    },

    // ── MİKROKREDİ & SOSYAL DESTEK ────────────────────────────────────────────
    {
        id: "tgmp-mikrokredi",
        title: "Türkiye Grameen Mikrofinans Programı",
        institution: "Türkiye İsrafı Önleme Vakfı (TİSVA)",
        amount: "Teminatsız, kefilsiz mikrokredi",
        type: "Mikrokredi (Geri Ödemeli)",
        destekTuru: "kredi",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://www.tgmp.net/mikrokredialma/",
        kaynak: "https://kadingirisimci.gov.tr/destek-ve-tesvikler/mikrokredi-uygulamalari/",
        basvuruDurumu: "Sürekli — 69 ilde şubeler",
        tags: ["ev_emegi", "yerel_isletme", "kırsal",
               "fikir", "yeni_kurulmus", "kriz_donemi",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Banka kredisine erişemeyen dar gelirli kadınların evde üretim, küçük ticaret gibi gelir getirici faaliyetlerine başlayabilmesi için teminatsız ve kefilsiz küçük krediler; küçük taksitlerle geri ödenir. 69 ilde uygulanıyor. Tutarlar ve koşullar için programın sitesine bakın.",
        highlight: "Teminat ve kefil istemez"
    },
    {
        id: "sydv-gelir-getirici",
        title: "SYDV Gelir Getirici Proje Desteği",
        institution: "Sosyal Yardımlaşma ve Dayanışma Vakıfları",
        amount: "Vakfın kaynağına göre değişir",
        type: "Geri Ödemeli Proje Desteği",
        destekTuru: "geri_odemeli",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://www.aile.gov.tr",
        kaynak: "https://www.muhasebenews.com/?p=61473",
        basvuruDurumu: "İlçe SYD Vakfına başvurulur",
        tags: ["ev_emegi", "yerel_isletme", "kırsal",
               "fikir", "yeni_kurulmus",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Sosyal yardıma muhtaç kişilerin kendi işini kurabilmesi için ilçe Sosyal Yardımlaşma ve Dayanışma Vakıflarının kendi kaynaklarından verdiği, geri ödemeli proje desteği. Merkezi fondan bu projelere ayrıca kaynak ayrılmadığı için imkan ve tutar vakıftan vakfa değişir.",
        highlight: "Dar gelirli kadınlar için"
    },
    {
        id: "es-vefat-yardim",
        title: "Eşi Vefat Etmiş Kadınlara Düzenli Nakdi Yardım",
        institution: "Aile ve Sosyal Hizmetler Bakanlığı",
        amount: "İki ayda bir düzenli ödeme",
        type: "Sosyal Yardım (Geri Ödemesiz)",
        destekTuru: "sosyal_yardim",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://www.turkiye.gov.tr/sosyal-yardim-basvuru",
        kaynak: "https://aile.tr/media/302972/hizmet_rehber_sosyal_yardimlar_hizmetleri.pdf",
        basvuruDurumu: "Sürekli — ilçe SYD Vakfı veya e-Devlet",
        tags: ["ev_emegi", "sosyal_girisim",
               "fikir", "kriz_donemi",
               "genc_girisimci", "standart", "olgun_girisimci",
               "dul"],
        description: "Resmi nikahlı eşini kaybetmiş, hanesinde sosyal güvencesi olan kimse bulunmayan ve 3294 sayılı Kanun kapsamında ihtiyaç sahibi kadınlara iki ayda bir düzenli nakdi yardım. Bir girişim desteği değil, sosyal yardımdır; tutar her yıl güncellenir. Başvuru ikamet edilen ilçedeki SYD Vakfına yapılır.",
        highlight: "Sosyal güvencesi olmayan dul kadınlar"
    },

    // ── VERGİ & İSTİHDAM ──────────────────────────────────────────────────────
    {
        id: "genc-girisimci-vergi-istisnasi",
        title: "Genç Girişimci Kazanç İstisnası",
        institution: "Gelir İdaresi Başkanlığı",
        amount: "3 yıl boyunca yıllık ~400.000 TL'ye kadar kazanç vergisiz",
        type: "Gelir Vergisi İstisnası",
        destekTuru: "vergi",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://www.gib.gov.tr",
        kaynak: "https://www.haberturk.com/2026-yilinda-genc-girisimci-tesviki-ne-kadar-3856269-ekonomi",
        basvuruDurumu: "İşe başlarken vergi dairesine bildirilir",
        tags: ["yerel_isletme", "ev_emegi", "teknoloji", "e_ticaret", "sosyal_girisim", "kırsal",
               "fikir", "yeni_kurulmus",
               "genc_uni", "genc_girisimci", ...TUM_MEDENI],
        description: "İlk kez gelir vergisi mükellefi olan ve işe başladığı tarihte 29 yaşını doldurmamış girişimcilerin kazancının, gelir vergisi tarifesinin 2. dilimindeki tutara kadar olan kısmı (2026 için yaklaşık 400.000 TL) 3 yıl vergiden istisnadır (GVK mükerrer md. 20). Not: genç girişimcilere 1 yıllık Bağ-Kur prim desteği 1 Ocak 2026'dan itibaren kaldırıldı (7566 sayılı Kanun).",
        highlight: "29 yaş altına 3 yıl vergi avantajı"
    },
    {
        id: "sgk-women-up",
        title: "SGK Kayıtlı Kadın İstihdamı Desteği (WOMEN-UP 2)",
        institution: "Sosyal Güvenlik Kurumu",
        amount: "İşe alınan her kadın çalışan için hibe",
        type: "İstihdam Hibesi",
        destekTuru: "hibe",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://www.sgkkadinistihdaminindesteklenmesi.org/",
        kaynak: "https://kadingirisimci.gov.tr/destek-ve-tesvikler/sosyal-guevenlik-kurumu-sgk/",
        basvuruDurumu: "Proje sitesinden takip edin",
        tags: ["yerel_isletme", "ev_emegi", "teknoloji", "e_ticaret", "sosyal_girisim", "kırsal", "kooperatif",
               "yeni_kurulmus", "buyume", "kokenlesik",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Ankara, İstanbul, Aydın ve Samsun'da faaliyet gösteren kadın işverenlere, yeni işe aldıkları her kadın çalışan için hibe desteği. Proje kapsamında 2.100 kadın işveren ve 2.100 kadın çalışan hedefleniyor. Yalnızca bu 4 ildeki işletmeler başvurabilir.",
        highlight: "4 ildeki kadın işverenlere"
    },

    // ── YATIRIM & SOSYAL GİRİŞİM AĞLARI ──────────────────────────────────────
    {
        id: "arya-women",
        title: "Arya Kadın Yatırım Platformu",
        institution: "Arya Women Investment Platform",
        amount: "Yatırıma hazırlık programı + melek yatırım",
        type: "Yatırım & Hızlandırma",
        destekTuru: "yatirim",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://www.aryawomen.com",
        kaynak: "https://www.isbank.com.tr/is-ticari/arya-kadin-yatirim-platformu-isbirligi",
        basvuruDurumu: "Program dönemlerini platformun sitesinden takip edin",
        tags: ["teknoloji", "e_ticaret",
               "yeni_kurulmus", "buyume",
               ...TUM_YASLAR, ...TUM_MEDENI],
        description: "Türkiye'nin ilk kadın odaklı yatırım platformlarından biri. Kadın kurucuların girişimlerine eğitim, mentorluk, hızlandırma programları ve yatırım desteği sunar; İş Bankası iş birliğiyle 'Yatırıma Hazırlık Programı' ve ücretsiz iş atölyeleri düzenler.",
        highlight: "Kadın kuruculara yatırım ağı"
    },
    {
        id: "ashoka-fellowship",
        title: "Ashoka Türkiye Fellowship",
        institution: "Ashoka Türkiye",
        amount: "3 yıllık mali destek + küresel ağ",
        type: "Sosyal Girişimci Bursu",
        destekTuru: "mentorluk",
        hibeUstLimit: null,
        finansmanUstLimit: null,
        link: "https://www.ashoka.org/tr/country/turkey",
        kaynak: "https://www.stgm.org.tr/en/open-call-ashoka-social-entrepreneurs",
        basvuruDurumu: "Yıllık aday gösterme dönemi — ashoka.org/tr takip edin",
        tags: ["sosyal_girisim",
               "buyume", "kokenlesik",
               "genc_girisimci", "standart", "olgun_girisimci", ...TUM_MEDENI],
        description: "Toplumsal sorunlara sistem değiştiren çözümler üreten ve etkisini kanıtlamış sosyal girişimciler seçilerek Ashoka Fellow olur. Seçilenlere 3 yıllık mali ve stratejik destek ile ömür boyu küresel bir destek ağı sağlanır. Erken aşama fikirler için değil, etkisi kanıtlanmış girişimler içindir.",
        highlight: "Etkisi kanıtlanmış girişimler için"
    },
];

// ── Başvuru Takvimi ──────────────────────────────────────────────────────────
// Durum (açık / yaklaşıyor / kapandı) bugünün tarihine göre otomatik hesaplanır.
export const basvuruTakvimi = [
    { program: 'TÜBİTAK BiGG Yatırım 2026-2 — Sonuçların Açıklanması', kurum: 'TÜBİTAK', baslangic: '2026-11-24', bitis: '2026-11-27' },
    { program: 'TÜBİTAK BiGG Yatırım 2026-2 — Aşama 2 Başvuruları', kurum: 'TÜBİTAK', baslangic: '2026-08-31', bitis: '2026-09-18' },
    { program: 'Kırsal Kalkınma Yatırım Programı 2026', kurum: 'Tarım ve Orman Bakanlığı', baslangic: '2026-04-30', bitis: '2026-06-12' },
    { program: 'KOOP-DES 2026 Kooperatif Destekleri', kurum: 'Ticaret Bakanlığı', baslangic: '2026-04-13', bitis: '2026-05-15' },
    { program: 'KOSGEB Girişimci Destek Programı 2026-2. Dönem', kurum: 'KOSGEB', baslangic: '2026-04-20', bitis: '2026-05-08' },
];

// ── Doğrulanmış Etkinlikler (Fuarlar & Etkinlikler sayfası) ──────────────────
// Yalnızca resmi bağlantısı olan gerçek etkinlikler. `baslangic`/`bitis`
// başvuru veya etkinlik tarihleridir (YYYY-AA-GG; başlangıç bilinmiyorsa null); durum (açık/yaklaşan/sona erdi)
// sayfada otomatik hesaplanır ve sona erenler varsayılan olarak gizlenir.
// tur: 'Yarışma' | 'Ödül' | 'Hibe / Fon' | 'Hızlandırma' | 'Fuar' | 'Eğitim'
export const etkinlikler = [
    {
        id: "halkbank-ureten-kadinlar-2027",
        baslik: "Halkbank Üreten Kadınlar Yarışması",
        duzenleyen: "Halkbank",
        tur: "Yarışma",
        ucret: "Ücretsiz",
        baslangic: "2026-08-24",
        bitis: "2026-11-01",
        konum: "Online başvuru",
        aciklama: "Kadın girişimciler ve kadın kooperatifleri için 6 kategorili yarışma: Yılın Üreten Kadın Girişimcisi; İnovasyon, Teknoloji ve Yapay Zekâ; Yükselen Yıldız; Sürdürülebilirlik; Kadın Kooperatifi; Sosyal Girişimci. Dereceye girenlere nakdi ödül ve ayni destek; finalistlere Master Class marka eğitimi. Ödül töreni 26 Mart 2027.",
        link: "https://www.halkbank.com.tr/tr/ureten-kadinlar/ureten-kadinlar-yarismasi/ureten-kadinlar-yarismasi-2027",
        kaynak: "https://www.milliyet.com.tr/7647999",
    },
    {
        id: "garanti-kadin-girisimcisi-2026",
        baslik: "Türkiye'nin Kadın Girişimcisi Yarışması",
        duzenleyen: "Garanti BBVA · KAGİDER · Ekonomist",
        tur: "Yarışma",
        ucret: "Ücretsiz",
        baslangic: null, // başvuru açılış tarihi kaynakta yok; yalnızca son tarih doğrulandı
        bitis: "2026-11-15",
        konum: "Online başvuru",
        aciklama: "Yarışmanın 20. dönemi. 5 kategoride toplam 3 milyon TL ödül: ana kategori 1 milyon TL, diğer dört kategori 500'er bin TL. Kazananlara KAGİDER üyeliği gibi ek imkanlar da sunuluyor.",
        link: "https://www.garantibbvakadingirisimci.com",
        kaynak: "https://www.garantibbva.com.tr/kurumsal-iletisim/turkiyenin-kadin-girisimci-yarismasinda-yirminci-yil-heyecani",
    },
    {
        id: "ey-girisimci-kadin-liderler-2026",
        baslik: "EY Girişimci Kadın Liderler Programı",
        duzenleyen: "EY Türkiye",
        tur: "Hızlandırma",
        ucret: "Ücretsiz",
        baslangic: "2026-09-09",
        bitis: "2026-11-15",
        konum: "Online başvuru",
        aciklama: "Büyüme ve uluslararasılaşma hedefleyen kadın girişimcilere eğitim, birebir mentorluk, iş geliştirme ve EY'nin uluslararası girişimci ağına erişim. Şartlar: şirkette en az %25 hisse ve ana karar verici olmak, Türkiye merkezli, en az 3 yıllık ve son iki yılda yıllık 20 milyon TL üzeri cirolu şirket.",
        link: "https://www.ey.com/tr_tr/ey-turkiye-girisimci-kadin-liderler-programi",
        kaynak: "https://www.ey.com/tr_tr/newsroom/2026/9/ey-girisimci-kadin-liderler-programi-2026-basvurulari-acildi",
    },
    {
        id: "eic-kadin-yenilikciler-2027",
        baslik: "Avrupa Kadın Yenilikçiler Ödülü 2027",
        duzenleyen: "Avrupa Komisyonu (EIC & EIT)",
        tur: "Ödül",
        ucret: "Ücretsiz",
        baslangic: "2026-09-02",
        bitis: "2026-12-01",
        konum: "Online başvuru (İngilizce)",
        aciklama: "Türkiye dahil Ufuk Avrupa ülkelerindeki yenilikçi şirketlerin kadın kurucularına ödül: EIC Kadın Yenilikçiler 100.000 € / 70.000 € / 50.000 €; 35 yaş altına Yükselen Yenilikçiler 50.000 € / 30.000 € / 20.000 €. Şirket 1 Ocak 2025'ten önce kurulmuş olmalı.",
        link: "https://eic.ec.europa.eu/eic-prizes/european-prize-women-innovators-powered-eic-eit_en",
        kaynak: "https://eic.ec.europa.eu/eic-prizes/european-prize-women-innovators-powered-eic-eit_en",
    },
    {
        id: "women-techeu-2026",
        baslik: "Women TechEU Derin Teknoloji Hibesi",
        duzenleyen: "Avrupa Komisyonu (Ufuk Avrupa)",
        tur: "Hibe / Fon",
        ucret: "Ücretsiz",
        baslangic: "2026-06-30",
        bitis: "2027-07-13",
        konum: "Online başvuru (İngilizce)",
        aciklama: "Kadın kurucunun üst yönetici olduğu, 6 ay–5 yaş arası erken aşama derin teknoloji girişimlerine (yapay zekâ, biyoteknoloji, enerji, robotik vb.) 75.000 € hibe ve iş geliştirme hizmetleri. Başvurular haftalık değerlendirilir; bütçenin %40'ı Türkiye'nin de dahil olduğu ülkelere ayrılmıştır.",
        link: "https://cascadefunding.sploro.eu/apply/program/women-techeu-eligibility-strand",
        kaynak: "https://ufukavrupa.org.tr/tr/haberler/2026-women-techeu-cagrisi-ile-kadin-girisimcilere-yonelik-destekler-devam-ediyor-basvuru",
    },
];

// Fuar sayfasındaki rehber bölümü: resmi fuar listeleri
export const fuarKaynaklari = [
    { baslik: '2025-2026 destek kapsamındaki yurt dışı fuarlar', kurum: 'Ticaret Bakanlığı', link: 'https://ticaret.gov.tr/ihracat/fuarlar/2025-2026-yillarinda-destek-kapsamina-alinan-yurtdisi-fuarlar' },
    { baslik: '2026 destek kapsamındaki yurt içi fuarlar', kurum: 'Ticaret Bakanlığı', link: 'https://ticaret.gov.tr/ihracat/fuarlar/2026-yilinda-destek-kapsamina-alinan-sektorel-nitelikli-yurt-ici-fuarlar' },
    { baslik: 'Yıllara göre fuar destek üst limitleri', kurum: 'Ticaret Bakanlığı', link: 'https://ticaret.gov.tr/ihracat/fuarlar/yillar-bazinda-fuar-destek-ust-limitleri' },
    { baslik: 'Yükselen Kadınlar Girişimcilik Eğitim Tırı (il il geziyor)', kurum: 'Aile ve Sosyal Hizmetler Bakanlığı · Halkbank', link: 'https://kadingirisimci.gov.tr/' },
];

// ── Ana sayfa: Türkiye'de kadın girişimciliği (resmi kaynaklı rakamlar) ───────
// deger sayısaldır; ondalik basamak, onEk ('%') ve sonEk (' milyar ₺') ile gösterilir.
// ikon: lucide-react ikon adı (App.jsx'teki ISTATISTIK_IKONLARI eşlemesinde olmalı)
export const ulusalIstatistikler = [
    {
        id: "kadin-kredi-ceyrek",
        deger: 98, ondalik: 0, onEk: "", sonEk: " milyar ₺",
        baslik: "Kadın girişimcilere kullandırılan kredi",
        aciklama: "Nisan–Haziran 2026'da 58.412 kadın girişimciye",
        ikon: "Banknote",
        kaynakAd: "Türkiye Bankalar Birliği",
        kaynak: "https://www.alomaliye.com/2026/09/03/kadin-girisimcilere-98-milyar-tl-kredi/",
    },
    {
        id: "kosgeb-girisimci-destek",
        deger: 5.6, ondalik: 1, onEk: "", sonEk: " milyar ₺",
        baslik: "KOSGEB girişimci destek kararı",
        aciklama: "2024'ten bu yana 3.899 projeye",
        ikon: "Landmark",
        kaynakAd: "KOSGEB",
        kaynak: "https://www.kosgeb.gov.tr/site/tr/genel/detay/9374/girisimci-destek-programi-is-gelistirme-cagrisi-2026-yili-2-donem-basvurulari-basladi",
    },
    {
        id: "kadin-ihracat-payi",
        deger: 23.5, ondalik: 1, onEk: "%", sonEk: "",
        baslik: "Türkiye ihracatında kadınların payı",
        aciklama: "2025 itibarıyla (2013'te %20,5)",
        ikon: "Ship",
        kaynakAd: "Ticaret Bakanlığı",
        kaynak: "https://ticaret.gov.tr/haberler/ticaret-bakani-omer-bolat-kadem-koopro-programinin-kapanis-toreninde-konustu",
    },
    {
        id: "kadin-kooperatif-ihracat",
        deger: 96, ondalik: 0, onEk: "", sonEk: " milyon $",
        baslik: "Kadın kooperatiflerinin ihracatı",
        aciklama: "2025'te (2019'da 61 milyon $)",
        ikon: "Handshake",
        kaynakAd: "Ticaret Bakanlığı",
        kaynak: "https://ticaret.gov.tr/haberler/ticaret-bakani-omer-bolat-kadem-koopro-programinin-kapanis-toreninde-konustu",
    },
];

// ── Eğitimler (Eğitimler sayfası) ────────────────────────────────────────────
// Yalnızca resmi bağlantısı doğrulanan, kadın girişimcilere açık eğitimler.
// konu: 'is-kurma' | 'finans' | 'dijital' | 'ihracat'
// sertifika: true (belge veriliyor) | false | null (kaynakta belirtilmemiş)
// adim: "Nereden başlamalıyım?" yolundaki adım (1 iş kurma, 2 para yönetimi, 3 dijital & ihracat)
export const egitimler = [
    {
        id: "kosgeb-online-girisimcilik",
        baslik: "KOSGEB Online Girişimcilik Eğitimi",
        kurum: "KOSGEB",
        konu: "is-kurma", adim: 1,
        bicim: "Online · kendi hızında",
        ucret: "Ücretsiz",
        sertifika: true,
        aciklama: "İş fikri geliştirme, iş modeli, pazarlama ve finansal planlama temelleri. e-Devlet şifresiyle KOSGEB e-Akademi'ye girilerek tamamlanır. Bazı destek ve kredilerde (ör. Halkbank'ın 35 yaş altı sıfır faizli esnaf kredisi) bu eğitimin belgesi şart koşulur.",
        link: "https://lms.kosgeb.gov.tr",
        kaynak: "https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/1231/girisimci-destek-programi",
    },
    {
        id: "iskur-kosgeb-uygulamali",
        baslik: "Uygulamalı Girişimcilik Eğitimi",
        kurum: "İŞKUR · KOSGEB",
        konu: "is-kurma", adim: 1,
        bicim: "Sınıf içi · il müdürlükleri",
        ucret: "Ücretsiz",
        sertifika: true,
        aciklama: "İŞKUR ve KOSGEB iş birliğiyle illerde düzenlenen uygulamalı girişimcilik eğitimi. Tamamlayanlara Uygulamalı Girişimcilik Eğitimi Katılım Belgesi verilir. Açılan dönemler için il İŞKUR veya KOSGEB müdürlüğüne danış.",
        link: "https://www.iskur.gov.tr",
        kaynak: "https://www.alomaliye.com/2016/09/02/iskur-ve-kosgeb-arasindaki-girisimcilik-egitimi-isbirligi-protokolu/",
    },
    {
        id: "yukselen-kadinlar-tir",
        baslik: "Yükselen Kadınlar Girişimcilik Eğitim Tırı",
        kurum: "Aile ve Sosyal Hizmetler Bakanlığı · Halkbank",
        konu: "is-kurma", adim: 1,
        bicim: "Yüz yüze · il il geziyor",
        ucret: "Ücretsiz",
        sertifika: null,
        aciklama: "\"Kendi İşim, Benim İzim\" projesi kapsamında illeri dolaşan mobil eğitim: girişimcilik, dijital pazarlama ve e-ticaret, finansal okuryazarlık, şirket kuruluşu ve kadınlara yönelik devlet destekleri. Tırın iline geleceği tarihi Aile ve Sosyal Hizmetler il müdürlüğü duyurularından takip et.",
        link: "https://kadingirisimci.gov.tr/",
        kaynak: "https://aile.gov.tr/van/haberler/yukselen-kadinlar-girisimcilik-egitim-tiri-van-da-kadin-girisimcilerle-bulustu/",
    },
    {
        id: "halkbank-ureten-kadinlar-akademisi",
        baslik: "Üreten Kadınlar Akademisi",
        kurum: "Halkbank",
        konu: "finans", adim: 2,
        bicim: "Online · video ve makale",
        ucret: "Üyelikle erişim",
        sertifika: true,
        aciklama: "Finansal planlama, nakit akışı yönetimi, marka yönetimi, satış ve pazarlama, e-ihracat, yapay zekâ ve teşvik mevzuatı gibi konularda içerikler ve bir sertifika programı. Siteye üye olarak erişilir.",
        link: "https://uretenkadinlarakademisi.halkbank.com.tr",
        kaynak: "https://kadingirisimci.gov.tr/faydali-linkler/",
    },
    {
        id: "google-dijital-atolye",
        baslik: "Google Dijital Atölye Kursları",
        kurum: "Google (Grow with Google)",
        konu: "dijital", adim: 3,
        bicim: "Online · kendi hızında",
        ucret: "Ücretsiz",
        sertifika: null,
        aciklama: "Dijital pazarlama, arama motorları, sosyal medya ve işletmeni internette görünür kılma gibi temel dijital beceri kursları. Google İşletme Profili ve reklam araçlarıyla ilgili ürün eğitimleri de var.",
        link: "https://skillshop.exceedlms.com/student/catalog/list?category_ids=7899-google-dijital-atolye&locale=tr",
        kaynak: "https://grow.google/intl/tr/",
    },
    {
        id: "ticaret-ihracat-egitimi",
        baslik: "İhracat Süreçleri ve Devlet Destekleri Eğitimi",
        kurum: "Ticaret Bakanlığı",
        konu: "ihracat", adim: 3,
        bicim: "Online · 3 gün",
        ucret: "Ücretsiz",
        sertifika: true,
        aciklama: "İhracatın adımları, gümrük ve lojistik süreçleri ile ihracat destekleri anlatılır. Yılda birkaç dönem açılır (2026'da Mart, Mayıs, Haziran ve Eylül); eğitimin en az üçte ikisine katılanlara dijital katılım belgesi verilir.",
        link: "https://egitimbasvuru.ticaret.gov.tr/Ihracat",
        kaynak: "https://www.alomaliye.com/2026/06/10/ticaret-bakanligi-ihracat-surecleri-ve-devlet-destekleri-egitim-programi-23-24-25-haziran-2026/",
    },
];
