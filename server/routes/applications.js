// ── /api/applications — hibe/program başvuruları ─────────────────────────────

import { Router } from 'express';
import { db } from '../db.js';
import { str, email, ValidationError } from '../validate.js';

const router = Router();

export function toApplication(r) {
  return {
    id: r.id,
    programId: r.program_id,
    programTitle: r.program_title,
    programInstitution: r.program_institution,
    programAmount: r.program_amount,
    durum: r.durum,
    ad: r.ad,
    soyad: r.soyad,
    yas: r.yas,
    telefon: r.telefon,
    email: r.email,
    sehir: r.sehir,
    motivasyon: r.motivasyon,
    isAciklamasi: r.is_aciklamasi,
    kvkkOnayTarihi: r.kvkk_onay_at,
    tarih: r.created_at,
  };
}

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY id DESC')
    .all(req.userId);
  res.json({ applications: rows.map(toApplication) });
});

router.post('/', (req, res) => {
  const b = req.body ?? {};
  if (b.onayKvkk !== true) throw new ValidationError('KVKK onayı zorunludur.');

  const a = {
    programId: str(b.programId, { max: 100, required: true, field: 'Program' }),
    programTitle: str(b.programTitle, { max: 200, required: true, field: 'Program adı' }),
    programInstitution: str(b.programInstitution, { max: 200, field: 'Kurum' }),
    programAmount: str(b.programAmount, { max: 100, field: 'Tutar' }),
    ad: str(b.ad, { max: 80, required: true, field: 'Ad' }),
    soyad: str(b.soyad, { max: 80, required: true, field: 'Soyad' }),
    yas: str(b.yas, { max: 3, field: 'Yaş' }),
    telefon: str(b.telefon, { max: 30, required: true, field: 'Telefon' }),
    email: email(b.email, { required: false }),
    sehir: str(b.sehir, { max: 80, field: 'Şehir' }),
    motivasyon: str(b.motivasyon, { max: 3000, field: 'Motivasyon' }),
    isAciklamasi: str(b.isAciklamasi, { max: 3000, field: 'İş açıklaması' }),
  };

  const { lastInsertRowid } = db.prepare(`
    INSERT INTO applications (
      user_id, program_id, program_title, program_institution, program_amount,
      ad, soyad, yas, telefon, email, sehir, motivasyon, is_aciklamasi, kvkk_onay_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    req.userId, a.programId, a.programTitle, a.programInstitution, a.programAmount,
    a.ad, a.soyad, a.yas, a.telefon, a.email, a.sehir, a.motivasyon, a.isAciklamasi,
  );

  const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(lastInsertRowid);
  res.status(201).json({ application: toApplication(row) });
});

export default router;
