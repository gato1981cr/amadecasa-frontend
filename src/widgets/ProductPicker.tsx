import React from 'react'
import { api } from '../api'
import type { Product } from '../types'

export default function ProductPicker({ onPick }: { onPick: (p: Product) => void }) {
  const [q, setQ] = React.useState('')
  const [results, setResults] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string|undefined>()

  React.useEffect(() => {
    let cancel = false
    const t = setTimeout(async () => {
      setLoading(true); setError(undefined)
      try {
        const r = await api.products.list(q)
        if (!cancel) setResults(r)
      } catch (e: any) {
        if (!cancel) setError(e.message || 'Error')
      } finally {
        if (!cancel) setLoading(false)
      }
    }, 250)
    return () => { cancel = true; clearTimeout(t) }
  }, [q])

  return (
    <div className="card">
      <input
        placeholder="Buscar producto (ej. Fabuloso, cloro, bolsas)"
        value={q}
        onChange={e=>setQ(e.target.value)}
      />
      {loading ? <div className="tag" style={{marginTop:6}}>Buscando…</div> : null}
      {error ? <div className="tag" style={{color:'#b91c1c', marginTop:6}}>{error}</div> : null}

      <div style={{ maxHeight: 260, overflow: 'auto', marginTop: 8 }}>
        <table>
          <thead>
            <tr><th>Producto</th><th>Presentación</th><th></th></tr>
          </thead>
          <tbody>
            {results.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.name} {p.brand ? <span className="tag">({p.brand})</span> : null}</div>
                  <div className="tag">{p.category || '—'}</div>
                </td>
                <td>{p.presentation || '—'}</td>
                <td><button className="btn" onClick={()=>onPick(p)}>Agregar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
