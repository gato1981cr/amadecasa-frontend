// src/api/auth.ts
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

function api(path: string) {
  return `${API_BASE}${path}`;
}

function randomId(n = 12) {
  const bytes = new Uint8Array(n);
  (crypto?.getRandomValues ?? ((b: Uint8Array) => {
    for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
    return b;
  }))(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getOrCreateDeviceId() {
  const KEY = 'amade_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `web-${randomId(8)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

type Role = 'admin' | 'assistant' | 'guest';

export async function login(params: {
  ownerName: string;
  role: Role;
  password: string;
}) {
  const deviceId = getOrCreateDeviceId();
  const res = await fetch(api('/api/auth/login'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, deviceId }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function status() {
  const res = await fetch(api('/api/auth/status'), {
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function logout() {
  const res = await fetch(api('/api/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
