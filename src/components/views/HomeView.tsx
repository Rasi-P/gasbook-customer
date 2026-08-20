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
  onNavigateToExplore: () => void
  customerProfile: CustomerProfile | null
  latestActiveOrder?: OrderItem | null
  onViewOrders?: () => void
  onTrackOrder?: (bookingId: number) => void
}

export function HomeView({ onNavigateToExplore, customerProfile, latestActiveOrder, onViewOrders, onTrackOrder }: HomeViewProps) {
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

          <button className="book-now-btn" onClick={onNavigateToExplore}>
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
          <button className="action-card" aria-label="Book Cylinder" onClick={onNavigateToExplore}>
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
            onClick={() => {
              if (hasActiveOrder && latestActiveOrder?.rawBooking?.id) {
                onTrackOrder?.(latestActiveOrder.rawBooking.id)
              } else {
                alert('No active orders to track. Book a cylinder to start live tracking!')
              }
            }}
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
      <div className="recent-order-section" style={{ margin: '0 20px' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="section-title" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#132B4F' }}>
            {hasActiveOrder ? 'Your Active Order' : 'Gas Booking Status'}
          </h3>
          {onViewOrders && (
            <button className="view-all-btn" onClick={onViewOrders} style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}>
              <span>View All</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>

        {hasActiveOrder && latestActiveOrder ? (
          <div className="active-order-card" style={{ background: '#FFF', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
            
            {/* Top row: Order # and Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B' }}>{latestActiveOrder.orderNumber}</div>
              <div style={{ color: '#64748B', fontSize: '0.85rem' }}>{latestActiveOrder.date}</div>
            </div>

            {/* Middle: Cylinder + Price + Status */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', background: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={splashCylinder} alt={latestActiveOrder.productName} style={{ height: '45px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '1rem', marginBottom: '4px' }}>{latestActiveOrder.productName}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{latestActiveOrder.weight}</span>
                </div>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1.1rem' }}>{latestActiveOrder.price}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ background: latestActiveOrder.statusCode === 'pending' ? '#FEF3C7' : '#DCFCE7', color: latestActiveOrder.statusCode === 'pending' ? '#92400E' : '#166534', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', display: 'inline-block' }}>
                  {latestActiveOrder.statusLabel}
                </div>
                <div style={{ color: '#64748B', fontSize: '0.75rem', maxWidth: '100px', lineHeight: '1.3' }}>
                  {latestActiveOrder.statusCode === 'pending' ? 'Awaiting assignment' : (latestActiveOrder.statusCode === 'accepted' ? 'Staff assigned' : (latestActiveOrder.statusCode === 'out_for_delivery' ? 'On the way' : 'Completed'))}
                </div>
              </div>
            </div>

            {/* Horizontal Divider */}
            <div style={{ height: '1px', background: '#F1F5F9', margin: '0 -20px 20px -20px' }}></div>

            {/* Compact Progress Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '24px', padding: '0 10px' }}>
              <div style={{ position: 'absolute', top: '10px', left: '20px', right: '20px', height: '2px', background: '#E2E8F0', zIndex: 1 }}></div>
              <div style={{ position: 'absolute', top: '10px', left: '20px', right: '20px', height: '2px', background: '#22C55E', zIndex: 1, width: latestActiveOrder.statusCode === 'pending' ? '0%' : latestActiveOrder.statusCode === 'accepted' ? '33%' : latestActiveOrder.statusCode === 'out_for_delivery' ? '66%' : '100%', transition: 'width 0.3s ease' }}></div>
              
              {[
                { label: 'Placed', active: true },
                { label: 'Assigned', active: latestActiveOrder.statusCode !== 'pending' && latestActiveOrder.statusCode !== 'rejected' && latestActiveOrder.statusCode !== 'cancelled' },
                { label: 'Delivery', active: latestActiveOrder.statusCode === 'out_for_delivery' || latestActiveOrder.statusCode === 'delivered' },
                { label: 'Delivered', active: latestActiveOrder.statusCode === 'delivered' }
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, background: '#FFF' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step.active ? '#22C55E' : '#F1F5F9', border: step.active ? 'none' : '2px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', color: '#FFF' }}>
                    {step.active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: step.active ? '#1E293B' : '#94A3B8' }}>{step.label}</span>
                </div>
              ))}
            </div>

            {/* Delivery Agent Section */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '12px' }}>Delivery Agent</div>
              
              {latestActiveOrder.rawBooking?.assigned_staff_name ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369A1' }}>
                      <span style={{ fontSize: '1.2rem' }}>👤</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', color: '#1E293B', fontWeight: 700 }}>{latestActiveOrder.rawBooking.assigned_staff_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Your delivery partner</div>
                    </div>
                  </div>
                  {latestActiveOrder.rawBooking?.assigned_staff_phone && (
                    <a href={`tel:${latestActiveOrder.rawBooking.assigned_staff_phone}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#2563EB', gap: '4px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1rem' }}>📞</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Call</span>
                    </a>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 600, marginBottom: '4px' }}>Staff assignment pending</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>We'll show your delivery partner here once assigned.</div>
                </div>
              )}
            </div>

            {/* Track Order Button */}
            <button 
              onClick={() => {
                if (onTrackOrder && latestActiveOrder?.rawBooking?.id) {
                  onTrackOrder(latestActiveOrder.rawBooking.id)
                }
              }}
              style={{ width: '100%', background: '#FFF', color: '#4F46E5', border: '1px solid #4F46E5', borderRadius: '12px', padding: '12px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
            >
              Track Order
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>

          </div>
        ) : (
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#94A3B8' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>No active orders to track</h4>
            <p style={{ margin: '0 auto 28px', fontSize: '0.95rem', color: '#64748B', maxWidth: '240px', lineHeight: '1.4' }}>Your active bookings will appear here.</p>
            <button 
              onClick={onNavigateToExplore}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#2563EB', color: '#FFF', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
            >
              Book Cylinder
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
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

      {/* Notifications Drawer */}
      {showNotifications && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'flex-end', overflow: 'hidden' }}>
          <div style={{ background: '#fff', width: '85%', maxWidth: 360, height: '100%', padding: 20, display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
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
