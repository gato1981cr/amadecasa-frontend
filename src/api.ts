import type { Product, RequestDTO } from './types'

const API = '' // misma origin (proxy en dev)

export function getCodes(){
  return {
    admin: localStorage.getItem('adminCode') || '',
    assist: localStorage.getItem('assistCode') || '',
    name: localStorage.getItem('requesterName') || ''
  }
}
export function setCodes(p:{admin?:string,assist?:string,name?:string}){
  if (p.admin!==undefined) localStorage.setItem('adminCode', p.admin)
  if (p.assist!==undefined) localStorage.setItem('assistCode', p.assist)
  if (p.name!==undefined) localStorage.setItem('requesterName', p.name)
}

async function req<T=unknown>(path:string, init:RequestInit={}): Promise<T>{
  const { admin, assist } = getCodes()
  const h = new Headers(init.headers || {})
  if (admin) h.set('x-admin-code', admin)
  if (assist) h.set('x-assist-code', assist)
  if (!h.has('Content-Type') && init.method && init.method !== 'GET') h.set('Content-Type','application/json')
  const r = await fetch(API + path, { ...init, headers: h })
  if (!r.ok) throw new Error(await r.text())
  const ct = r.headers.get('content-type') || ''
  return ct.includes('application/json') ? r.json() as Promise<T> : (r.text() as unknown as T)
}

export const api = {
  products: {
    list: (q:string) => req<Product[]>('/api/products' + (q ? `?q=${encodeURIComponent(q)}` : '')),
    create: (p:Partial<Product>) => req<Product>('/api/products', { method:'POST', body: JSON.stringify(p) })
  },
  requests: {
    create: (payload: RequestDTO) => req<{id:number}>('/api/requests', { method:'POST', body: JSON.stringify(payload) }),
    listAll: () => req<any[]>('/api/requests'),
    async downloadJson(){
      const r = await fetch('/api/requests/export', { headers: { 'x-admin-code': getCodes().admin } })
      if (!r.ok) throw new Error(await r.text())
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'solicitudes.json'
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
    }
  }
}
