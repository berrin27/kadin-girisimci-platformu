// ── /api/auth — kayıt, giriş, çıkış, oturum bilgisi ─────────────────────────

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { db } from '../db.js';
import {
  hashPassword, verifyPassword, setSessionCookie, clearSessionCookie, requireAuth,
} from '../auth.js';
import { email, str, ValidationError } from '../validate.js';

const router = Router();

// Kaba kuvvet denemelerine karşı: IP başına 15 dakikada 20 deneme.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin.' },
});

const MIN_PASSWORD = 8;

router.post('/register', authLimiter, async (req, res) => {
  const mail = email(req.body?.email);
  const password = str(req.body?.password, { max: 200, required: true, field: 'Şifre' });
  if (password.length < MIN_PASSWORD) {
    throw new ValidationError(`Şifre en az ${MIN_PASSWORD} karakter olmalıdır.`);
  }

  const exists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(mail);
  if (exists) return res.status(409).json({ error: 'Bu e-posta ile zaten bir hesap var.' });

  const hash = await hashPassword(password);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(mail, hash);
  const userId = Number(lastInsertRowid);
  db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(userId);

  setSessionCookie(res, userId);
  res.status(201).json({ user: { id: userId, email: mail } });
});

router.post('/login', authLimiter, async (req, res) => {
  const mail = email(req.body?.email);
  const password = str(req.body?.password, { max: 200, required: true, field: 'Şifre' });

  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(mail);
  // Kullanıcı yoksa da aynı mesaj — hangi e-postaların kayıtlı olduğu sızmasın.
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
  }

  setSessionCookie(res, user.id);
  res.json({ user: { id: user.id, email: user.email } });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.userId);
  res.json({ user: { id: user.id, email: user.email, createdAt: user.created_at } });
});

export default router;
