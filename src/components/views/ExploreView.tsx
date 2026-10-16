import { useAccessories } from '../../hooks/useAccessories'
import { CatalogTabs, AccessoryCard } from '../common/AccessoryCatalog'
import type { Accessory } from '../../lib/products'
import { useState } from 'react'
import { getCylinderDisplay, getCylinderImage } from '../../lib/formatters'
import { CYLINDERS_EMPTY_LABEL, CYLINDERS_LOADING_LABEL, useCylinderTypes } from '../../hooks/useCylinderTypes'

interface ExploreViewProps {
  cartCount: number
  onAddAccessory: (product: Accessory, quantity: number) => void
  onBook: (productName: string, price?: number, cylinderTypeId?: number, weight?: string | number) => void
  onNavigateToCart: () => void
}

export function ExploreView({
  cartCount,
  onBook,
  onAddAccessory,
  onNavigateToCart,
}: ExploreViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cylinder' | 'accessory'>('all')
  const { cylinderTypes, isLoading: catalogLoading, error: catalogError, reload: reloadCatalog } = useCylinderTypes()

  const accessories = useAccessories()

  const products = cylinderTypes.map((c) => {
    const display = getCylinderDisplay(c.name, c.weight)
    return {
      id: c.id.toString(),
      rawId: c.id,
      name: c.name,
      displayTitle: display.title,
      displayBadge: display.badge,
      rawWeight: c.weight,
      rawPrice: Number(c.refill_rate) || 0,
      finalPrice: Number(c.final_price ?? c.refill_rate) || 0,
      originalPrice: Number(c.customer_rate ?? c.refill_rate) || 0,
      hasDiscount: Boolean(c.has_discount),
      category: 'cylinder',
      isPopular: c.name.includes('14.2') || (c.weight && String(c.weight).includes('14.2')),
    }
  })

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredAccessories = accessories.products.filter(p => selectedCategory !== 'cylinder' && `${p.name} ${p.description}`.toLowerCase().includes(normalizedQuery))
  const filteredProducts = products.filter((p) => {
    // An empty query matches everything; otherwise match name, display title or badge.
    const matchesSearch =
      !normalizedQuery ||
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.displayTitle.toLowerCase().includes(normalizedQuery) ||
      p.displayBadge.toLowerCase().includes(normalizedQuery)
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="explore-scroll-container">
      {/* 1. Header */}
      <div className="explore-header">
        <h1 className="explore-title">Explore</h1>
        <button className="cart-header-btn" onClick={onNavigateToCart} aria-label="Shopping Cart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
        </button>
      </div>

      {/* 2. Search Field */}
      <div className="explore-search-bar">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search cylinders, accessories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="explore-search-input"
        />
        {searchQuery && (
          <button className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      <CatalogTabs value={selectedCategory} onChange={setSelectedCategory} cylinders={products.length} accessories={accessories.products.length} />
      {selectedCategory !== 'cylinder' && accessories.loading && <p>Loading accessories…</p>}
      {selectedCategory !== 'cylinder' && accessories.error && <p role="alert">{accessories.error} <button onClick={accessories.retry}>Retry</button></p>}
      {/* 4. Quick Book Section */}
      <div className="quick-book-section">
        <div className="quick-book-header">
          <h2 className="section-title">Quick Book</h2>
          <div className="quick-book-subhead">
            <span className="orange-accent-bar" />
            <span className="subhead-text">Popular gas cylinders</span>
          </div>
        </div>

        {/* 2-Column Product Grid */}
        <div className="products-grid">
          {filteredAccessories.map(product => <AccessoryCard key={`accessory-${product.id}`} product={product} onAdd={onAddAccessory} />)}
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="product-card">
              {prod.isPopular && (
                <div className="popular-badge">
                  <span className="flame-icon">🔥</span>
                  <span>Most Popular</span>
                </div>
              )}
              <div className="product-img-container">
                <img src={getCylinderImage(prod.name, prod.rawWeight)} className="product-cylinder-img" alt={prod.name} />
              </div>
              <div className="product-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 className="product-name" style={{ margin: 0 }}>{prod.displayTitle}</h3>
                  <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {prod.displayBadge}
                  </span>
                </div>
                <div className="product-price">
                  {prod.hasDiscount && (
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', textDecoration: 'line-through' }}>
                      ₹{prod.originalPrice.toLocaleString('en-IN')}
                    </div>
                  )}
                  Refill ₹{prod.finalPrice.toLocaleString('en-IN')}
                </div>
                <button className="product-book-btn" onClick={() => onBook(prod.displayBadge, prod.rawPrice, prod.rawId, prod.displayTitle)}>
                  Book
                </button>
              </div>
            </div>
          ))}
          {catalogLoading ? (
            <div className="no-products-found">
              <p>{CYLINDERS_LOADING_LABEL}</p>
            </div>
          ) : catalogError ? (
            <div className="no-products-found">
              <p>{catalogError}</p>
              <button className="product-book-btn" type="button" onClick={reloadCatalog} style={{ marginTop: '8px' }}>
                Retry
              </button>
            </div>
          ) : products.length === 0 && filteredAccessories.length === 0 ? (
            <div className="no-products-found">
              <p>{CYLINDERS_EMPTY_LABEL}</p>
            </div>
          ) : filteredProducts.length === 0 && filteredAccessories.length === 0 && !accessories.loading && !accessories.error ? (
            <div className="no-products-found">
              <p>{normalizedQuery ? `No products match "${searchQuery.trim()}"` : 'No products available in this category yet.'}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* 5. Why Choose GasBook? Section */}
      <div className="why-choose-card">
        <h3 className="why-choose-title">Why Choose GasBook?</h3>
        <div className="why-choose-grid">
          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h4 className="feature-name">On-time Delivery</h4>
            <p className="feature-desc">Always on time</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h4 className="feature-name">Safe &amp; Secure</h4>
            <p className="feature-desc">100% safety</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <h4 className="feature-name">Trusted by 10L+</h4>
            <p className="feature-desc">Happy customers</p>
          </div>
        </div>
      </div>
    </div>
  )
}
