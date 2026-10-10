// ── /api/profile — kullanıcı profili ─────────────────────────────────────────

import { Router } from 'express';
import { db } from '../db.js';
import { str, oneOf } from '../validate.js';

const router = Router();

const SEKTORLER = ['yerel_isletme', 'ev_emegi', 'teknoloji', 'e_ticaret', 'kooperatif', 'sosyal_girisim', 'kırsal'];
const PROFIL_TIPLERI = ['genc_uni', 'genc_girisimci', 'standart', 'olgun_girisimci'];
const ASAMALAR = ['fikir', 'yeni_kurulmus', 'buyume', 'kriz_donemi', 'kokenlesik'];
const MEDENI_DURUMLAR = ['hepsi', 'bekar', 'evli', 'dul', 'bosanmis'];

// DB satırı → frontend'in kullandığı alan adları
export function toProfile(row) {
  return {
    ad: row?.ad ?? '',
    soyad: row?.soyad ?? '',
    yas: row?.yas ?? '',
    telefon: row?.telefon ?? '',
    sektor: row?.sektor ?? '',
    profilTipi: row?.profil_tipi ?? '',
    asama: row?.asama ?? '',
    medeniDurum: row?.medeni_durum ?? '',
  };
}

router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId);
  res.json({ profile: toProfile(row) });
});

router.put('/', (req, res) => {
  const b = req.body ?? {};
  const p = {
    ad: str(b.ad, { max: 80, field: 'Ad' }),
    soyad: str(b.soyad, { max: 80, field: 'Soyad' }),
    yas: str(b.yas, { max: 3, field: 'Yaş' }),
    telefon: str(b.telefon, { max: 30, field: 'Telefon' }),
    sektor: oneOf(b.sektor, SEKTORLER, { field: 'Sektör' }),
    profilTipi: oneOf(b.profilTipi, PROFIL_TIPLERI, { field: 'Profil tipi' }),
    asama: oneOf(b.asama, ASAMALAR, { field: 'Aşama' }),
    medeniDurum: oneOf(b.medeniDurum, MEDENI_DURUMLAR, { field: 'Medeni durum' }),
  };

  db.prepare(`
    INSERT INTO profiles (user_id, ad, soyad, yas, telefon, sektor, profil_tipi, asama, medeni_durum, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      ad = excluded.ad, soyad = excluded.soyad, yas = excluded.yas, telefon = excluded.telefon,
      sektor = excluded.sektor, profil_tipi = excluded.profil_tipi, asama = excluded.asama,
      medeni_durum = excluded.medeni_durum, updated_at = excluded.updated_at
  `).run(req.userId, p.ad, p.soyad, p.yas, p.telefon, p.sektor, p.profilTipi, p.asama, p.medeniDurum);

  res.json({ profile: p });
});

export default router;
