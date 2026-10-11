// Kurum adı → public/logolar/ altındaki logo dosyası. Logolar Wikimedia
// Commons'tan indirildi; kurumu tanıtmak için kullanılır. Bir kart birden fazla
// kurum içeriyorsa ("İŞKUR · KOSGEB") metinde ilk geçen kurumun logosu seçilir.
const LOGOLAR = [
  ['Halkbank', 'halkbank'],
  ['KOSGEB', 'kosgeb'],
  ['TÜBİTAK', 'tubitak'],
  ['Garanti', 'garanti'],
  ['EY', 'ey'],
  ['Ticaret Bakanlığı', 'ticaret'],
  ['İŞKUR', 'iskur'],
  ['Google', 'google'],
  ['Tarım ve Kırsal Kalkınmayı Destekleme', 'tkdk'],
  ['Sosyal Güvenlik Kurumu', 'sgk'],
  ['Gelir İdaresi', 'gib'],
  ['Aile ve Sosyal Hizmetler', 'aile'],
  ['Tarım ve Orman', 'tarim'],
  ['Avrupa Komisyonu', 'avrupa'],
];

export function kurumLogosu(ad = '') {
  let secilen = null;
  let enErken = Infinity;
  for (const [anahtar, dosya] of LOGOLAR) {
    // "EY" gibi kısa adlar yalnızca tam kelime olarak eşleşsin
    const m = new RegExp(`(^|[^\\p{L}])${anahtar}([^\\p{L}]|$)`, 'u').exec(ad);
    if (m && m.index < enErken) { enErken = m.index; secilen = dosya; }
  }
  return secilen ? `/logolar/${secilen}.svg` : null;
}
