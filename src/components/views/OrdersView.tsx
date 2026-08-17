import { useState, useEffect } from 'react'
import splashCylinder from '../../assets/splash_cylinder.png'
import type { OrderItem } from '../../types'
import { fetchCustomerNotifications, markNotificationRead, type NotificationItem } from '../../lib/auth'

interface OrdersViewProps {
  orders?: OrderItem[]
  isLoading?: boolean
  error?: string | null
  onNavigateToExplore: () => void
  onTrackOrder: (orderId: string) => void
  onOrderAgain: (orderId: string) => void
}

export function OrdersView({
  orders = [],
  isLoading = false,
  error = null,
  onNavigateToExplore,
  onOrderAgain,
}: OrdersViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const loadNotifications = async () => {
    try {
      const items = await fetchCustomerNotifications()
      setNotifications(items)
    } catch {
      // Ignore network errors
    }
  }

  useEffect(() => {
    void loadNotifications()
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch {
      // ignore
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'all') return true
    return order.status === selectedFilter
  })

  const getTimelineSteps = (code: string | undefined) => {
    const steps = [
      { key: 'placed', title: 'Order Placed' },
      { key: 'confirmed', title: 'Order Confirmed' },
      { key: 'out_for_delivery', title: 'Out for Delivery' },
      { key: 'delivered', title: 'Delivered' },
    ]

    let currentIndex = 0
    if (code === 'pending') currentIndex = 0
    else if (code === 'approved') currentIndex = 1
    else if (code === 'accepted' || code === 'out_for_delivery') currentIndex = 2
    else if (code === 'delivered') currentIndex = 3

    return steps.map((step, idx) => ({
      ...step,
      isDone: idx <= currentIndex && code !== 'cancelled' && code !== 'rejected',
      isCurrent: idx === currentIndex && code !== 'cancelled' && code !== 'rejected',
    }))
  }

  return (
    <div className="orders-scroll-container">
      {/* 1. Header */}
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <button
          className="orders-notification-btn"
          aria-label="Notifications"
          onClick={() => {
            setShowNotifications(true)
            void loadNotifications()
          }}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && <span className="orders-notification-dot" />}
        </button>
      </div>

      {/* 2. Filter Tabs */}
      {orders.length > 0 && (
        <div className="filter-tabs-row">
          <button className={`filter-tab-btn ${selectedFilter === 'all' ? 'active' : ''}`} onClick={() => setSelectedFilter('all')}>All</button>
          <button className={`filter-tab-btn ${selectedFilter === 'ongoing' ? 'active' : ''}`} onClick={() => setSelectedFilter('ongoing')}>Ongoing</button>
          <button className={`filter-tab-btn ${selectedFilter === 'completed' ? 'active' : ''}`} onClick={() => setSelectedFilter('completed')}>Completed</button>
          <button className={`filter-tab-btn ${selectedFilter === 'cancelled' ? 'active' : ''}`} onClick={() => setSelectedFilter('cancelled')}>Cancelled</button>
        </div>
      )}

      {/* 3. Populated Orders List or States */}
      {isLoading ? (
        <div className="orders-loading-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b' }}>Loading your orders...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div className="orders-error-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2 className="empty-title" style={{ color: '#ef4444' }}>Unable to load orders.</h2>
          <p className="empty-subtitle">{error}</p>
          <button className="empty-explore-btn" onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="orders-list-container">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-item-card">
              <div className="order-card-top">
                <span className="order-card-id">{order.orderNumber}</span>
                <span className="order-card-date">{order.date}</span>
              </div>

              <div className="order-card-main">
                <div className="order-cylinder-wrap">
                  <img src={splashCylinder} className="order-cylinder-img" alt={order.productName} />
                </div>

                <div className="order-info-center">
                  <h3 className="order-product-name">{order.productName}</h3>
                  <span className="order-weight-badge">{order.weight}</span>
                  <span className="order-price-tag">{order.price}</span>
                </div>

                <div className="order-status-action-right">
                  <div className={`status-pill ${order.statusCode === 'pending' ? 'pending' : 'ongoing'}`}>
                    <span>{order.statusLabel}</span>
                  </div>

                  <div className="status-detail-text">
                    <span>{order.etaOrDate}</span>
                  </div>

                  <button
                    className="order-action-outline-btn"
                    onClick={() => {
                      if (order.status !== 'ongoing') {
                        onOrderAgain(order.id)
                      } else {
                        // Action for ongoing orders if needed, maybe scroll to timeline
                        console.log('Track order clicked for', order.id)
                      }
                    }}
                  >
                    {order.actionLabel}
                  </button>
                </div>
              </div>

              {/* Inline Timeline for Ongoing Orders */}
              {order.status === 'ongoing' && (
                <div className="timeline-container">
                  {getTimelineSteps(order.statusCode).map((step, idx, arr) => (
                    <div key={step.key} className="timeline-step">
                      <div className="timeline-indicator">
                        <div className={`timeline-dot ${step.isDone ? 'active' : ''}`} />
                        <div className={`timeline-line ${step.isDone && arr[idx + 1]?.isDone ? 'active' : ''}`} />
                      </div>
                      <div className="timeline-content">
                        <h4 className={`timeline-title ${step.isDone ? 'active' : ''}`}>{step.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="orders-empty-state">
          <h2 className="empty-title">
            {selectedFilter === 'all' ? 'No orders yet' : `No ${selectedFilter} orders`}
          </h2>
          <p className="empty-subtitle">
            {selectedFilter === 'all' 
              ? "You haven't booked a gas cylinder yet." 
              : `You have no ${selectedFilter} orders at the moment.`}
          </p>
          <button className="empty-explore-btn" onClick={onNavigateToExplore}>
            <span>Book Cylinder</span>
          </button>
        </div>
      )}

      {/* Tracking Modal removed - timeline is now visible inline on the active orders */}

      {/* Notifications Drawer */}
      {showNotifications && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 360, height: '100%', padding: 20, display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Notifications</h2>
              <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map((n) => (
                <div key={n.id} onClick={() => void handleMarkRead(n.id)} style={{ padding: 12, borderRadius: 8, background: n.is_read ? '#f8fafc' : '#eff6ff', border: n.is_read ? '1px solid #e2e8f0' : '1px solid #bfdbfe', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 14, color: '#1e293b' }}>{n.title}</strong>
                    <small style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                  <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{n.body}</p>
                </div>
              ))}
              {notifications.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>No notifications yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
