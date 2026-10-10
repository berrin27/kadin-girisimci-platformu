// ── /api/chat — FortunoAI sohbeti ────────────────────────────────────────────
// Gemini çağrısı sunucuda yapılır; API key tarayıcıya hiç gönderilmez.
// Gemini yoksa/hata verirse kural tabanlı yanıt motoru devreye girer.

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db.js';
import { str } from '../validate.js';
import { SYSTEM_PROMPT, getFallbackResponse } from '../chatbot.js';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_TIMEOUT_MS = 20_000;
const HISTORY_FOR_AI = 20;   // modele gönderilen son mesaj sayısı
const HISTORY_FOR_UI = 40;   // arayüze dönen son mesaj sayısı

if (process.env.VITE_GEMINI_API_KEY) {
  console.warn('[chat] VITE_GEMINI_API_KEY bulundu — VITE_ önekli değişkenler tarayıcıya sızabilir. Adını GEMINI_API_KEY yap.');
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
if (!ai) console.warn('[chat] GEMINI_API_KEY tanımlı değil — yalnızca hazır yanıtlar kullanılacak.');

// Kullanıcı başına dakikada 20 mesaj (API maliyetini korur).
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: req => `user:${req.userId}`,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Çok hızlı mesaj gönderiyorsun, biraz bekleyip tekrar dene. 💜' },
});

const toMessage = r => ({ id: r.id, sender: r.sender, text: r.text, createdAt: r.created_at });

const recentMessages = (userId, limit) => db
  .prepare('SELECT * FROM (SELECT * FROM chat_messages WHERE user_id = ? ORDER BY id DESC LIMIT ?) ORDER BY id')
  .all(userId, limit);

const saveMessage = (userId, sender, text) => {
  const { lastInsertRowid } = db
    .prepare('INSERT INTO chat_messages (user_id, sender, text) VALUES (?, ?, ?)')
    .run(userId, sender, text);
  return db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(lastInsertRowid);
};

async function askGemini(history, message) {
  const contents = [
    ...history.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ];
  const request = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: { systemInstruction: SYSTEM_PROMPT },
  });
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('gemini_timeout')), GEMINI_TIMEOUT_MS));
  const response = await Promise.race([request, timeout]);
  const text = response.text?.trim();
  if (!text) throw new Error('gemini_empty');
  return text;
}

router.get('/', (req, res) => {
  res.json({ messages: recentMessages(req.userId, HISTORY_FOR_UI).map(toMessage) });
});

router.post('/', chatLimiter, async (req, res) => {
  const message = str(req.body?.message, { max: 2000, required: true, field: 'Mesaj' });
  // Bağımsız hızlı sorular geçmişsiz sorulur.
  const useHistory = req.body?.useHistory !== false;

  const history = useHistory ? recentMessages(req.userId, HISTORY_FOR_AI) : [];
  const userRow = saveMessage(req.userId, 'user', message);

  let reply;
  let source = 'ai';
  try {
    if (!ai) throw new Error('no_key');
    reply = await askGemini(history, message);
  } catch (err) {
    if (err.message !== 'no_key') console.warn('[chat] Gemini hatası, hazır yanıta geçiliyor:', err.message);
    reply = getFallbackResponse(message, history);
    source = 'fallback';
  }

  const botRow = saveMessage(req.userId, 'bot', reply);
  res.json({ userMessage: toMessage(userRow), botMessage: toMessage(botRow), source });
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(req.userId);
  res.json({ ok: true });
});

export default router;
