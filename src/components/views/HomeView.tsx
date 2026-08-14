import { useState, useEffect } from 'react'
import type { OrderItem } from '../../types'
import { fetchCustomerNotifications, markNotificationRead, type NotificationItem } from '../../lib/auth'
import splashCylinder from '../../assets/splash_cylinder.png'
import heroBg from '../../assets/hero_bg.png'
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
  latestActiveOrder?: OrderItem | null
  onViewOrders?: () => void
}

export function HomeView({ onBook, customerProfile, latestActiveOrder, onViewOrders }: HomeViewProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const hasActiveOrder = Boolean(latestActiveOrder)
  const greetingName = getGreetingName(customerProfile)
  const locationText = getLocationText(customerProfile)

  useEffect(() => {
    fetchCustomerNotifications().then(setNotifications).catch(() => {})
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch {
      // ignore
    }
  }
  const unreadNotifCount = notifications.filter((n) => !n.is_read).length

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
          <button className="header-icon-btn notification-btn" aria-label="Notifications" onClick={() => setShowNotifications(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadNotifCount > 0 && <span className="notification-dot" />}
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
        <img src={heroBg} className="hero-bg-img" alt="" />
        {/* <div className="hero-deco-ring hero-deco-ring-1" />
        <div className="hero-deco-ring hero-deco-ring-2" /> */}
        {/* <div className="hero-deco-dots">
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div> */}

        <div className="hero-left-content">
          <div className="ready-badge-text">READY TO BOOK</div>
          <h2 className="hero-title">
            Reliable energy,<br />
            for every home.
          </h2>
          <p className="hero-subtitle">Safe. On time. Every time.</p>

          <button className="book-now-btn" onClick={() => onBook('LPG Cylinder')}>
            <span>Book Cylinder</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>


      </div>

      {/* 3. Quick Actions Grid */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="action-card" aria-label="Book Cylinder" onClick={() => onBook('LPG Cylinder')}>
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
            {hasActiveOrder ? 'Your Active Order' : 'Gas Booking Status'}
          </h3>
          {onViewOrders && (
            <button className="view-all-btn" onClick={onViewOrders}>
              <span>View all</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>

        {hasActiveOrder && latestActiveOrder ? (
          <div className="order-item-card" style={{ marginTop: '12px' }}>
            <div className="order-card-top">
              <span className="order-card-id">{latestActiveOrder.orderNumber}</span>
              <span className="order-card-date">{latestActiveOrder.date}</span>
            </div>

            <div className="order-card-main">
              <div className="order-cylinder-wrap">
                <img src={splashCylinder} className="order-cylinder-img" alt={latestActiveOrder.productName} />
              </div>

              <div className="order-info-center">
                <h3 className="order-product-name">{latestActiveOrder.productName}</h3>
                <span className="order-weight-badge">{latestActiveOrder.weight}</span>
                <span className="order-price-tag">{latestActiveOrder.price}</span>
              </div>

              <div className="order-status-action-right">
                <div className={`status-pill ${latestActiveOrder.statusCode === 'pending' ? 'pending' : 'ongoing'}`}>
                  <span>{latestActiveOrder.statusLabel}</span>
                </div>

                <div className="status-detail-text">
                  <span>{latestActiveOrder.etaOrDate}</span>
                </div>

                {onViewOrders && (
                  <button className="order-action-outline-btn" onClick={onViewOrders}>
                    Track Order
                  </button>
                )}
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

        </div>
      </div>

      {showNotifications && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: '#FFF', width: '100%', maxWidth: '360px', maxHeight: '80vh', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#132B4F' }}>Notifications</h3>
              <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#132B4F' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => void handleMarkRead(n.id)}
                  style={{ padding: '12px', borderRadius: '10px', background: n.is_read ? '#F8FAFC' : '#EFF6FF', border: n.is_read ? '1px solid #E2E8F0' : '1px solid #BFDBFE', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: '#1E293B' }}>{n.title}</strong>
                    <small style={{ fontSize: '10px', color: '#94A3B8' }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>{n.body}</p>
                </div>
              ))}
              {notifications.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', marginTop: '40px', fontSize: '13px' }}>No new notifications at this time.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
