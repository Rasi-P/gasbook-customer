import { useState, useEffect } from 'react'
import { fetchCylinderTypes } from '../../lib/auth'
import { getCylinderDisplay, getCylinderImage } from '../../lib/formatters'

interface DesktopExploreViewProps {
  onBook: (productName: string, price?: number, cylinderTypeId?: number, weight?: string | number) => void
  onNavigateToCart: () => void
}

export function DesktopExploreView({
  onBook,
}: DesktopExploreViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cylinder' | 'connection'>('all')
  const [cylinderTypes, setCylinderTypes] = useState<any[]>([])

  useEffect(() => {
    fetchCylinderTypes()
      .then((data: any[]) => setCylinderTypes(data))
      .catch(() => undefined)
  }, [])

  const products = cylinderTypes.map((c) => {
    const display = getCylinderDisplay(c.name, c.weight)
    return {
      id: c.id.toString(),
      rawId: c.id,
      name: c.name,
      displayTitle: display.title,
      displayBadge: display.badge,
      rawWeight: c.weight,
      rawPrice: Number(c.selling_price) || 0,
      finalPrice: Number(c.final_price || c.selling_price) || 0,
      originalPrice: Number(c.customer_rate || c.selling_price) || 0,
      hasDiscount: Boolean(c.has_discount),
      category: 'cylinder',
      isPopular: c.name.includes('14.2') || (c.weight && String(c.weight).includes('14.2')),
    }
  })

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.displayTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.displayBadge.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="desktop-container">
      {/* 1. Explore Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d3b8f 0%, #1052be 100%)',
          borderRadius: '24px',
          padding: '36px 40px',
          color: '#ffffff',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 12px 30px rgba(16, 82, 190, 0.15)',
        }}
      >
        <div>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            LPG Catalog
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '12px 0 6px', color: '#ffffff' }}>
            Book Your Gas Cylinder
          </h2>
          <p style={{ margin: 0, fontSize: '14.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
            Choose from genuine domestic and commercial LPG sizes with doorstep delivery.
          </p>
        </div>

        {/* Search Input in Banner */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '340px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search cylinder by weight, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: '#1e293b',
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '10px 24px',
            borderRadius: '12px',
            border: selectedCategory === 'all' ? '2px solid #1052be' : '1px solid #e2e8f0',
            background: selectedCategory === 'all' ? '#eff6ff' : '#ffffff',
            color: selectedCategory === 'all' ? '#1052be' : '#475569',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          All Products ({products.length})
        </button>

        <button
          onClick={() => setSelectedCategory('cylinder')}
          style={{
            padding: '10px 24px',
            borderRadius: '12px',
            border: selectedCategory === 'cylinder' ? '2px solid #1052be' : '1px solid #e2e8f0',
            background: selectedCategory === 'cylinder' ? '#eff6ff' : '#ffffff',
            color: selectedCategory === 'cylinder' ? '#1052be' : '#475569',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Gas Cylinders ({products.length})
        </button>
      </div>

      {/* 3. Product Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          marginBottom: '48px',
        }}
      >
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 82, 190, 0.1)'
              e.currentTarget.style.borderColor = '#93c5fd'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.03)'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            {prod.isPopular && (
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#ffedd5',
                  color: '#c2410c',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                🔥 Most Popular
              </span>
            )}

            <div
              style={{
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <img
                src={getCylinderImage(prod.name, prod.rawWeight)}
                alt={prod.name}
                style={{ maxHeight: '130px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}
              />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  alignSelf: 'flex-start',
                  marginBottom: '8px',
                }}
              >
                {prod.displayBadge}
              </span>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
                {prod.displayTitle}
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
                Genuine sealed cylinder • Fast doorstep delivery
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Refill Price</span>
                {prod.hasDiscount && (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', textDecoration: 'line-through', display: 'block' }}>
                    ₹{prod.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
                  ₹{prod.finalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => onBook(prod.displayBadge, prod.rawPrice, prod.rawId, prod.displayTitle)}
                style={{
                  background: '#ff7a00',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 122, 0, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Why Choose GasBook Grid */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '36px 40px',
          border: '1px solid #e2e8f0',
        }}
      >
        <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>
          Why Millions Trust GasBook
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#eff6ff',
                color: '#1052be',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
              Guaranteed On-Time Delivery
            </h4>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              Live GPS tracking and prompt doorstep fulfillment by certified personnel.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
              100% Quality &amp; Safety Inspected
            </h4>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              Every cylinder is weighed and tested against leakages prior to handover.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#fff7ed',
                color: '#ea580c',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
              Transparent &amp; Fixed Pricing
            </h4>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              Government approved standard rates with zero hidden delivery charges.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
