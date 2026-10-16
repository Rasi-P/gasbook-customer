import { type Accessory } from '../../lib/products'
import { CatalogProductCard } from './CatalogProductCard'
import '../../styles/accessories.css'
export function CatalogTabs({ value, onChange, cylinders, accessories }: { value: string; onChange: (value: 'all' | 'cylinder' | 'accessory') => void; cylinders: number; accessories: number }) {
  return <div className="accessory-tabs" aria-label="Product categories">{([['all', 'All Products', cylinders + accessories], ['cylinder', 'Gas Cylinders', cylinders], ['accessory', 'Accessories', accessories]] as const).map(([key, label, count]) => <button type="button" key={key} aria-pressed={value === key} onClick={() => onChange(key)}>{label} ({count})</button>)}</div>
}
export function AccessoryCard({ product, onAdd }: { product: Accessory; onAdd: (product: Accessory, quantity: number) => void }) {
  if (!product.available) return null
  return <CatalogProductCard kind="accessory" name={product.name} category={product.category}
    description={product.description} image={product.image} price={Number(product.selling_price)}
    actionLabel="Add to cart" onAdd={() => onAdd(product, 1)} />
}
