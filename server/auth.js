// ── Kimlik Doğrulama ─────────────────────────────────────────────────────────
// Şifreler scrypt + rastgele salt ile hash'lenir. Oturum, httpOnly cookie
// içindeki imzalı JWT ile tutulur — JavaScript tarafından okunamaz (XSS'e karşı).

import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

export const COOKIE_NAME = 'fortuno_session';
const SESSION_DAYS = 7;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET ortam değişkeni production ortamında zorunludur.');
}
// Geliştirmede secret yoksa her başlatmada rastgele üretilir (oturumlar sıfırlanır).
const SECRET = JWT_SECRET || randomBytes(32).toString('hex');

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LEN);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [algo, saltHex, hashHex] = stored.split('$');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(expected, actual);
}

export function setSessionCookie(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, SECRET, { expiresIn: `${SESSION_DAYS}d` });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

// Oturum zorunlu rotalar için middleware — req.userId'yi doldurur.
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' });
  try {
    const payload = jwt.verify(token, SECRET);
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(Number(payload.sub));
    if (!user) throw new Error('user_not_found'); // hesap silinmiş
    req.userId = user.id;
    next();
  } catch {
    clearSessionCookie(res);
    res.status(401).json({ error: 'Oturumunuzun süresi doldu, lütfen tekrar giriş yapın.' });
  }
}
