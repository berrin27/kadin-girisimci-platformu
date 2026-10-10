// ── /api/account — KVKK hakları: verilerimi indir, hesabımı sil ─────────────

import { Router } from 'express';
import { db } from '../db.js';
import { verifyPassword, clearSessionCookie } from '../auth.js';
import { str } from '../validate.js';
import { toProfile } from './profile.js';
import { toApplication } from './applications.js';
import { toCard } from './kanban.js';

const router = Router();

router.get('/export', (req, res) => {
  const id = req.userId;
  const user = db.prepare('SELECT email, created_at FROM users WHERE id = ?').get(id);
  const favs = db.prepare('SELECT kind, item_id FROM favorites WHERE user_id = ?').all(id);

  res.json({
    exportedAt: new Date().toISOString(),
    account: { email: user.email, createdAt: user.created_at },
    profile: toProfile(db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(id)),
    applications: db.prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY id').all(id).map(toApplication),
    kanban: db.prepare('SELECT * FROM kanban_cards WHERE user_id = ? ORDER BY position').all(id).map(toCard),
    favorites: {
      program: favs.filter(f => f.kind === 'program').map(f => f.item_id),
      fuar: favs.filter(f => f.kind === 'fuar').map(f => f.item_id),
    },
    chat: db.prepare('SELECT sender, text, created_at FROM chat_messages WHERE user_id = ? ORDER BY id').all(id),
  });
});

// Hesabı ve tüm ilişkili verileri kalıcı olarak siler (ON DELETE CASCADE).
// Yanlışlıkla silmeye karşı şifre teyidi istenir.
router.delete('/', async (req, res) => {
  const password = str(req.body?.password, { max: 200, required: true, field: 'Şifre' });
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.userId);
  if (!(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'Şifre hatalı.' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);
  clearSessionCookie(res);
  res.json({ ok: true });
});

export default router;
