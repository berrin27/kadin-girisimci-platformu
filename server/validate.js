// ── Girdi Doğrulama Yardımcıları ─────────────────────────────────────────────

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

// Metin alanı: string'e çevirir, kırpar, uzunluğu sınırlar.
export function str(value, { max = 500, required = false, field = 'alan' } = {}) {
  const s = value == null ? '' : String(value).trim();
  if (required && !s) throw new ValidationError(`${field} zorunludur.`);
  if (s.length > max) throw new ValidationError(`${field} en fazla ${max} karakter olabilir.`);
  return s;
}

// İzin verilen değerlerden biri olmalı (boş değer için allowEmpty).
export function oneOf(value, allowed, { field = 'alan', allowEmpty = true } = {}) {
  const s = value == null ? '' : String(value);
  if (allowEmpty && s === '') return s;
  if (!allowed.includes(s)) throw new ValidationError(`${field} geçersiz.`);
  return s;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function email(value, { required = true } = {}) {
  const s = str(value, { max: 254, required, field: 'E-posta' }).toLowerCase();
  if (s && !EMAIL_RE.test(s)) throw new ValidationError('Geçerli bir e-posta adresi girin.');
  return s;
}
