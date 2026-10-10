// ── /api/kanban — başvuru takip panosu ───────────────────────────────────────
// Frontend tüm kart listesini tek seferde kaydeder (sürükle-bırak, sıralama),
// bu yüzden PUT tüm listeyi bir transaction içinde değiştirir.

import { Router } from 'express';
import { db, transaction } from '../db.js';
import { str, oneOf, ValidationError } from '../validate.js';

const router = Router();

// Planlıyorum · Başvurdum · Sonuç
const COLUMNS = ['arastirma', 'basvuruldu', 'sonuc'];
// resmi sayfa açıldıktan sonra sormadan önce beklenen süre (dakika)
const HATIRLATMA_GECIKME_DK = Number(process.env.HATIRLATMA_GECIKME_DK ?? 2);
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
    link: r.link,
    basvuruTarihi: r.basvuru_tarihi,
    resmiSayfaAcildi: r.resmi_sayfa_acildi,
  };
}

const temizLink = (v) => {
  const link = str(v, { max: 500, field: 'Bağlantı' });
  if (link && !/^https?:\/\//i.test(link)) throw new ValidationError('Bağlantı http:// veya https:// ile başlamalı.');
  return link;
};
const temizTarih = (v, field) => {
  const t = str(v, { max: 10, field });
  if (t && !/^\d{4}-\d{2}-\d{2}$/.test(t)) throw new ValidationError(`${field} YYYY-AA-GG biçiminde olmalı.`);
  return t;
};

router.get('/', (req, res) => {
  const { kanban_initialized } = db
    .prepare('SELECT kanban_initialized FROM users WHERE id = ?')
    .get(req.userId);
  const rows = db
    .prepare('SELECT * FROM kanban_cards WHERE user_id = ? ORDER BY position')
    .all(req.userId);
  // initialized: kullanıcı panoyu en az bir kez kaydetti mi (yeni kullanıcıda boş pano gösterilir)
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
    deadline: temizTarih(c?.deadline, 'Son tarih'),
    priority: oneOf(c?.priority || 'orta', PRIORITIES, { field: 'Öncelik', allowEmpty: false }),
    note: str(c?.note, { max: 2000, field: 'Not' }),
    starred: c?.starred ? 1 : 0,
    sonuc: c?.sonuc ? oneOf(c.sonuc, SONUCLAR, { field: 'Sonuç' }) : null,
    color: str(c?.color, { max: 20, field: 'Renk' }),
    link: temizLink(c?.link),
    basvuruTarihi: temizTarih(c?.basvuruTarihi, 'Başvuru tarihi'),
    resmiSayfaAcildi: c?.column === 'arastirma' ? str(c?.resmiSayfaAcildi, { max: 30, field: 'Hatırlatma' }) : '',
  }));

  const ids = new Set(cards.map(c => c.id));
  if (ids.size !== cards.length) throw new ValidationError('Kart id\'leri benzersiz olmalıdır.');

  const insert = db.prepare(`
    INSERT INTO kanban_cards (user_id, id, title, institution, amount, column_id, deadline,
                              priority, note, starred, sonuc, color, position, link, basvuru_tarihi, resmi_sayfa_acildi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  transaction(() => {
    db.prepare('DELETE FROM kanban_cards WHERE user_id = ?').run(req.userId);
    cards.forEach((c, i) => insert.run(
      req.userId, c.id, c.title, c.institution, c.amount, c.column, c.deadline,
      c.priority, c.note, c.starred, c.sonuc, c.color, i, c.link, c.basvuruTarihi, c.resmiSayfaAcildi,
    ));
    db.prepare('UPDATE users SET kanban_initialized = 1 WHERE id = ?').run(req.userId);
  });

  res.json({ initialized: true, cards: cards.map(c => ({ ...c, starred: !!c.starred })) });
});

// Destek Bul sonuçlarından "Takibime ekle": programı "İlgileniyorum" sütununa ekler.
// Aynı program ikinci kez eklenmez (id: p-<program id>).
router.post('/kart', (req, res) => {
  const b = req.body ?? {};
  const programId = str(b.programId, { max: 100, required: true, field: 'Program' });
  const id = `p-${programId}`;
  const var_mi = db.prepare('SELECT 1 FROM kanban_cards WHERE user_id = ? AND id = ?').get(req.userId, id);
  if (var_mi) return res.status(409).json({ error: 'Bu program zaten takibinde.' });
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM kanban_cards WHERE user_id = ?').get(req.userId);
  if (n >= MAX_CARDS) throw new ValidationError(`En fazla ${MAX_CARDS} kart kaydedilebilir.`);

  const kart = {
    title: str(b.title, { max: 200, required: true, field: 'Başlık' }),
    institution: str(b.institution, { max: 200, field: 'Kurum' }),
    amount: str(b.amount, { max: 100, field: 'Tutar' }),
    link: temizLink(b.link),
    deadline: temizTarih(b.deadline, 'Son tarih'),
  };
  const { pos } = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM kanban_cards WHERE user_id = ?').get(req.userId);
  transaction(() => {
    db.prepare(`
      INSERT INTO kanban_cards (user_id, id, title, institution, amount, column_id, deadline, priority, note,
                                starred, sonuc, color, position, link, basvuru_tarihi)
      VALUES (?, ?, ?, ?, ?, 'arastirma', ?, 'orta', '', 0, NULL, '#7c3aed', ?, ?, '')
    `).run(req.userId, id, kart.title, kart.institution, kart.amount, kart.deadline, pos, kart.link);
    db.prepare('UPDATE users SET kanban_initialized = 1 WHERE id = ?').run(req.userId);
  });
  res.status(201).json({ card: toCard(db.prepare('SELECT * FROM kanban_cards WHERE user_id = ? AND id = ?').get(req.userId, id)) });
});

// ── "Başvurunu tamamladın mı?" hatırlatması ──────────────────────────────────
// Kullanıcı Planlıyorum'daki bir programın resmi sayfasını açınca zaman kaydedilir;
// birkaç dakika sonra siteye döndüğünde sorulur.
const kartiGetir = (userId, id) => db.prepare('SELECT * FROM kanban_cards WHERE user_id = ? AND id = ?').get(userId, id);

router.post('/kart/:id/resmi-sayfa', (req, res) => {
  const kart = kartiGetir(req.userId, req.params.id);
  if (!kart) return res.status(404).json({ error: 'Kart bulunamadı.' });
  if (kart.column_id === 'arastirma') {
    db.prepare('UPDATE kanban_cards SET resmi_sayfa_acildi = ? WHERE user_id = ? AND id = ?')
      .run(new Date().toISOString(), req.userId, kart.id);
  }
  res.json({ card: toCard(kartiGetir(req.userId, kart.id)) });
});

router.get('/hatirlatmalar', (req, res) => {
  const sinir = new Date(Date.now() - HATIRLATMA_GECIKME_DK * 60_000).toISOString();
  const rows = db.prepare(`
    SELECT * FROM kanban_cards
    WHERE user_id = ? AND column_id = 'arastirma' AND resmi_sayfa_acildi != '' AND resmi_sayfa_acildi <= ?
    ORDER BY resmi_sayfa_acildi
  `).all(req.userId, sinir);
  res.json({ cards: rows.map(toCard) });
});

// basvurdum: true → kart Başvurdum'a taşınır (tarih istemciden: kullanıcının yerel günü)
router.post('/kart/:id/hatirlatma-cevap', (req, res) => {
  const kart = kartiGetir(req.userId, req.params.id);
  if (!kart) return res.status(404).json({ error: 'Kart bulunamadı.' });
  if (req.body?.basvurdum === true) {
    const tarih = temizTarih(req.body?.tarih, 'Başvuru tarihi') || new Date().toISOString().slice(0, 10);
    db.prepare(`UPDATE kanban_cards SET column_id = 'basvuruldu', basvuru_tarihi = ?, resmi_sayfa_acildi = '' WHERE user_id = ? AND id = ?`)
      .run(kart.basvuru_tarihi || tarih, req.userId, kart.id);
  } else {
    db.prepare(`UPDATE kanban_cards SET resmi_sayfa_acildi = '' WHERE user_id = ? AND id = ?`).run(req.userId, kart.id);
  }
  res.json({ card: toCard(kartiGetir(req.userId, kart.id)) });
});

export default router;
