// ── Tarih yardımcıları ───────────────────────────────────────────────────────
// "Bugün" kullanıcının yerel saatine göre YYYY-AA-GG. toISOString() UTC verir;
// İstanbul'da gece 00:00–03:00 arası bir önceki günü döndürürdü.
export const bugunYerel = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
