// ── /api/favorites/:kind — program ve fuar favorileri ────────────────────────

import { Router } from 'express';
import { db } from '../db.js';
import { str, ValidationError } from '../validate.js';

const router = Router();
const KINDS = ['program', 'fuar'];

router.param('kind', (req, res, next, kind) => {
  if (!KINDS.includes(kind)) return next(new ValidationError('Geçersiz favori türü.'));
  next();
});

const list = (userId, kind) => db
  .prepare('SELECT item_id FROM favorites WHERE user_id = ? AND kind = ? ORDER BY created_at')
  .all(userId, kind)
  .map(r => r.item_id);

router.get('/:kind', (req, res) => {
  res.json({ ids: list(req.userId, req.params.kind) });
});

router.put('/:kind/:itemId', (req, res) => {
  const itemId = str(req.params.itemId, { max: 100, required: true, field: 'Öğe' });
  db.prepare('INSERT OR IGNORE INTO favorites (user_id, kind, item_id) VALUES (?, ?, ?)')
    .run(req.userId, req.params.kind, itemId);
  res.json({ ids: list(req.userId, req.params.kind) });
});

router.delete('/:kind/:itemId', (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND kind = ? AND item_id = ?')
    .run(req.userId, req.params.kind, req.params.itemId);
  res.json({ ids: list(req.userId, req.params.kind) });
});

export default router;
