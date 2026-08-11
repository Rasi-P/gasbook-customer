import { useState } from 'react'
import splashCylinder from '../../assets/splash_cylinder.png'
import type { CustomerProfile } from '../../lib/auth'

function getGreetingName(customerProfile: CustomerProfile | null) {
  return customerProfile?.name?.trim() || customerProfile?.full_name?.trim() || 'Customer'
}

function getLocationText(customerProfile: CustomerProfile | null) {
  const address = customerProfile?.address?.trim()
  if (!address) {
    return 'Add your address in GasBook'
  }

  const segments = address
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)

  return segments.slice(0, 2).join(', ') || address
}

interface HomeViewProps {
  onBook: (productName: string) => void
  customerProfile: CustomerProfile | null
}

export function HomeView({ onBook, customerProfile }: HomeViewProps) {
  const [hasActiveOrder] = useState(false)
  const greetingName = getGreetingName(customerProfile)
  const locationText = getLocationText(customerProfile)

  return (
    <div className="home-scroll-container">
      {/* 1. Header */}
      <div className="home-header">
        <div className="header-left">
          <h1 className="header-greeting">Good Afternoon, {greetingName} 👋</h1>
          <div className="header-location">
            <svg className="location-pin-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="location-text">{locationText}</span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="header-icon-btn notification-btn" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notification-dot" />
          </button>
          <button className="header-icon-btn support-btn" aria-label="Customer Support">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Hero Banner Card */}
      <div className="hero-banner-card">
        <div className="hero-deco-ring hero-deco-ring-1" />
        <div className="hero-deco-ring hero-deco-ring-2" />
        <div className="hero-deco-dots">
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>

        <div className="hero-left-content">
          <div className="ready-badge-text">READY TO BOOK</div>
          <h2 className="hero-title">
            Reliable energy,<br />
            for every home.
          </h2>
          <p className="hero-subtitle">Safe. On time. Every time.</p>
          
          <button className="book-now-btn" onClick={() => onBook('Domestic LPG Cylinder')}>
            <span>Book Cylinder</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
        
        <div className="hero-right-cylinder">
          <img src={splashCylinder} className="hero-cylinder-img" alt="Gas Cylinder" />
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="action-card" aria-label="Book Cylinder" onClick={() => onBook('Domestic LPG Cylinder')}>
            <div className="action-icon-wrapper book-icon-bg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <span className="action-title">Book Cylinder</span>
            <span className="action-desc">Fast refill</span>
          </button>
          
          <button
            className="action-card"
            aria-label="Track Order"
            onClick={() => alert('No active orders to track. Book a cylinder to start live tracking!')}
          >
            <div className="action-icon-wrapper track-icon-bg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <span className="action-title">Track Order</span>
            <span className="action-desc">Live status</span>
          </button>
          
          <button className="action-card" aria-label="Payments">
            <div className="action-icon-wrapper payments-icon-bg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <span className="action-title">Payments</span>
            <span className="action-desc">Easy &amp; secure</span>
          </button>
          
          <button className="action-card" aria-label="Support">
            <div className="action-icon-wrapper support-icon-bg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <span className="action-title">Support</span>
            <span className="action-desc">We're here</span>
          </button>
        </div>
      </div>

      {/* 4. Order Status / Booking Card */}
      <div className="recent-order-section">
        <div className="section-header">
          <h3 className="section-title">
            {hasActiveOrder ? 'Your Recent Order' : 'Gas Booking Status'}
          </h3>
          {hasActiveOrder && (
            <button className="view-all-btn">
              <span>View all</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>

        {hasActiveOrder ? (
          <div className="recent-order-card">
            <div className="order-card-header">
              <span className="order-id">Order #GB12345678</span>
              <span className="order-status-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Out for Delivery</span>
              </span>
            </div>

            <div className="order-card-specs">
              <div className="specs-left">
                <span className="specs-title">Domestic LPG</span>
                <span className="weight-badge">14.2 KG</span>
              </div>
              <div className="specs-right">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Arriving in 18 mins</span>
              </div>
            </div>

            <div className="driver-row">
              <div className="driver-info">
                <div className="driver-avatar-circle">
                  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="18" fill="#DBEAFE" />
                    <circle cx="18" cy="14" r="6" fill="#1E40AF" />
                    <path d="M8 28C8 23.5 12.5 20 18 20C23.5 20 28 23.5 28 28" fill="#1E40AF" />
                  </svg>
                </div>
                <div className="driver-details">
                  <span className="driver-name">Rahul</span>
                  <span className="driver-rating">
                    <span className="star-icon">★</span> 4.8
                  </span>
                </div>
              </div>
              <div className="driver-buttons">
                <button className="driver-pill-btn call-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <span>Call</span>
                </button>
                <button className="driver-pill-btn chat-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Chat</span>
                </button>
              </div>
            </div>

            <div className="order-stepper">
              <div className="stepper-line-bg">
                <div className="stepper-line-fill" style={{ width: '66%' }} />
              </div>
              
              <div className="stepper-item completed">
                <div className="step-circle">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="step-text">Order Placed</span>
              </div>
              
              <div className="stepper-item completed">
                <div className="step-circle">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="step-text">Confirmed</span>
              </div>
              
              <div className="stepper-item active">
                <div className="step-circle">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <span className="step-text active-text">Out for Delivery</span>
              </div>
              
              <div className="stepper-item upcoming">
                <div className="step-circle" />
                <span className="step-text">Delivered</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-active-order-card">
            <div className="no-order-left">
              <div className="no-order-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="no-order-text">
                <h4 className="no-order-title">No Active Deliveries</h4>
                <p className="no-order-subtitle">Need gas? Book your 14.2 KG cylinder now</p>
              </div>
            </div>
            <button className="order-now-btn" onClick={() => onBook('14.2 KG Gas Cylinder')}>
              <span>Order Now</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 5. Today's Offer & Safety First Grid */}
      <div className="promo-safety-grid">
        <div className="promo-card offer-card">
          <div className="promo-card-content">
            <div className="promo-tag-row">
              <span className="tag-icon-circle">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                </svg>
              </span>
              <span className="promo-tag-text">Today's Offer</span>
            </div>
            <h4 className="promo-headline">Get ₹50 OFF</h4>
            <p className="promo-subheadline">on your next booking</p>
            <div className="coupon-code-box">
              <span>Code: <strong>GAS50</strong></span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </div>
          </div>
          <div className="promo-card-art">
            <svg width="90" height="90" viewBox="0 0 120 120" fill="none">
              <rect x="36" y="52" width="56" height="52" rx="6" fill="#F97316" />
              <rect x="30" y="40" width="68" height="15" rx="4" fill="#FB923C" />
              <rect x="60" y="40" width="8" height="64" fill="#FDBA74" />
              <path d="M64 40C52 24 38 34 60 40Z" fill="#FDBA74" />
              <path d="M64 40C76 24 90 34 68 40Z" fill="#FDBA74" />
              <circle cx="64" cy="40" r="5" fill="#FED7AA" />
              <path d="M22 36L24 30L26 36L32 38L26 40L24 46L22 40L16 38Z" fill="#FDBA74" opacity="0.8" />
              <path d="M102 32L103.5 28L105 32L109 33.5L105 35L103.5 39L102 35L98 33.5Z" fill="#FDBA74" opacity="0.8" />
            </svg>
          </div>
        </div>

        <div className="promo-card safety-card">
          <div className="promo-card-content">
            <div className="safety-tag-row">
              <span className="safety-icon-circle">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </span>
              <span className="safety-tag-text">Safety First</span>
            </div>
            <p className="safety-description">
              Keep your cylinder upright and in a well-ventilated area.
            </p>
            <button className="know-more-link">
              <span>Know More</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <div className="promo-card-art">
            <svg width="86" height="86" viewBox="0 0 120 120" fill="none">
              <path d="M60 16L116 56H96V104H72V74H52V104H16V56L60 16Z" fill="#DBEAFE" opacity="0.5" />
              <path d="M60 12L118 54L112 58L60 20L8 58L2 54L60 12Z" fill="#93C5FD" opacity="0.8" />
              <rect x="74" y="60" width="30" height="46" rx="8" fill="#1D4ED8" />
              <rect x="80" y="52" width="18" height="8" rx="2" fill="#1E40AF" />
              <ellipse cx="89" cy="60" rx="15" ry="4" fill="#2563EB" />
              <ellipse cx="89" cy="104" rx="13" ry="3" fill="#1E3A8A" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
