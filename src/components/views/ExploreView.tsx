import { useState, useEffect } from 'react'
import splashCylinder from '../../assets/splash_cylinder.png'
import { fetchCylinderTypes } from '../../lib/auth'

interface ExploreViewProps {
  cartCount: number
  onBook: (productName: string, price?: number, cylinderTypeId?: number) => void
  onNavigateToCart: () => void
}

export function ExploreView({
  cartCount,
  onBook,
  onNavigateToCart,
}: ExploreViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cylinder' | 'connection'>('all')
  const [cylinderTypes, setCylinderTypes] = useState<any[]>([])

  useEffect(() => {
    fetchCylinderTypes()
      .then((data: any[]) => setCylinderTypes(data))
      .catch(() => undefined)
  }, [])

  const products = cylinderTypes.map((c) => ({
    id: c.id.toString(),
    rawId: c.id,
    name: c.name,
    rawPrice: Number(c.selling_price) || 0,
    price: `₹${Number(c.selling_price).toLocaleString('en-IN')}`,
    category: 'cylinder',
    isPopular: c.name.includes('14.2'),
  }))

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (selectedCategory === 'cylinder' && p.category === 'cylinder') ||
      searchQuery === ''
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

      {/* 3. Categories (ONLY 2 CATEGORIES) */}
      <div className="explore-categories-section">
        <div className="section-header">
          <h2 className="section-title">Categories</h2>
          <button className="view-all-btn" onClick={() => setSelectedCategory('all')}>
            <span>View all</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <div className="categories-two-grid">
          {/* Category 1: Gas Cylinder */}
          <div
            className={`category-card cylinder-category ${selectedCategory === 'cylinder' ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === 'cylinder' ? 'all' : 'cylinder')}
            role="button"
            tabIndex={0}
          >
            <div className="category-img-wrapper">
              <img src={splashCylinder} className="category-cylinder-img" alt="Gas Cylinder" />
            </div>
            <span className="category-name">Gas Cylinder</span>
          </div>

          {/* Category 2: New Connection */}
          <div
            className={`category-card connection-category ${selectedCategory === 'connection' ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === 'connection' ? 'all' : 'connection')}
            role="button"
            tabIndex={0}
          >
            <div className="category-img-wrapper">
              <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Clipboard body */}
                <rect x="22" y="24" width="56" height="68" rx="8" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="4" />
                {/* Clipboard clip */}
                <rect x="36" y="16" width="28" height="14" rx="4" fill="#3B82F6" />
                <circle cx="50" cy="23" r="3" fill="#FFFFFF" />
                {/* Checklist lines with checkmarks */}
                <path d="M32 40L36 44L44 36" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="48" y1="40" x2="68" y2="40" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" />
                
                <path d="M32 54L36 58L44 50" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="48" y1="54" x2="68" y2="54" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" />
                
                <path d="M32 68L36 72L44 64" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="48" y1="68" x2="68" y2="68" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" />
                
                {/* Blue verified badge */}
                <circle cx="70" cy="74" r="14" fill="#1D4ED8" />
                <path d="M64 74L68 78L76 70" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="category-name">New Connection</span>
          </div>
        </div>
      </div>

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
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="product-card">
              {prod.isPopular && (
                <div className="popular-badge">
                  <span className="flame-icon">🔥</span>
                  <span>Most Popular</span>
                </div>
              )}
              <div className="product-img-container">
                <img src={splashCylinder} className="product-cylinder-img" alt={prod.name} />
              </div>
              <div className="product-details">
                <h3 className="product-name">{prod.name}</h3>
                <div className="product-price">{prod.price}</div>
                <button className="product-book-btn" onClick={() => onBook(prod.name, prod.rawPrice, prod.rawId)}>
                  Book
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="no-products-found">
              <p>No products match "{searchQuery}"</p>
            </div>
          )}
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
