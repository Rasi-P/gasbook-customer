import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import homeUiReference from './assets/home_ui_reference.png'
import splashBg from './assets/splash_bg.png'
import splashCylinder from './assets/splash_cylinder.png'
import sabcoLogo from './assets/sabco_logo.png'

type ScreenType = 'splash' | 'login' | 'change-password' | 'password-success' | 'home'

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 3l18 18m-9.57-3C6.98 18 4 12 4 12a14.6 14.6 0 0 1 3.27-4.19M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88M14.12 14.12 9.88 9.88m4.45-4.1C18.44 7.1 20 12 20 12s-1.54 4.9-5.67 6.22M12 6c-1.05 0-2.04.2-2.95.56"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7fb1ff" />
          <stop offset="100%" stopColor="#1e5eff" />
        </linearGradient>
      </defs>
      <path
        d="M60 10c11 9 25 14 38 15v28c0 26-16 42-38 57C38 95 22 79 22 53V25c13-1 27-6 38-15Z"
        fill="url(#shieldGradient)"
      />
      <path
        d="M60 22c8 6 17 10 28 12v19c0 18-10 29-28 42-18-13-28-24-28-42V34c11-2 20-6 28-12Z"
        fill="#2d6cff"
        opacity="0.34"
      />
      <path
        d="m48.5 60.5 8 8 17-20"
        fill="none"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function LegacyPasswordInput({
  id,
  value,
  placeholder,
  visible,
  onToggle,
}: {
  id: string
  value: string
  placeholder: string
  visible: boolean
  onToggle: () => void
}) {
  return (
    <div className="input-wrapper">
      <LockIcon />
      <input id={id} type={visible ? 'text' : 'password'} placeholder={placeholder} required />
      <button
        type="button"
        className="password-toggle"
        onClick={onToggle}
        aria-label={visible ? `Hide ${value}` : `Show ${value}`}
      >
        <EyeIcon open={!visible} />
      </button>
    </div>
  )
}

function ScreenFrame({
  children,
  screen,
}: {
  children: ReactNode
  screen: Exclude<ScreenType, 'splash' | 'login' | 'change-password'>
}) {
  return (
    <div className={`app-root app-root--auth app-root--${screen}`}>
      <div className="phone-shell">
        <div className="phone-screen auth-screen">{children}</div>
      </div>
    </div>
  )
}

function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'orders' | 'cart' | 'profile'>('home')

  return (
    <div className="home-root">
      <div className="home-reference-frame">
        {/* Home Screen Scroll Area */}
        <div className="home-scroll-container">
          {/* 1. Header */}
          <div className="home-header">
            <div className="header-left">
              <h1 className="header-greeting">Good Afternoon, Aleena 👋</h1>
              <div className="header-location">
                <svg className="location-pin-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="location-text">Edappally, Kochi</span>
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
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 2. Hero Card */}
          <div className="hero-banner-card">
            {/* Subtle decorative circles & dots */}
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
              
              <button className="book-now-btn">
                <span>Book Cylinder</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
            
            <div className="hero-right-cylinder">
              <img src={splashCylinder} className="hero-cylinder-img" alt="GasBook Cylinder" />
              <div className="cylinder-gasbook-badge">GasBook</div>
            </div>
          </div>

          {/* 3. Quick Actions */}
          <div className="quick-actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="action-card" aria-label="Track Order">
                <div className="action-icon-wrapper track-icon-bg">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>
                <span className="action-title">Track Order</span>
                <span className="action-desc">Live status</span>
              </button>
              
              <button className="action-card" aria-label="History">
                <div className="action-icon-wrapper history-icon-bg">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="action-title">History</span>
                <span className="action-desc">Past orders</span>
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

          {/* 4. Your Recent Order */}
          <div className="recent-order-section">
            <div className="section-header">
              <h3 className="section-title">Your Recent Order</h3>
              <button className="view-all-btn">
                <span>View all</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            <div className="recent-order-card">
              {/* Row 1: Order ID + Status */}
              <div className="order-card-header">
                <span className="order-id">Order #GB12345678</span>
                <span className="order-status-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>Out for Delivery</span>
                </span>
              </div>

              {/* Row 2: Domestic LPG + ETA */}
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

              {/* Row 3: Driver Info + Call & Chat */}
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

              {/* Row 4: Progress Stepper */}
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
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
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
          </div>

          {/* 5. Today's Offer & Safety First Grid */}
          <div className="promo-safety-grid">
            {/* Offer Card */}
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

            {/* Safety First Card */}
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

        {/* 6. Bottom Navigation (5 tabs) */}
        <div className="bottom-navigation-bar">
          <button 
            className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Home</span>
          </button>
          
          <button 
            className={`nav-tab-item ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>Explore</span>
          </button>
          
          <button 
            className={`nav-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Orders</span>
          </button>
          
          <button 
            className={`nav-tab-item ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Cart</span>
          </button>
          
          <button 
            className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (currentScreen !== 'splash') {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setCurrentScreen('login')
    }, 2300)

    return () => window.clearTimeout(timer)
  }, [currentScreen])

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCurrentScreen('change-password')
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCurrentScreen('password-success')
  }

  if (currentScreen === 'splash') {
    return (
      <div className="app-container">
        <div className="app-screen">
          <div className="splash-screen" onClick={() => setCurrentScreen('login')}>
            <img src={splashBg} className="splash-bg-layer" alt="" />
            <div className="splash-screen-interactive-area" />

            <div className="splash-branding">
              <img src={sabcoLogo} className="brand-logo-img" alt="Sabco logo" />
            </div>

            <div className="splash-cylinder-layer">
              <img src={splashCylinder} className="cylinder-hero-img" alt="Sabco LPG Cylinder" />
            </div>

            <div className="splash-content-layer">
              <div className="splash-tagline">
                <h2>Safe. Reliable. Always.</h2>
                <p>
                  Your trusted gas partner
                  <br />
                  for every home.
                </p>
              </div>

              <div className="dots-indicator">
                <span className="dot active" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === 'login') {
    return (
      <div className="legacy-auth-shell">
        <div className="login-screen">
          <div className="login-header">
            <img src={sabcoLogo} className="login-brand-logo" alt="Sabco logo" />
          </div>

          <div className="login-card">
            <div className="login-card-header">
              <h2>Welcome Back 👋</h2>
              <p>Please login to continue</p>
            </div>

            <form className="login-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <UserIcon />
                  <input id="username" type="text" placeholder="Username" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <LegacyPasswordInput
                  id="login-password"
                  value="password"
                  placeholder="Password"
                  visible={showLoginPassword}
                  onToggle={() => setShowLoginPassword((value) => !value)}
                />
              </div>

              <div className="form-actions">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-link">
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="btn-primary">
                LOGIN
              </button>
            </form>

            <div className="login-footer">
              <p>Need Help?</p>
              <button type="button" className="contact-link">
                Distributor Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === 'change-password') {
    return (
      <div className="legacy-auth-shell">
        <div className="login-screen">
          <div className="login-header">
            <img src={sabcoLogo} className="login-brand-logo" alt="Sabco logo" />
          </div>

          <div className="login-card">
            <div className="login-card-header">
              <h2>Welcome Aleena 👋</h2>
              <p>Please change your password to continue</p>
            </div>

            <form className="login-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="current-password">Current Password</label>
                <LegacyPasswordInput
                  id="current-password"
                  value="current password"
                  placeholder="Current Password"
                  visible={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword((value) => !value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <LegacyPasswordInput
                  id="new-password"
                  value="new password"
                  placeholder="New Password"
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((value) => !value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <LegacyPasswordInput
                  id="confirm-password"
                  value="confirm password"
                  placeholder="Confirm Password"
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((value) => !value)}
                />
              </div>

              <ul className="password-hints">
                <li>At least 8 characters</li>
                <li>Include number &amp; symbol</li>
              </ul>

              <button type="submit" className="btn-primary">
                SAVE PASSWORD
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === 'password-success') {
    return (
      <ScreenFrame screen="password-success">
        <div className="screen-body screen-body--success">
          <div className="success-art">
            <span className="success-ring success-ring--outer" />
            <span className="success-ring success-ring--inner" />
            <span className="spark spark--top" />
            <span className="spark spark--right" />
            <span className="spark spark--bottom" />
            <span className="spark spark--left" />
            <div className="shield-badge">
              <ShieldIcon />
            </div>
          </div>

          <header className="success-copy">
            <h2>Password Updated Successfully</h2>
            <p>Your password has been changed successfully</p>
          </header>

          <button type="button" className="primary-button" onClick={() => setCurrentScreen('home')}>
            CONTINUE
          </button>
        </div>
      </ScreenFrame>
    )
  }

  return <HomeScreen />
}

export default App
