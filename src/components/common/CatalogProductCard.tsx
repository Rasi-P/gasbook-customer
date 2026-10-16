import '../../styles/accessories.css'

interface CatalogProductCardProps {
  kind: 'cylinder' | 'accessory'
  name: string
  category: string
  description: string
  image: string | null
  price: number
  originalPrice?: number
  popular?: boolean
  actionLabel: string
  onAdd: () => void
}

export function CatalogProductCard({ kind, name, category, description, image, price, originalPrice, popular, actionLabel, onAdd }: CatalogProductCardProps) {
  return <article className={`catalog-card ${kind}-card`}>
    {popular && <span className="catalog-popular">🔥 Most Popular</span>}
    <div className="catalog-image">{image ? <img src={image} alt={name} /> : <span>{category}</span>}</div>
    <span className="catalog-category" title={category}>{category}</span>
    <h3 className="catalog-name" title={name}>{name}</h3>
    <p className="catalog-description" title={description}>{description}</p>
    <div className="catalog-price">
      <span className="catalog-original-price" aria-hidden={originalPrice === undefined}>
        {originalPrice !== undefined ? `₹${originalPrice.toLocaleString('en-IN')}` : ''}
      </span>
      <strong>{kind === 'cylinder' && 'Refill '}₹{price.toLocaleString('en-IN')}</strong>
    </div>
    <button className="catalog-action" type="button" onClick={onAdd}>{actionLabel}</button>
  </article>
}
