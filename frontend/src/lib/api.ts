const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken() {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}

async function req(path: string, opts: RequestInit = {}) {
  const t = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(e.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  login: (userid: string, password: string) =>
    req('/api/login', { method: 'POST', body: JSON.stringify({ userid, password }) }),
  stats: () => req('/api/dashboard/stats'),
  monthlyReport: () => req('/api/reports/monthly'),
  getStickers: (p?: Record<string, string>) =>
    req('/api/stickers' + (p ? '?' + new URLSearchParams(p) : '')),
  createSticker: (d: object) => req('/api/stickers', { method: 'POST', body: JSON.stringify(d) }),
  updateSticker: (id: number, d: object) => req(`/api/stickers/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteSticker: (id: number) => req(`/api/stickers/${id}`, { method: 'DELETE' }),
  getVehicles: (p?: Record<string, string>) =>
    req('/api/vehicles' + (p ? '?' + new URLSearchParams(p) : '')),
  createVehicle: (d: object) => req('/api/vehicles', { method: 'POST', body: JSON.stringify(d) }),
  getOwners: () => req('/api/owners'),
  createOwner: (d: object) => req('/api/owners', { method: 'POST', body: JSON.stringify(d) }),
  getUsers: () => req('/api/users'),
  createUser: (d: object) => req('/api/users', { method: 'POST', body: JSON.stringify(d) }),
};
