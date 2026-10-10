// ── Fortuno Veritabanı (SQLite) ──────────────────────────────────────────────
// Node'un yerleşik node:sqlite modülü kullanılır — native derleme gerekmez.
// Şema değişiklikleri MIGRATIONS dizisine sırayla eklenir; user_version ile
// hangi migration'ın uygulandığı takip edilir.

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || resolve(__dirname, 'data', 'fortuno.db');

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

const MIGRATIONS = [
  // 1 — ilk şema
  `
  CREATE TABLE users (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    email             TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash     TEXT NOT NULL,
    kanban_initialized INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE profiles (
    user_id      INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    ad           TEXT NOT NULL DEFAULT '',
    soyad        TEXT NOT NULL DEFAULT '',
    yas          TEXT NOT NULL DEFAULT '',
    telefon      TEXT NOT NULL DEFAULT '',
    sektor       TEXT NOT NULL DEFAULT '',
    profil_tipi  TEXT NOT NULL DEFAULT '',
    asama        TEXT NOT NULL DEFAULT '',
    medeni_durum TEXT NOT NULL DEFAULT '',
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE applications (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id          TEXT NOT NULL,
    program_title       TEXT NOT NULL,
    program_institution TEXT NOT NULL DEFAULT '',
    program_amount      TEXT NOT NULL DEFAULT '',
    durum               TEXT NOT NULL DEFAULT 'beklemede',
    ad                  TEXT NOT NULL,
    soyad               TEXT NOT NULL,
    yas                 TEXT NOT NULL DEFAULT '',
    telefon             TEXT NOT NULL,
    email               TEXT NOT NULL DEFAULT '',
    sehir               TEXT NOT NULL DEFAULT '',
    motivasyon          TEXT NOT NULL DEFAULT '',
    is_aciklamasi       TEXT NOT NULL DEFAULT '',
    kvkk_onay_at        TEXT NOT NULL,
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_applications_user ON applications(user_id);

  CREATE TABLE kanban_cards (
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id          TEXT NOT NULL,
    title       TEXT NOT NULL,
    institution TEXT NOT NULL DEFAULT '',
    amount      TEXT NOT NULL DEFAULT '',
    column_id   TEXT NOT NULL,
    deadline    TEXT NOT NULL DEFAULT '',
    priority    TEXT NOT NULL DEFAULT 'orta',
    note        TEXT NOT NULL DEFAULT '',
    starred     INTEGER NOT NULL DEFAULT 0,
    sonuc       TEXT,
    color       TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, id)
  );

  CREATE TABLE favorites (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL CHECK (kind IN ('program', 'fuar')),
    item_id    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, kind, item_id)
  );

  CREATE TABLE chat_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender     TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
    text       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_chat_user ON chat_messages(user_id, id);
  `,

  // 2 — sunucu tarafında çekilen haberler (server/news.js)
  `
  CREATE TABLE news_items (
    id            TEXT PRIMARY KEY,           -- haber bağlantısının özeti (tekilleştirme)
    kategori      TEXT NOT NULL,
    baslik        TEXT NOT NULL,
    link          TEXT NOT NULL,
    kaynak_ad     TEXT NOT NULL DEFAULT '',
    kaynak_url    TEXT NOT NULL DEFAULT '',
    resmi         INTEGER NOT NULL DEFAULT 0, -- kaynak .gov.tr ise 1
    yayin_tarihi  TEXT NOT NULL,              -- ISO 8601
    son_gorulme   TEXT NOT NULL               -- akışta en son görüldüğü an (ISO 8601)
  );
  CREATE INDEX idx_news_tarih ON news_items(yayin_tarihi DESC);
  `,

  // 3 — kullanıcıların iş planı taslakları (her kullanıcı birden fazla plan tutabilir)
  `
  CREATE TABLE business_plans (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sablon     TEXT NOT NULL DEFAULT 'onePage',
    veri       TEXT NOT NULL DEFAULT '{}',   -- form alanları (JSON)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_plans_user ON business_plans(user_id, updated_at DESC);
  `,

  // 4 — kullanıcının kendi eklediği fuar/etkinlikler (yalnızca kendisi görür)
  `
  CREATE TABLE user_events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    baslik     TEXT NOT NULL,
    tarih      TEXT NOT NULL,               -- YYYY-AA-GG
    saat       TEXT NOT NULL DEFAULT '',    -- SS:DD (opsiyonel)
    konum      TEXT NOT NULL DEFAULT '',
    link       TEXT NOT NULL DEFAULT '',
    notlar     TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX idx_user_events ON user_events(user_id, tarih);
  `,

  // 5 — takip kartlarına resmi bağlantı ve başvuru tarihi; eski örnek (demo)
  // kartları temizle. Örnek kartların id'si k1–k5'tir; kullanıcı kartları
  // k<zaman damgası> veya p-<program id> biçimindedir, bu yüzden karışmaz.
  `
  ALTER TABLE kanban_cards ADD COLUMN link TEXT NOT NULL DEFAULT '';
  ALTER TABLE kanban_cards ADD COLUMN basvuru_tarihi TEXT NOT NULL DEFAULT '';
  DELETE FROM kanban_cards WHERE id IN ('k1', 'k2', 'k3', 'k4', 'k5');
  `,
];

function migrate() {
  const { user_version: current } = db.prepare('PRAGMA user_version').get();
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
}

migrate();

// Birden çok sorguyu tek işlemde çalıştırır; hata olursa geri alır.
export function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
