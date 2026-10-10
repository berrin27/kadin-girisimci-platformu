// ── Fortuno API Sunucusu ─────────────────────────────────────────────────────
// Geliştirme: Vite (5173) /api isteklerini bu sunucuya (3001) yönlendirir.
// Production: `npm run build` sonrası dist/ klasörünü de bu sunucu servis eder.

import express from 'express';
import cookieParser from 'cookie-parser';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import './db.js';
import { requireAuth } from './auth.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import applicationRoutes from './routes/applications.js';
import kanbanRoutes from './routes/kanban.js';
import favoriteRoutes from './routes/favorites.js';
import chatRoutes from './routes/chat.js';
import accountRoutes from './routes/account.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // reverse proxy arkasında doğru IP (rate limit için)
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

// Basit CSRF koruması: durum değiştiren isteklerde JSON zorunlu.
// Tarayıcılar başka sitelerden cross-origin JSON isteğini preflight olmadan gönderemez.
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !req.is('application/json')) {
    return res.status(415).json({ error: 'İstek gövdesi JSON olmalıdır.' });
  }
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', requireAuth, profileRoutes);
app.use('/api/applications', requireAuth, applicationRoutes);
app.use('/api/kanban', requireAuth, kanbanRoutes);
app.use('/api/favorites', requireAuth, favoriteRoutes);
app.use('/api/chat', requireAuth, chatRoutes);
app.use('/api/account', requireAuth, accountRoutes);
app.use('/api', (req, res) => res.status(404).json({ error: 'Bulunamadı.' }));

// Production: derlenmiş frontend'i servis et
const DIST = resolve(__dirname, '..', 'dist');
if (process.env.NODE_ENV === 'production' && existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(resolve(DIST, 'index.html')));
}

// Merkezi hata yakalayıcı (Express 5 async hataları da buraya düşer)
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('[api]', err);
  res.status(status).json({ error: status >= 500 ? 'Sunucu hatası, lütfen tekrar deneyin.' : err.message });
});

app.listen(PORT, () => {
  console.log(`[api] Fortuno API http://localhost:${PORT} adresinde çalışıyor`);
});
