// ── Fortuno API İstemcisi ────────────────────────────────────────────────────
// Tüm backend çağrıları buradan geçer. Oturum httpOnly cookie ile taşınır,
// bu yüzden token'ı JavaScript tarafında saklamaya gerek yoktur.

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Oturum düştüğünde (401) AuthGate'e haber vermek için
const UNAUTHORIZED_EVENT = 'fortuno-unauthorized';
export const onUnauthorized = (handler) => {
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
};

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Sunucuya ulaşılamıyor. İnternet bağlantını kontrol et.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(data.error || 'Beklenmeyen bir hata oluştu.', res.status);
  }
  return data;
}

const get = (path) => request('GET', path);
const put = (path, body = {}) => request('PUT', path, body);
const post = (path, body = {}) => request('POST', path, body);
const del = (path, body = {}) => request('DELETE', path, body);

export const api = {
  auth: {
    me: () => get('/auth/me'),
    login: (email, password) => post('/auth/login', { email, password }),
    register: (email, password) => post('/auth/register', { email, password }),
    logout: () => post('/auth/logout'),
  },
  profile: {
    get: () => get('/profile'),
    save: (profile) => put('/profile', profile),
  },
  kanban: {
    get: () => get('/kanban'),
    save: (cards) => put('/kanban', { cards }),
    add: (kart) => post('/kanban/kart', kart),
  },
  favorites: {
    list: (kind) => get(`/favorites/${kind}`),
    add: (kind, id) => put(`/favorites/${kind}/${encodeURIComponent(id)}`),
    remove: (kind, id) => del(`/favorites/${kind}/${encodeURIComponent(id)}`),
  },
  chat: {
    history: () => get('/chat'),
    send: (message, { useHistory = true } = {}) => post('/chat', { message, useHistory }),
    clear: () => del('/chat'),
  },
  plans: {
    list: () => get('/plans'),
    create: (plan = {}) => post('/plans', plan),
    save: (id, plan) => put(`/plans/${id}`, plan),
    remove: (id) => del(`/plans/${id}`),
  },
  events: {
    list: () => get('/events'),
    create: (event) => post('/events', event),
    remove: (id) => del(`/events/${id}`),
  },
  news: {
    list: (kategori) => get(`/news${kategori ? `?kategori=${encodeURIComponent(kategori)}` : ''}`),
  },
  account: {
    exportData: () => get('/account/export'),
    remove: (password) => del('/account', { password }),
  },
};
