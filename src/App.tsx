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
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'orders' | 'profile'>('home')

  return (
    <div className="home-root">
      <div className="home-reference-frame">
        {/* Status Bar */}
        <div className="status-bar">
          <span className="status-bar-time">9:41</span>
          <div className="status-bar-icons">
            <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
              <path d="M2 3h1v5H2zm3-2h1v7H5zm3-1h1v8H8zm3-2h1v10h-1zm3 4h1v6h-1z" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
              <path d="M7.5 0C4.2 0 1.3 1.8 0 4.5l7.5 6.5 7.5-6.5C13.7 1.8 10.8 0 7.5 0z" />
            </svg>
            <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor">
              <rect x="0.5" y="0.5" width="18" height="10" rx="2" fill="none" stroke="currentColor" />
              <rect x="2.5" y="2.5" width="14" height="6" rx="1.2" />
              <path d="M20 3.5h1.5v4H20z" />
            </svg>
          </div>
        </div>

        {/* Home Screen Scroll Area */}
        <div className="home-scroll-container">
          {/* Header */}
          <div className="home-header">
            <div className="header-left">
              <div className="avatar-container">
                <div className="avatar-img-placeholder">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="50" fill="#E0E7FF" />
                    <circle cx="50" cy="40" r="20" fill="#312E81" />
                    <path d="M20 80C20 63.4315 33.4315 50 50 50C66.5685 50 80 63.4315 80 80C80 85.5228 75.5228 90 70 90H30C24.4772 90 20 85.5228 20 80Z" fill="#312E81" />
                    <circle cx="50" cy="42" r="16" fill="#FBCFE8" />
                    <path d="M30 40C30 25 40 20 50 20C60 20 70 25 70 40C70 45 68 52 68 52L62 48L50 54L38 48L32 52C32 52 30 45 30 40Z" fill="#1E1B4B" />
                    <circle cx="44" cy="40" r="2" fill="#1E1B4B" />
                    <circle cx="56" cy="40" r="2" fill="#1E1B4B" />
                    <path d="M47 46C47 46 48.5 48 50 48C51.5 48 53 46 53 46" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="avatar-status-dot" />
              </div>
              <div className="user-info-text">
                <span className="greeting-text">Good Afternoon,</span>
                <span className="user-name">Aleena 👋</span>
              </div>
            </div>
            
            <div className="header-right">
              <button className="header-icon-btn notification-btn" aria-label="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="notification-badge">3</span>
              </button>
              <button className="header-icon-btn support-btn" aria-label="Customer Support">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Location selector */}
          <div className="location-selector">
            <svg className="location-pin-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="location-text">Edappally, Kochi 682024</span>
            <svg className="chevron-down-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Hero Banner Card */}
          <div className="hero-banner-card">
            {/* Decorative circles for depth */}
            <div className="hero-deco-circle hero-deco-circle--1" />
            <div className="hero-deco-circle hero-deco-circle--2" />
            <div className="hero-deco-dot hero-deco-dot--1" />

            <div className="hero-left-content">
              <div className="ready-badge">
                <span className="ready-badge-dot" />
                <span>READY TO BOOK</span>
              </div>
              <h1 className="hero-title">
                Reliable energy,<br />
                <span className="hero-title-accent">for every home.</span>
              </h1>
              <p className="hero-subtitle">Safe. On time. Every time.</p>
              
              <button className="book-now-btn">
                <span>Book Cylinder</span>
                <span className="book-btn-arrow-circle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </button>
              
              <div className="delivery-guarantee">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Quick delivery within 30 minutes</span>
              </div>
            </div>
            
            <div className="hero-right-cylinder">
              <div className="cylinder-platform" />
              <img src={splashCylinder} className="hero-cylinder-img" alt="Gas Cylinder" />
            </div>
          </div>

          {/* Quick Actions Grid (4 cards) */}
          <div className="quick-actions-grid">
            <button className="action-card track-card" aria-label="Track Order">
              <div className="action-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className="action-title">Track Order</span>
              <span className="action-desc">Live status</span>
            </button>
            
            <button className="action-card history-card" aria-label="Order History">
              <div className="action-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <span className="action-title">History</span>
              <span className="action-desc">Past orders</span>
            </button>
            
            <button className="action-card payments-card" aria-label="Payments">
              <div className="action-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <span className="action-title">Payments</span>
              <span className="action-desc">Easy &amp; secure</span>
            </button>
            
            <button className="action-card support-card" aria-label="Support">
              <div className="action-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <span className="action-title">Support</span>
              <span className="action-desc">We're here</span>
            </button>
          </div>

          {/* Recent Order Section */}
          <div className="recent-order-section">
            <div className="section-header">
              <h2 className="section-title">Your Recent Order</h2>
              <button className="view-all-btn">
                <span>View all</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="recent-order-card">
              <div className="order-details-row">
                <div className="order-cylinder-thumbnail">
                  <img src={splashCylinder} className="thumbnail-cylinder-img" alt="Cylinder thumbnail" />
                </div>
                
                <div className="order-info-column">
                  <div className="order-status-tag">Out for Delivery</div>
                  <h3 className="order-number">Order #GB12345678</h3>
                  <span className="order-spec">14.2 KG Indane</span>
                  <span className="arrival-countdown">Arriving in <strong className="green-text">18 mins</strong></span>
                </div>

                <div className="driver-profile-widget">
                  <div className="driver-avatar-container">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="driver-avatar-svg">
                      <circle cx="50" cy="50" r="50" fill="#DBEAFE" />
                      <path d="M25 82C25 68 35 55 50 55C65 55 75 68 75 82" fill="#1E40AF" />
                      <circle cx="50" cy="42" r="16" fill="#FEE2E2" />
                      <path d="M30 36C30 30 35 24 50 24C65 24 70 30 70 36H30Z" fill="#1D4ED8" />
                      <path d="M45 24H68L74 30H45V24Z" fill="#1E40AF" />
                      <path d="M34 42C34 50 40 58 50 58C60 58 66 50 66 42H34Z" fill="#1F2937" opacity="0.8" />
                      <circle cx="44" cy="40" r="1.5" fill="#FFFFFF" />
                      <circle cx="56" cy="40" r="1.5" fill="#FFFFFF" />
                    </svg>
                  </div>
                  <div className="driver-name-rating">
                    <span className="driver-name">Rahul</span>
                    <span className="driver-rating">
                      <span className="star-icon">★</span> 4.8
                    </span>
                  </div>
                  <div className="driver-contact-actions">
                    <button className="driver-action-btn phone-action" aria-label="Call Driver">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </button>
                    <button className="driver-action-btn chat-action" aria-label="Message Driver">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="order-progress-stepper">
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: '66.6%' }}></div>
                </div>
                
                <div className="stepper-step completed">
                  <div className="step-node">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="step-label">Order Placed</span>
                  <span className="step-time">02:10 PM</span>
                </div>
                
                <div className="stepper-step completed">
                  <div className="step-node">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="step-label">Confirmed</span>
                  <span className="step-time">02:12 PM</span>
                </div>
                
                <div className="stepper-step active">
                  <div className="step-node">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <span className="step-label">Out for Delivery</span>
                  <span className="step-time">02:30 PM</span>
                </div>
                
                <div className="stepper-step pending">
                  <div className="step-node"></div>
                  <span className="step-label">Delivered</span>
                  <span className="step-time">Est. 02:55 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Offer and Safety Cards Grid */}
          <div className="promo-safety-grid">
            <div className="promo-card offer-card">
              <div className="promo-card-content">
                <span className="promo-tag">Today's Offer</span>
                <h2 className="promo-headline">Get ₹50 OFF</h2>
                <p className="promo-subheadline">on your next booking</p>
                <div className="coupon-code-box">Code: GAS50</div>
              </div>
              <div className="promo-illustration gift-illustration">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="promo-graphics-svg">
                  <rect x="25" y="48" width="70" height="52" rx="8" fill="#FDBA74" />
                  <rect x="18" y="36" width="84" height="16" rx="4" fill="#F97316" />
                  <rect x="53" y="36" width="14" height="64" fill="#EF4444" />
                  <path d="M60 36C44 18 38 36 60 36Z" fill="#EF4444" />
                  <path d="M60 36C76 18 82 36 60 36Z" fill="#DC2626" />
                  <circle cx="60" cy="36" r="7" fill="#DC2626" />
                  <circle cx="35" cy="30" r="4" fill="#FCD34D" opacity="0.8" />
                  <circle cx="88" cy="50" r="3" fill="#FCD34D" opacity="0.6" />
                </svg>
              </div>
            </div>

            <div className="promo-card safety-card">
              <div className="promo-card-content">
                <span className="promo-tag safety-tag">Safety First</span>
                <p className="safety-text">Always keep your cylinder in upright position in a well-ventilated area.</p>
                <button className="know-more-btn">
                  <span>Know More</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
              <div className="promo-illustration safety-cylinder-illustration">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="promo-graphics-svg">
                  <rect x="38" y="28" width="44" height="72" rx="22" fill="#3B82F6" />
                  <rect x="47" y="18" width="26" height="12" rx="4" fill="#2563EB" />
                  <ellipse cx="60" cy="28" rx="22" ry="6" fill="#1D4ED8" />
                  <circle cx="80" cy="80" r="24" fill="#10B981" />
                  <path d="M73 80L77 84L87 73" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
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
            className={`nav-tab-item ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="8" width="12" height="13" rx="2" />
              <path d="M9 8V5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v3" />
            </svg>
            <span>Book</span>
          </button>
          
          <button 
            className={`nav-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="15" y2="16" />
            </svg>
            <span>Orders</span>
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
