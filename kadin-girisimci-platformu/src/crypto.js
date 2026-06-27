// ── Fortuno Veri Güvenliği Modülü ────────────────────────────────────────────
// AES-256-GCM şifreleme ile localStorage verilerini korur.
// Web Crypto API kullanır — tarayıcı yerleşik, harici bağımlılık yok.

const ANAHTAR_KEY = 'fortuno-enc-key';
const ALGORITHM = 'AES-GCM';

// ── Şifreleme Anahtarı Üret veya Getir ──────────────────────────────────────
async function getOrCreateKey() {
  try {
    const stored = localStorage.getItem(ANAHTAR_KEY);
    if (stored) {
      const keyData = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      return await crypto.subtle.importKey(
        'raw', keyData, { name: ALGORITHM }, false, ['encrypt', 'decrypt']
      );
    }

    // İlk kullanımda yeni anahtar üret
    const key = await crypto.subtle.generateKey(
      { name: ALGORITHM, length: 256 }, true, ['encrypt', 'decrypt']
    );
    const exported = await crypto.subtle.exportKey('raw', key);
    const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
    localStorage.setItem(ANAHTAR_KEY, b64);
    return key;
  } catch (err) {
    console.warn('[Fortuno Crypto] Anahtar oluşturulamadı:', err);
    return null;
  }
}

// ── Şifrele ──────────────────────────────────────────────────────────────────
export async function sifrele(veri) {
  try {
    const key = await getOrCreateKey();
    if (!key) return JSON.stringify(veri); // fallback: düz kaydet

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(veri));
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv }, key, encoded
    );

    // IV + ciphertext birleştir, base64 yap
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return '🔒' + btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.warn('[Fortuno Crypto] Şifreleme hatası:', err);
    return JSON.stringify(veri);
  }
}

// ── Çöz ──────────────────────────────────────────────────────────────────────
export async function coz(sifreliVeri) {
  try {
    // Şifrelenmemiş eski veri kontrolü
    if (!sifreliVeri || !sifreliVeri.startsWith('🔒')) {
      return JSON.parse(sifreliVeri);
    }

    const key = await getOrCreateKey();
    if (!key) return JSON.parse(sifreliVeri.slice(2)); // fallback

    const raw = atob(sifreliVeri.slice(2));
    const combined = Uint8Array.from(raw, c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv }, key, data
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (err) {
    console.warn('[Fortuno Crypto] Çözme hatası:', err);
    // Eski formatta olabilir, düz parse dene
    try {
      const cleaned = sifreliVeri.startsWith('🔒') ? sifreliVeri.slice(2) : sifreliVeri;
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

// ── Güvenli localStorage Yardımcıları ────────────────────────────────────────
export async function guvenliKaydet(key, veri) {
  const sifrelenmis = await sifrele(veri);
  localStorage.setItem(key, sifrelenmis);
}

export async function guvenliOku(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return await coz(raw);
}

// ── Tüm Fortuno Verilerini Sil ───────────────────────────────────────────────
export function tumVerileriSil() {
  const fortunoKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('fortuno-')) {
      fortunoKeys.push(k);
    }
  }
  fortunoKeys.forEach(k => localStorage.removeItem(k));
}

// ── Veri Dışa Aktarma (KVKK hakkı) ──────────────────────────────────────────
export async function verileriDisaAktar() {
  const veriler = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('fortuno-') && k !== ANAHTAR_KEY) {
      veriler[k] = await guvenliOku(k);
    }
  }
  return veriler;
}
