import { useState, useEffect } from 'react'
import type { OrderItem } from '../../types'
import type { CustomerProfile } from '../../lib/auth'
import { fetchCylinderTypes } from '../../lib/auth'
import { getCylinderDisplay, getCylinderImage } from '../../lib/formatters'
import heroBg from '../../assets/hero_bg.png'

interface DesktopHomeViewProps {
  onNavigateToExplore: () => void
  customerProfile: CustomerProfile | null
  latestActiveOrder?: OrderItem | null
  onViewOrders?: () => void
  onTrackOrder?: (bookingId: number) => void
  onBook: (productName: string, price?: number, cylinderTypeId?: number, weight?: string | number) => void
}

function getGreetingName(customerProfile: CustomerProfile | null) {
  return customerProfile?.name?.trim() || customerProfile?.full_name?.trim() || 'Customer'
}

export function DesktopHomeView({
  onNavigateToExplore,
  customerProfile,
  latestActiveOrder,
  onViewOrders,
  onTrackOrder,
  onBook,
}: DesktopHomeViewProps) {
  const [cylinderTypes, setCylinderTypes] = useState<any[]>([])
  const [copiedCoupon, setCopiedCoupon] = useState(false)

  const greetingName = getGreetingName(customerProfile)
  const hasActiveOrder = Boolean(latestActiveOrder)

  useEffect(() => {
    fetchCylinderTypes()
      .then((data: any[]) => setCylinderTypes(data))
      .catch(() => undefined)
  }, [])

  const popularCylinders = cylinderTypes.slice(0, 4).map((c) => {
    const display = getCylinderDisplay(c.name, c.weight)
    return {
      id: c.id,
      rawId: c.id,
      name: c.name,
      displayTitle: display.title,
      displayBadge: display.badge,
      rawWeight: c.weight,
      rawPrice: Number(c.selling_price) || 0,
      price: `₹${Number(c.selling_price).toLocaleString('en-IN')}`,
    }
  })

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('GAS50')
    setCopiedCoupon(true)
    setTimeout(() => setCopiedCoupon(false), 2000)
  }

  return (
    <div className="desktop-container">
      {/* 1. Hero & Active Order 2-Column Section */}
      <div className="desktop-home-grid">
        {/* Left Hero Card */}
        <div className="desktop-hero-banner">
          <div
            className="desktop-hero-bg-overlay"
            style={{ backgroundImage: `url(${heroBg})` }}
          />

          <div className="desktop-hero-content">
            <div className="desktop-hero-pill">
              <span>👋 Welcome back, {greetingName} • Fast LPG Delivery</span>
            </div>
            <h2 className="desktop-hero-title">
              Reliable energy for your home, delivered on time.
            </h2>
            <p className="desktop-hero-desc">
              Book certified cylinders in seconds with live dispatch tracking and genuine doorstep service.
            </p>
            <button className="desktop-hero-cta" onClick={onNavigateToExplore}>
              <span>Book Cylinder Now</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Active Order Widget */}
        {hasActiveOrder && latestActiveOrder ? (
          <div className="desktop-active-order-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1052be', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Delivery
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                    {latestActiveOrder.orderNumber}
                  </h3>
                </div>
                <span
                  style={{
                    background: latestActiveOrder.statusCode === 'pending' ? '#fef3c7' : '#dcfce7',
                    color: latestActiveOrder.statusCode === 'pending' ? '#92400e' : '#166534',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {latestActiveOrder.statusLabel}
                </span>
              </div>

              {/* Product and Price */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: '#f8fafc', padding: '14px', borderRadius: '14px', marginBottom: '16px' }}>
                <img src={getCylinderImage(latestActiveOrder.productName, latestActiveOrder.weight)} alt="" style={{ height: '48px', objectFit: 'contain' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#1e293b' }}>
                    {latestActiveOrder.productName}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                    {latestActiveOrder.weight} • <strong style={{ color: '#1e293b' }}>{latestActiveOrder.price}</strong>
                  </div>
                </div>
              </div>

              {/* Delivery Agent Info */}
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                {latestActiveOrder.rawBooking?.assigned_staff_name ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', padding: '10px 14px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>👤</span>
                      <span style={{ fontWeight: 600, color: '#1e40af' }}>
                        Partner: {latestActiveOrder.rawBooking.assigned_staff_name}
                      </span>
                    </div>
                    {latestActiveOrder.rawBooking?.assigned_staff_phone && (
                      <a
                        href={`tel:${latestActiveOrder.rawBooking.assigned_staff_phone}`}
                        style={{ color: '#2563eb', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}
                      >
                        📞 Call
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Status: {latestActiveOrder.etaOrDate}
                  </div>
                )}
              </div>
            </div>

            {/* Track Button */}
            <button
              onClick={() => {
                if (onTrackOrder && latestActiveOrder?.rawBooking?.id) {
                  onTrackOrder(latestActiveOrder.rawBooking.id)
                }
              }}
              style={{
                width: '100%',
                background: '#1052be',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Live Track Delivery</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="desktop-active-order-empty">
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#1052be',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
              No Active Delivery
            </h4>
            <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b', maxWidth: '240px', lineHeight: 1.4 }}>
              Your ongoing cylinder bookings and live delivery progress will appear here.
            </p>
            <button
              onClick={onNavigateToExplore}
              style={{
                background: '#1052be',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Book a Refill
            </button>
          </div>
        )}
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="desktop-quick-actions-bar">
        <div className="desktop-action-btn" onClick={onNavigateToExplore}>
          <div className="desktop-action-icon" style={{ background: '#eff6ff', color: '#1052be' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <div>
            <div className="desktop-action-title">Book Cylinder</div>
            <div className="desktop-action-desc">Fast instant refill</div>
          </div>
        </div>

        <div
          className="desktop-action-btn"
          onClick={() => {
            if (hasActiveOrder && latestActiveOrder?.rawBooking?.id) {
              onTrackOrder?.(latestActiveOrder.rawBooking.id)
            } else if (onViewOrders) {
              onViewOrders()
            }
          }}
        >
          <div className="desktop-action-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div>
            <div className="desktop-action-title">Track Order</div>
            <div className="desktop-action-desc">Live dispatch status</div>
          </div>
        </div>

        <div className="desktop-action-btn" onClick={onViewOrders}>
          <div className="desktop-action-icon" style={{ background: '#fdf4ff', color: '#9333ea' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div className="desktop-action-title">Order History</div>
            <div className="desktop-action-desc">Past invoices &amp; receipts</div>
          </div>
        </div>

        <div className="desktop-action-btn">
          <div className="desktop-action-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <div>
            <div className="desktop-action-title">Customer Care</div>
            <div className="desktop-action-desc">24/7 delivery assistance</div>
          </div>
        </div>
      </div>

      {/* 3. Popular Cylinders Catalog */}
      <div style={{ marginBottom: '40px' }}>
        <div className="desktop-section-header">
          <div>
            <h3 className="desktop-section-title">Popular LPG Cylinders</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
              Choose your required cylinder capacity for immediate delivery.
            </p>
          </div>
          <button className="desktop-section-link" onClick={onNavigateToExplore}>
            <span>View All Cylinders</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <div className="desktop-cylinder-grid">
          {popularCylinders.map((prod) => (
            <div key={prod.id} className="desktop-cylinder-card">
              <div className="desktop-cylinder-img-wrap">
                <img src={getCylinderImage(prod.name, prod.rawWeight)} className="desktop-cylinder-img" alt={prod.name} />
              </div>
              <div className="desktop-cylinder-info">
                <span className="desktop-cylinder-badge">{prod.displayBadge}</span>
                <h4 className="desktop-cylinder-title">{prod.displayTitle}</h4>
              </div>
              <div className="desktop-cylinder-bottom">
                <span className="desktop-cylinder-price">{prod.price}</span>
                <button
                  className="desktop-book-btn"
                  onClick={() => onBook(prod.displayBadge, prod.rawPrice, prod.rawId, prod.displayTitle)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Offers & Safety 2-Column Row */}
      <div className="desktop-promo-safety-row">
        {/* Offer Box */}
        <div className="desktop-promo-card">
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Exclusive Offer
            </span>
            <h4 style={{ margin: '4px 0 4px', fontSize: '20px', fontWeight: 800, color: '#9a3412' }}>
              Get ₹50 OFF On Your Refill
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#c2410c' }}>
              Use promo code at checkout for instant discount.
            </p>
          </div>
          <button
            onClick={handleCopyCoupon}
            style={{
              background: '#ea580c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{copiedCoupon ? 'Copied!' : 'Code: GAS50'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>

        {/* Safety Box */}
        <div className="desktop-safety-card">
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Safety Guidelines
            </span>
            <h4 style={{ margin: '4px 0 4px', fontSize: '18px', fontWeight: 800, color: '#166534' }}>
              100% Tested &amp; Certified Cylinders
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#15803d', lineHeight: 1.4 }}>
              Always keep your LPG cylinder upright and verify the safety seal upon delivery.
            </p>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#bbf7d0',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
