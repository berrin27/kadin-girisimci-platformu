// ── Destek programı verisi doğrulama ─────────────────────────────────────────
// Kullanım: npm run check:programs
// src/data.js'teki programların yapısını ve eşleşme kapsamını kontrol eder.
// Hata varsa 1 ile çıkar (haftalık güncelleme ajanı PR açmadan önce çalıştırır).

import { supportData, basvuruTakvimi, SON_KONTROL } from '../src/data.js';

const SEKTOR = ['yerel_isletme', 'ev_emegi', 'teknoloji', 'e_ticaret', 'kooperatif', 'sosyal_girisim', 'kırsal'];
const YAS = ['genc_uni', 'genc_girisimci', 'standart', 'olgun_girisimci'];
const ASAMA = ['fikir', 'yeni_kurulmus', 'buyume', 'kriz_donemi', 'kokenlesik'];
const MEDENI = ['bekar', 'evli', 'dul', 'bosanmis'];
const ETIKETLER = new Set([...SEKTOR, ...YAS, ...ASAMA, ...MEDENI]);
const DESTEK_TURLERI = ['hibe', 'kredi', 'geri_odemeli', 'yatirim', 'vergi', 'sosyal_yardim', 'mentorluk'];
const ZORUNLU = ['id', 'title', 'institution', 'amount', 'type', 'destekTuru', 'link', 'kaynak',
  'basvuruDurumu', 'tags', 'description', 'highlight'];

const hatalar = [];
const uyarilar = [];
const hata = (m) => hatalar.push(m);

if (!/^(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık) \d{4}$/.test(SON_KONTROL)) {
  hata(`SON_KONTROL "${SON_KONTROL}" biçimi "Ekim 2026" gibi olmalı`);
}

const idler = new Set();
for (const p of supportData) {
  const ad = p.id || p.title || '(adsız)';
  for (const alan of ZORUNLU) {
    if (p[alan] == null || p[alan] === '') hata(`${ad}: "${alan}" alanı boş`);
  }
  if (!('hibeUstLimit' in p) || !('finansmanUstLimit' in p)) hata(`${ad}: hibeUstLimit/finansmanUstLimit alanı yok (bilinmiyorsa null)`);
  for (const alan of ['hibeUstLimit', 'finansmanUstLimit']) {
    if (p[alan] != null && !(Number.isInteger(p[alan]) && p[alan] > 0)) hata(`${ad}: ${alan} pozitif tam sayı veya null olmalı`);
  }
  if (idler.has(p.id)) hata(`${ad}: id tekrarlanıyor`);
  idler.add(p.id);
  if (!DESTEK_TURLERI.includes(p.destekTuru)) hata(`${ad}: destekTuru "${p.destekTuru}" geçersiz`);
  if (p.destekTuru !== 'hibe' && p.hibeUstLimit != null) hata(`${ad}: hibe olmayan programda hibeUstLimit dolu`);
  for (const url of [p.link, p.kaynak]) {
    if (url && !/^https:\/\//.test(url)) hata(`${ad}: bağlantı https:// ile başlamalı (${url})`);
  }
  const tags = p.tags || [];
  for (const t of tags) if (!ETIKETLER.has(t)) hata(`${ad}: bilinmeyen etiket "${t}"`);
  for (const [grup, liste] of [['sektör', SEKTOR], ['yaş', YAS], ['aşama', ASAMA], ['medeni durum', MEDENI]]) {
    if (!tags.some(t => liste.includes(t))) hata(`${ad}: en az bir ${grup} etiketi olmalı`);
  }
}

for (const t of basvuruTakvimi) {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (!t.program || !t.kurum) hata(`Takvim: program/kurum boş (${JSON.stringify(t)})`);
  if (!iso.test(t.baslangic) || !iso.test(t.bitis)) hata(`Takvim "${t.program}": tarihler YYYY-AA-GG olmalı`);
  else if (t.baslangic > t.bitis) hata(`Takvim "${t.program}": başlangıç bitişten sonra`);
}

// Eşleşme kapsamı: her sektör + yaş + aşama için en az bir program olmalı
// (medeni durum "hepsi" kabul edilerek). Eksikler uyarıdır, hata değil —
// sihirbaz bu durumda aşamayı gevşetip "yakın seçenek" gösterir.
for (const s of SEKTOR) for (const y of YAS) for (const a of ASAMA) {
  if (!supportData.some(p => p.tags.includes(s) && p.tags.includes(y) && p.tags.includes(a))) {
    uyarilar.push(`Tam eşleşme yok: ${s} / ${y} / ${a}`);
  }
}

console.log(`${supportData.length} program, ${basvuruTakvimi.length} takvim kaydı, son kontrol: ${SON_KONTROL}`);
if (uyarilar.length) console.log(`\n⚠️  ${uyarilar.length} uyarı:\n  ${uyarilar.slice(0, 30).join('\n  ')}`);
if (hatalar.length) {
  console.error(`\n❌ ${hatalar.length} hata:\n  ${hatalar.join('\n  ')}`);
  process.exit(1);
}
console.log('\n✅ Program verisi geçerli');
