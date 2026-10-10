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
