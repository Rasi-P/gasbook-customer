import { CatalogProductCard } from '../common/CatalogProductCard'
import { useAccessories } from '../../hooks/useAccessories'
import { CatalogTabs, AccessoryCard } from '../common/AccessoryCatalog'
import type { Accessory } from '../../lib/products'
import { useState } from 'react'
import { getCylinderDisplay, getCylinderImage } from '../../lib/formatters'
import { CYLINDERS_EMPTY_LABEL, CYLINDERS_LOADING_LABEL, useCylinderTypes } from '../../hooks/useCylinderTypes'

const catalogStatusCardStyle: React.CSSProperties = {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '40px 24px',
  color: '#64748b',
  fontSize: '14.5px',
  background: '#ffffff',
  borderRadius: '20px',
  border: '1px dashed #e2e8f0',
}

interface DesktopExploreViewProps {
  onAddAccessory: (product: Accessory, quantity: number) => void
  onBook: (productName: string, price?: number, cylinderTypeId?: number, weight?: string | number) => void
  onNavigateToCart: () => void
}

export function DesktopExploreView({
  onBook,
  onAddAccessory,
}: DesktopExploreViewProps) {
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
    const matchesSearch =
      !normalizedQuery ||
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.displayTitle.toLowerCase().includes(normalizedQuery) ||
      p.displayBadge.toLowerCase().includes(normalizedQuery)
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

      <CatalogTabs value={selectedCategory} onChange={setSelectedCategory} cylinders={products.length} accessories={accessories.products.length} />
      {selectedCategory !== 'cylinder' && accessories.loading && <p>Loading accessories…</p>}
      {selectedCategory !== 'cylinder' && accessories.error && <p role="alert">{accessories.error} <button onClick={accessories.retry}>Retry</button></p>}
      {/* 3. Product Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}
      >
        {catalogLoading ? (
          <div style={catalogStatusCardStyle}>{CYLINDERS_LOADING_LABEL}</div>
        ) : catalogError ? (
          <div style={catalogStatusCardStyle}>
            <p style={{ margin: '0 0 14px', color: '#dc2626', fontWeight: 600 }}>{catalogError}</p>
            <button
              type="button"
              onClick={reloadCatalog}
              style={{ background: '#1052be', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 && filteredAccessories.length === 0 ? (
          <div style={catalogStatusCardStyle}>{CYLINDERS_EMPTY_LABEL}</div>
        ) : filteredProducts.length === 0 && filteredAccessories.length === 0 && !accessories.loading && !accessories.error ? (
          <div style={catalogStatusCardStyle}>
            {normalizedQuery ? `No products match "${searchQuery.trim()}"` : 'No products available in this category yet.'}
          </div>
        ) : null}
        {filteredProducts.map((prod) => (
          <CatalogProductCard key={prod.id} kind="cylinder" name={prod.displayTitle} category={prod.displayBadge}
            description="Genuine sealed cylinder • Fast doorstep delivery"
            image={getCylinderImage(prod.name, prod.rawWeight)} price={prod.finalPrice}
            originalPrice={prod.hasDiscount ? prod.originalPrice : undefined} popular={Boolean(prod.isPopular)}
            actionLabel="Book Now" onAdd={() => onBook(prod.displayBadge, prod.rawPrice, prod.rawId, prod.displayTitle)} />
        ))}
        {filteredAccessories.map(product => <AccessoryCard key={`accessory-${product.id}`} product={product} onAdd={onAddAccessory} />)}
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
