// ── /api/news — güncel haberler (sunucuda önbelleğe alınmış) ─────────────────

import { Router } from 'express';
import { KATEGORILER, listNews, sonGuncelleme, durum } from '../news.js';
import { oneOf } from '../validate.js';

const router = Router();
const TAZE_SAAT = 2; // son başarılı güncelleme bundan yeniyse "canlı" sayılır

router.get('/', (req, res) => {
  const kategori = oneOf(req.query.kategori, KATEGORILER.map(k => k.id), { field: 'Kategori' }) || undefined;
  const guncellendi = sonGuncelleme();
  const taze = guncellendi && Date.now() - new Date(guncellendi).getTime() < TAZE_SAAT * 3_600_000;

  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    items: listNews({ kategori }),
    guncellendi,
    canli: !!taze,
    hataliKaynaklar: Object.keys(durum.hatalar),
  });
});

export default router;
