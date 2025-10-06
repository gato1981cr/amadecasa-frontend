import type { CartItem } from '../types'

export default function ItemRow({ item, onChange, onRemove } : {
  item: CartItem,
  onChange: (v: CartItem) => void,
  onRemove: () => void
}) {
  return (
    <div className="card">
      <div className="row">
        <div style={{ flex: 2 }}>
          <input value={item.name} onChange={e=>onChange({ ...item, name: e.target.value })} placeholder="Nombre del producto" />
        </div>
        <div style={{ width: 110 }}>
          <input type="number" min={0} step={0.5} value={item.quantity}
                 onChange={e=>onChange({ ...item, quantity: parseFloat(e.target.value) || 0 })} placeholder="Cant." />
        </div>
        <div style={{ width: 120 }}>
          <select value={item.unit} onChange={e=>onChange({ ...item, unit: e.target.value })}>
            <option value="unidad">unidad</option>
            <option value="paquete">paquete</option>
            <option value="botella">botella</option>
            <option value="bolsa">bolsa</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="L">L</option>
            <option value="ml">ml</option>
            <option value="par">par</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <input value={item.notes || ''} onChange={e=>onChange({ ...item, notes: e.target.value })} placeholder="Notas (opcional)" />
        </div>
        <div>
          <button className="btn" onClick={onRemove}>Quitar</button>
        </div>
      </div>
    </div>
  )
}
