export const API_BASE = ''; // mismo origen (sirviendo frontend detrás del mismo dominio/puerto)

type FetchJsonOpts = {
  method?: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: FetchJsonOpts['query']) {
  const url = new URL(path, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export async function fetchJson<T = any>(path: string, opts: FetchJsonOpts = {}): Promise<T> {
  const url = buildUrl(API_BASE + path, opts.query);
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'include', // IMPORTANTE para la cookie
    signal: opts.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}
