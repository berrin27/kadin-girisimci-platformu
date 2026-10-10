// ── Destek programı verisi doğrulama ─────────────────────────────────────────
// Kullanım: npm run check:programs
// src/data.js'teki programların yapısını ve eşleşme kapsamını kontrol eder.
// Hata varsa 1 ile çıkar (haftalık güncelleme ajanı PR açmadan önce çalıştırır).

import { supportData, basvuruTakvimi, etkinlikler, fuarKaynaklari, ulusalIstatistikler, egitimler, SON_KONTROL } from '../src/data.js';
import { bugunYerel } from '../src/tarih.js';

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

const ETKINLIK_TURLERI = ['Yarışma', 'Ödül', 'Hibe / Fon', 'Hızlandırma', 'Fuar', 'Eğitim'];
const etkinlikIdleri = new Set();
for (const e of etkinlikler) {
  const ad = e.id || e.baslik || '(adsız etkinlik)';
  for (const alan of ['id', 'baslik', 'duzenleyen', 'tur', 'ucret', 'bitis', 'konum', 'aciklama', 'link', 'kaynak']) {
    if (e[alan] == null || e[alan] === '') hata(`Etkinlik ${ad}: "${alan}" alanı boş`);
  }
  if (etkinlikIdleri.has(e.id)) hata(`Etkinlik ${ad}: id tekrarlanıyor`);
  etkinlikIdleri.add(e.id);
  if (!ETKINLIK_TURLERI.includes(e.tur)) hata(`Etkinlik ${ad}: tur "${e.tur}" geçersiz`);
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (e.bitis && !iso.test(e.bitis)) hata(`Etkinlik ${ad}: bitis YYYY-AA-GG olmalı`);
  if (e.baslangic != null && !iso.test(e.baslangic)) hata(`Etkinlik ${ad}: baslangic YYYY-AA-GG veya null olmalı`);
  if (e.baslangic && e.bitis && e.baslangic > e.bitis) hata(`Etkinlik ${ad}: başlangıç bitişten sonra`);
  for (const url of [e.link, e.kaynak]) if (url && !/^https:\/\//.test(url)) hata(`Etkinlik ${ad}: bağlantı https:// olmalı`);
  const bugun = bugunYerel();
  if (e.bitis && e.bitis < bugun) uyarilar.push(`Sona ermiş etkinlik (silinebilir): ${ad} — ${e.bitis}`);
}
for (const k of fuarKaynaklari) if (!/^https:\/\//.test(k.link || '')) hata(`Fuar kaynağı "${k.baslik}": bağlantı https:// olmalı`);

const IKONLAR = ['Banknote', 'Landmark', 'Ship', 'Handshake']; // App.jsx → ISTATISTIK_IKONLARI
for (const st of ulusalIstatistikler) {
  const ad = st.id || st.baslik;
  for (const alan of ['id', 'baslik', 'aciklama', 'kaynakAd', 'kaynak']) if (!st[alan]) hata(`İstatistik ${ad}: "${alan}" boş`);
  if (typeof st.deger !== 'number' || !(st.deger > 0)) hata(`İstatistik ${ad}: deger pozitif sayı olmalı`);
  if (!IKONLAR.includes(st.ikon)) hata(`İstatistik ${ad}: ikon "${st.ikon}" App.jsx'te tanımlı değil`);
  if (!/^https:\/\//.test(st.kaynak || '')) hata(`İstatistik ${ad}: kaynak https:// olmalı`);
}

const EGITIM_KONULARI = ['is-kurma', 'finans', 'dijital', 'ihracat'];
const egitimIdleri = new Set();
for (const e of egitimler) {
  const ad = e.id || e.baslik;
  for (const alan of ['id', 'baslik', 'kurum', 'konu', 'bicim', 'ucret', 'aciklama', 'link', 'kaynak']) if (!e[alan]) hata(`Eğitim ${ad}: "${alan}" boş`);
  if (egitimIdleri.has(e.id)) hata(`Eğitim ${ad}: id tekrarlanıyor`);
  egitimIdleri.add(e.id);
  if (!EGITIM_KONULARI.includes(e.konu)) hata(`Eğitim ${ad}: konu "${e.konu}" geçersiz`);
  if (![1, 2, 3].includes(e.adim)) hata(`Eğitim ${ad}: adim 1, 2 veya 3 olmalı`);
  if (![true, false, null].includes(e.sertifika)) hata(`Eğitim ${ad}: sertifika true/false/null olmalı`);
  for (const url of [e.link, e.kaynak]) if (url && !/^https:\/\//.test(url)) hata(`Eğitim ${ad}: bağlantı https:// olmalı`);
}

// Eşleşme kapsamı: her sektör + yaş + aşama için en az bir program olmalı
// (medeni durum "hepsi" kabul edilerek). Eksikler uyarıdır, hata değil —
// sihirbaz bu durumda aşamayı gevşetip "yakın seçenek" gösterir.
for (const s of SEKTOR) for (const y of YAS) for (const a of ASAMA) {
  if (!supportData.some(p => p.tags.includes(s) && p.tags.includes(y) && p.tags.includes(a))) {
    uyarilar.push(`Tam eşleşme yok: ${s} / ${y} / ${a}`);
  }
}

console.log(`${supportData.length} program, ${etkinlikler.length} etkinlik, ${basvuruTakvimi.length} takvim kaydı, son kontrol: ${SON_KONTROL}`);
if (uyarilar.length) console.log(`\n⚠️  ${uyarilar.length} uyarı:\n  ${uyarilar.slice(0, 30).join('\n  ')}`);
if (hatalar.length) {
  console.error(`\n❌ ${hatalar.length} hata:\n  ${hatalar.join('\n  ')}`);
  process.exit(1);
}
console.log('\n✅ Program verisi geçerli');
