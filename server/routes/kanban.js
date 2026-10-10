// ── /api/kanban — başvuru takip panosu ───────────────────────────────────────
// Frontend tüm kart listesini tek seferde kaydeder (sürükle-bırak, sıralama),
// bu yüzden PUT tüm listeyi bir transaction içinde değiştirir.

import { Router } from 'express';
import { db, transaction } from '../db.js';
import { str, oneOf, ValidationError } from '../validate.js';

const router = Router();

const COLUMNS = ['arastirma', 'hazirlik', 'basvuruldu', 'beklemede', 'sonuc'];
const PRIORITIES = ['yuksek', 'orta', 'dusuk'];
const SONUCLAR = ['kabul', 'ret'];
const MAX_CARDS = 200;

export function toCard(r) {
  return {
    id: r.id,
    title: r.title,
    institution: r.institution,
    amount: r.amount,
    column: r.column_id,
    deadline: r.deadline,
    priority: r.priority,
    note: r.note,
    starred: !!r.starred,
    sonuc: r.sonuc,
    color: r.color,
  };
}

router.get('/', (req, res) => {
  const { kanban_initialized } = db
    .prepare('SELECT kanban_initialized FROM users WHERE id = ?')
    .get(req.userId);
  const rows = db
    .prepare('SELECT * FROM kanban_cards WHERE user_id = ? ORDER BY position')
    .all(req.userId);
  // initialized=false → kullanıcı panoyu hiç kaydetmemiş, frontend örnek kartları gösterir.
  res.json({ initialized: !!kanban_initialized, cards: rows.map(toCard) });
});

router.put('/', (req, res) => {
  const list = req.body?.cards;
  if (!Array.isArray(list)) throw new ValidationError('cards bir liste olmalıdır.');
  if (list.length > MAX_CARDS) throw new ValidationError(`En fazla ${MAX_CARDS} kart kaydedilebilir.`);

  const cards = list.map(c => ({
    id: str(c?.id, { max: 50, required: true, field: 'Kart id' }),
    title: str(c?.title, { max: 200, required: true, field: 'Başlık' }),
    institution: str(c?.institution, { max: 200, field: 'Kurum' }),
    amount: str(c?.amount, { max: 100, field: 'Tutar' }),
    column: oneOf(c?.column, COLUMNS, { field: 'Sütun', allowEmpty: false }),
    deadline: str(c?.deadline, { max: 10, field: 'Son tarih' }),
    priority: oneOf(c?.priority || 'orta', PRIORITIES, { field: 'Öncelik', allowEmpty: false }),
    note: str(c?.note, { max: 2000, field: 'Not' }),
    starred: c?.starred ? 1 : 0,
    sonuc: c?.sonuc ? oneOf(c.sonuc, SONUCLAR, { field: 'Sonuç' }) : null,
    color: str(c?.color, { max: 20, field: 'Renk' }),
  }));

  const ids = new Set(cards.map(c => c.id));
  if (ids.size !== cards.length) throw new ValidationError('Kart id\'leri benzersiz olmalıdır.');

  const insert = db.prepare(`
    INSERT INTO kanban_cards (user_id, id, title, institution, amount, column_id, deadline,
                              priority, note, starred, sonuc, color, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  transaction(() => {
    db.prepare('DELETE FROM kanban_cards WHERE user_id = ?').run(req.userId);
    cards.forEach((c, i) => insert.run(
      req.userId, c.id, c.title, c.institution, c.amount, c.column, c.deadline,
      c.priority, c.note, c.starred, c.sonuc, c.color, i,
    ));
    db.prepare('UPDATE users SET kanban_initialized = 1 WHERE id = ?').run(req.userId);
  });

  res.json({ initialized: true, cards: cards.map(c => ({ ...c, starred: !!c.starred })) });
});

export default router;
