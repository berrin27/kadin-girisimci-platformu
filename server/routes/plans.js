// ── /api/plans — iş planı taslakları ─────────────────────────────────────────
// İş planı alanları profilden bağımsızdır (bir kişinin birden fazla iş fikri
// olabilir); her plan kendi form verisini JSON olarak saklar.

import { Router } from 'express';
import { db } from '../db.js';
import { str, oneOf, ValidationError } from '../validate.js';

const router = Router();

const SABLONLAR = ['onePage', 'bank', 'investor'];
const MAX_PLAN = 20;
const METIN_ALANLARI = { projectName: 120, sector: 120, market: 2000, traction: 2000 };
const SAYI_ALANLARI = ['monthlyRevenue', 'monthlyExpense', 'monthlyDebtService', 'startupCost',
  'equity', 'loanAmount', 'teamSize'];
const MAX_TUTAR = 1e12;
const ETIKET = {
  projectName: 'İş adı', sector: 'Sektör', market: 'Pazar hedefi', traction: 'Büyüme açıklaması',
  monthlyRevenue: 'Aylık gelir', monthlyExpense: 'Aylık gider', monthlyDebtService: 'Aylık borç servisi',
  startupCost: 'Başlangıç maliyeti', equity: 'Öz sermaye', loanAmount: 'Kredi tutarı', teamSize: 'Çalışan sayısı',
};

// Bilinmeyen alanları atar; boş sayı alanları '' olarak kalır (form ipucunu göstersin)
function temizVeri(veri) {
  if (veri == null || typeof veri !== 'object' || Array.isArray(veri)) {
    throw new ValidationError('Plan verisi geçersiz.');
  }
  const sonuc = {};
  for (const [alan, max] of Object.entries(METIN_ALANLARI)) {
    sonuc[alan] = str(veri[alan], { max, field: ETIKET[alan] });
  }
  for (const alan of SAYI_ALANLARI) {
    const v = veri[alan];
    if (v === '' || v == null) { sonuc[alan] = ''; continue; }
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > MAX_TUTAR) throw new ValidationError(`${ETIKET[alan]} geçerli bir sayı olmalı.`);
    sonuc[alan] = n;
  }
  return sonuc;
}

const toPlan = (r) => ({
  id: r.id,
  sablon: r.sablon,
  veri: JSON.parse(r.veri),
  olusturuldu: r.created_at,
  guncellendi: r.updated_at,
});

const planiGetir = (userId, id) =>
  db.prepare('SELECT * FROM business_plans WHERE id = ? AND user_id = ?').get(Number(id), userId);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM business_plans WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
    .all(req.userId);
  res.json({ plans: rows.map(toPlan) });
});

router.post('/', (req, res) => {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM business_plans WHERE user_id = ?').get(req.userId);
  if (n >= MAX_PLAN) throw new ValidationError(`En fazla ${MAX_PLAN} iş planı oluşturabilirsiniz.`);

  const veri = temizVeri(req.body?.veri ?? {});
  const sablon = oneOf(req.body?.sablon || 'onePage', SABLONLAR, { field: 'Şablon', allowEmpty: false });
  const { lastInsertRowid } = db.prepare('INSERT INTO business_plans (user_id, sablon, veri) VALUES (?, ?, ?)')
    .run(req.userId, sablon, JSON.stringify(veri));
  res.status(201).json({ plan: toPlan(planiGetir(req.userId, lastInsertRowid)) });
});

router.put('/:id', (req, res) => {
  if (!planiGetir(req.userId, req.params.id)) return res.status(404).json({ error: 'Plan bulunamadı.' });
  const veri = temizVeri(req.body?.veri);
  const sablon = oneOf(req.body?.sablon || 'onePage', SABLONLAR, { field: 'Şablon', allowEmpty: false });
  db.prepare("UPDATE business_plans SET sablon = ?, veri = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?")
    .run(sablon, JSON.stringify(veri), Number(req.params.id), req.userId);
  res.json({ plan: toPlan(planiGetir(req.userId, req.params.id)) });
});

router.delete('/:id', (req, res) => {
  const { changes } = db.prepare('DELETE FROM business_plans WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.userId);
  if (!changes) return res.status(404).json({ error: 'Plan bulunamadı.' });
  res.json({ ok: true });
});

export { toPlan };
export default router;
