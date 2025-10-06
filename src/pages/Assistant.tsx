import React from 'react'
import { api, getCodes } from '../api'
import type { CartItem, Product, RequestDTO } from '../types'
import ProductPicker from '../widgets/ProductPicker'
import ItemRow from '../widgets/ItemRow'

export default function AssistantPage(){
  const [items, setItems] = React.useState<CartItem[]>([])
  const name = getCodes().name || ''

  function addProduct(p: Product){
    setItems(prev => [...prev, { productId: p.id, name: p.name, quantity: 1, unit: p.unit || 'unidad' }])
  }
  function addManual(){
    setItems(prev => [...prev, { name:'', quantity:1, unit:'unidad' }])
  }
  function updateItem(i:number, it:CartItem){
    setItems(prev => prev.map((p,idx)=> idx===i ? it : p))
  }
  function removeItem(i:number){
    setItems(prev => prev.filter((_,idx)=> idx!==i))
  }

  async function submit(){
    if (!name) return alert('Falta tu nombre (vuelve al login)')
    if (!items.length) return alert('Agrega al menos un producto')
    for(const it of items) if (!(it.quantity>0)) return alert('Cantidades deben ser > 0')
    const payload: RequestDTO = { requester: name, items }
    await api.requests.create(payload)
    alert('Solicitud enviada ✅')
    setItems([])
  }

  return (
    <div className="container" style={{paddingTop:12}}>
      <h2 className="title">Hola {name || '👋'}</h2>
      <p className="subtitle">Busca productos o agrega manualmente. Indica cantidades y envía.</p>

      <ProductPicker onPick={addProduct} />

      <div className="row" style={{margin:'8px 0'}}>
        <button className="btn" onClick={addManual}>Agregar producto manual</button>
      </div>

      <div className="grid">
        {items.map((it,idx)=>(
          <ItemRow key={idx} item={it} onChange={(v)=>updateItem(idx,v)} onRemove={()=>removeItem(idx)} />
        ))}
      </div>

      <div className="row" style={{marginTop:12}}>
        <button className="btn primary" onClick={submit} disabled={!items.length}>Enviar solicitud</button>
        <span className="pill">Ítems: {items.length}</span>
      </div>
    </div>
  )
}
