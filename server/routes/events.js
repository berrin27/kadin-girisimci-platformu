// ── /api/events — kullanıcının kendi eklediği fuar ve etkinlikler ────────────
// Platformun doğrulanmış etkinlik listesi src/data.js'tedir; buradakiler
// kullanıcının kişisel takvimidir ve yalnızca kendisine görünür.

import { Router } from 'express';
import { db } from '../db.js';
import { str, ValidationError } from '../validate.js';

const router = Router();
const MAX_ETKINLIK = 100;

export const toEvent = (r) => ({
  id: r.id,
  baslik: r.baslik,
  tarih: r.tarih,
  saat: r.saat,
  konum: r.konum,
  link: r.link,
  notlar: r.notlar,
});

function temizEtkinlik(b = {}) {
  const tarih = str(b.tarih, { max: 10, required: true, field: 'Tarih' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tarih) || Number.isNaN(new Date(`${tarih}T00:00:00Z`).getTime())) {
    throw new ValidationError('Tarih YYYY-AA-GG biçiminde olmalı.');
  }
  const saat = str(b.saat, { max: 5, field: 'Saat' });
  if (saat && !/^([01]\d|2[0-3]):[0-5]\d$/.test(saat)) throw new ValidationError('Saat SS:DD biçiminde olmalı.');
  const link = str(b.link, { max: 500, field: 'Bağlantı' });
  if (link && !/^https?:\/\//i.test(link)) throw new ValidationError('Bağlantı http:// veya https:// ile başlamalı.');
  return {
    baslik: str(b.baslik, { max: 150, required: true, field: 'Etkinlik adı' }),
    tarih,
    saat,
    konum: str(b.konum, { max: 150, field: 'Konum' }),
    link,
    notlar: str(b.notlar, { max: 1000, field: 'Not' }),
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM user_events WHERE user_id = ? ORDER BY tarih, saat').all(req.userId);
  res.json({ events: rows.map(toEvent) });
});

router.post('/', (req, res) => {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM user_events WHERE user_id = ?').get(req.userId);
  if (n >= MAX_ETKINLIK) throw new ValidationError(`En fazla ${MAX_ETKINLIK} etkinlik ekleyebilirsiniz.`);
  const e = temizEtkinlik(req.body);
  const { lastInsertRowid } = db.prepare(`
    INSERT INTO user_events (user_id, baslik, tarih, saat, konum, link, notlar) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId, e.baslik, e.tarih, e.saat, e.konum, e.link, e.notlar);
  res.status(201).json({ event: toEvent(db.prepare('SELECT * FROM user_events WHERE id = ?').get(lastInsertRowid)) });
});

router.delete('/:id', (req, res) => {
  const { changes } = db.prepare('DELETE FROM user_events WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.userId);
  if (!changes) return res.status(404).json({ error: 'Etkinlik bulunamadı.' });
  res.json({ ok: true });
});

export default router;
