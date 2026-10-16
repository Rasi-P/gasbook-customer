import { type Accessory } from '../../lib/products'
import '../../styles/accessories.css'
export function CatalogTabs({ value, onChange, cylinders, accessories }: { value: string; onChange: (value: 'all' | 'cylinder' | 'accessory') => void; cylinders: number; accessories: number }) {
  return <div className="accessory-tabs" aria-label="Product categories">{([['all', 'All Products', cylinders + accessories], ['cylinder', 'Gas Cylinders', cylinders], ['accessory', 'Accessories', accessories]] as const).map(([key, label, count]) => <button type="button" key={key} aria-pressed={value === key} onClick={() => onChange(key)}>{label} ({count})</button>)}</div>
}
export function AccessoryCard({ product, onAdd }: { product: Accessory; onAdd: (product: Accessory, quantity: number) => void }) {
  if (!product.available) return null
  return <article className="accessory-card">{product.image ? <img src={product.image} alt={product.name} /> : <div className="accessory-no-image">{product.category}</div>}
    <h3>{product.name}</h3><p>{product.description}</p><strong>₹{Number(product.selling_price).toLocaleString('en-IN')}</strong>
    <button type="button" onClick={() => onAdd(product, 1)}>Add to cart</button>
  </article>
}
