import React from 'react'
import { api } from '../api'

type RequestWithItems = {
  id:number
  requester:string
  created_at:string
  items: Array<{ id:number, name:string|null, product_id:number|null, quantity:number, unit:string|null, notes:string|null }>
}

export default function AdminPage(){
  const [data, setData] = React.useState<RequestWithItems[]>([])
  const [loading, setLoading] = React.useState(true)

  async function load(){
    setLoading(true)
    try {
      const r = await api.requests.listAll()
      setData(r || [])
    } finally { setLoading(false) }
  }
  React.useEffect(()=>{ load() },[])

  return (
    <div className="container" style={{paddingTop:12}}>
      <h2 className="title">Panel de Admin</h2>
      <div className="row" style={{margin:'8px 0'}}>
        <button className="btn" onClick={load}>Actualizar</button>
        <button className="btn primary" onClick={()=>api.requests.downloadJson()}>Descargar JSON</button>
      </div>

      {loading ? <p className="tag">Cargando…</p> : null}

      {data.map(r => (
        <div key={r.id} className="card" style={{marginBottom:8}}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <div><strong>Solicitud #{r.id}</strong> · {r.requester}</div>
            <div className="tag">{new Date(r.created_at).toLocaleString()}</div>
          </div>
          <table>
            <thead><tr><th>Producto</th><th>Cant.</th><th>Unidad</th><th>Notas</th></tr></thead>
            <tbody>
              {r.items.map(it => (
                <tr key={it.id}>
                  <td>{it.name ?? `(cat#${it.product_id})`}</td>
                  <td>{it.quantity}</td>
                  <td>{it.unit || '—'}</td>
                  <td>{it.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {!loading && !data.length ? <p className="tag">Sin solicitudes aún.</p> : null}
    </div>
  )
}
