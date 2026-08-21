import { useState, useEffect } from 'react'
import type { OrderItem } from '../../types'
import { markNotificationRead } from '../../lib/auth'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { fetchPaginatedBookings, fetchPaginatedNotifications } from '../../lib/api-queries'
import { Pagination } from '../common/Pagination'
import { getCylinderDisplay, getCylinderImage } from '../../lib/formatters'

interface OrdersViewProps {
  onNavigateToExplore: () => void
  onTrackOrder: (orderId: number) => void
  onOrderAgain: (productName: string, price?: number, cylinderTypeId?: number) => void
}

export function OrdersView({
  onNavigateToExplore,
  onTrackOrder,
  onOrderAgain,
}: OrdersViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all')
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedRejectionOrder, setSelectedRejectionOrder] = useState<any | null>(null)
  const {
    data: notifications,
    count: totalNotifications,
    setPage: setNotificationPage,
    params: notificationParams,
    reload: reloadNotifications
  } = usePaginatedQuery({
    fetchFn: fetchPaginatedNotifications,
    defaultParams: { page: 1 },
  })

  useEffect(() => {
    // Initial fetch handled by usePaginatedQuery
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id)
      reloadNotifications()
    } catch {
      // ignore
    }
  }

  // To count unread, we technically need an unread filter or endpoint, but we'll approximate with the loaded page
  const unreadCount = notifications.filter((n: any) => !n.is_read).length

  const {
    data: rawOrders,
    count: totalOrders,
    isLoading,
    error,
    params,
    setPage,
    updateFilters,
  } = usePaginatedQuery({
    fetchFn: fetchPaginatedBookings,
    defaultParams: { page: 1, status: '', search: '' },
  })

  const [searchQuery, setSearchQuery] = useState('')

  // Map backend status correctly
  const mapFilterToStatus = (filter: string) => {
    switch (filter) {
      case 'ongoing':
        return 'pending,approved,accepted,out_for_delivery'
      case 'completed':
        return 'delivered'
      case 'cancelled':
        return 'cancelled,rejected'
      default:
        return ''
    }
  }

  const handleFilterClick = (filter: 'all' | 'ongoing' | 'completed' | 'cancelled') => {
    setSelectedFilter(filter)
    updateFilters({ status: mapFilterToStatus(filter) })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchQuery })
  }

  // Map raw backend bookings to UI OrderItem format
  const mappedOrders: OrderItem[] = rawOrders.map((b: any) => {
    let statusLabel = 'Order Placed'
    let statusKind: 'ongoing' | 'completed' | 'cancelled' = 'ongoing'
    let etaOrDate = 'Order Placed — Preparing for delivery'

    if (b.status === 'approved') {
      statusLabel = 'Order Confirmed'
      statusKind = 'ongoing'
      etaOrDate = 'Order confirmed — awaiting dispatch'
    } else if (b.status === 'accepted' || b.status === 'out_for_delivery') {
      statusLabel = 'Out for Delivery'
      statusKind = 'ongoing'
      etaOrDate = `Out for delivery with ${b.assigned_staff_name || 'Delivery Staff'}`
    } else if (b.status === 'delivered') {
      statusLabel = 'Delivered'
      statusKind = 'completed'
      etaOrDate = 'Successfully delivered'
    } else if (b.status === 'cancelled') {
      statusLabel = 'Cancelled'
      statusKind = 'cancelled'
      etaOrDate = 'Order was cancelled'
    } else if (b.status === 'rejected') {
      statusLabel = 'Rejected'
      statusKind = 'cancelled'
      etaOrDate = 'Order rejected'
    }

    const priceNum = parseFloat(b.rate || '0')
    const finalPrice = priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'To be determined'

    const display = getCylinderDisplay(b.cylinder_type_name, b.cylinder_type_weight)

    return {
      id: b.id.toString(),
      orderNumber: `Order #${b.order_id}`,
      date: new Date(b.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      productName: display.title,
      weight: display.badge,
      price: finalPrice,
      status: statusKind,
      statusCode: b.status,
      statusLabel,
      actionLabel: 'Track Order',
      etaOrDate,
      rawBooking: b,
    }
  })

  // @ts-ignore
  const getTimelineSteps = (code: string | undefined) => {
    if (code === 'cancelled' || code === 'rejected') {
      return [
        { key: 'placed', title: 'Order Placed', isDone: true, isCurrent: false },
        { key: 'terminated', title: code === 'rejected' ? 'Rejected' : 'Cancelled', isDone: true, isCurrent: true }
      ]
    }

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
      isDone: idx <= currentIndex,
      isCurrent: idx === currentIndex,
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F8FAFC', paddingBottom: '68px', boxSizing: 'border-box', position: 'relative' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div className="orders-scroll-container" style={{ minHeight: 'auto', paddingBottom: '32px' }}>
      {/* 1. Header */}
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <button
          className="orders-notification-btn"
          aria-label="Notifications"
          onClick={() => {
            setShowNotifications(true)
            reloadNotifications()
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
      <div className="filter-tabs-row">
        <button className={`filter-tab-btn ${selectedFilter === 'all' ? 'active' : ''}`} onClick={() => handleFilterClick('all')}>All</button>
        <button className={`filter-tab-btn ${selectedFilter === 'ongoing' ? 'active' : ''}`} onClick={() => handleFilterClick('ongoing')}>Ongoing</button>
        <button className={`filter-tab-btn ${selectedFilter === 'completed' ? 'active' : ''}`} onClick={() => handleFilterClick('completed')}>Completed</button>
        <button className={`filter-tab-btn ${selectedFilter === 'cancelled' ? 'active' : ''}`} onClick={() => handleFilterClick('cancelled')}>Cancelled</button>
      </div>

      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search orders (ID, Cylinder)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </div>

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
      ) : mappedOrders.length > 0 ? (
        <div className="orders-list-container">
          {mappedOrders.map((order) => (
            <div key={order.id} className="order-item-card">
              <div className="order-card-top">
                <span className="order-card-id">{order.orderNumber}</span>
                <span className="order-card-date">{order.date}</span>
              </div>

              <div className="order-card-main">
                <div className="order-cylinder-wrap">
                  <img src={getCylinderImage(order.productName, order.weight)} className="order-cylinder-img" alt={order.productName} />
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

                  {order.statusCode === 'delivered' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="order-action-outline-btn" onClick={() => onTrackOrder(order.rawBooking.id)}>View Details</button>
                      <button className="order-action-outline-btn" onClick={() => {
                        if (!order.rawBooking.cylinder_type_id) {
                          alert("This cylinder is currently unavailable.")
                          return
                        }
                        onOrderAgain(order.productName, parseFloat(order.rawBooking.rate || '0'), order.rawBooking.cylinder_type_id)
                      }}>Order Again</button>
                    </div>
                  ) : order.statusCode === 'rejected' ? (
                    <button
                      className="order-action-outline-btn"
                      onClick={() => setSelectedRejectionOrder(order)}
                    >
                      View Details →
                    </button>
                  ) : (
                    <button
                      className="order-action-outline-btn"
                      onClick={() => onTrackOrder(order.rawBooking.id)}
                    >
                      {order.actionLabel}
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
          
          <Pagination
            currentPage={params.page || 1}
            totalItems={totalOrders}
            pageSize={10}
            onPageChange={setPage}
            disabled={isLoading}
          />
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

      {/* Notifications Drawer */}
      {showNotifications && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', overflow: 'hidden' }}>
          <div style={{ background: '#fff', width: '85%', maxWidth: 360, height: '100%', padding: 20, display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Notifications</h2>
              <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map((n: any) => (
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
            
            <Pagination
              currentPage={notificationParams.page || 1}
              totalItems={totalNotifications}
              pageSize={10}
              onPageChange={setNotificationPage}
            />
          </div>
        </div>
      )}
      </div>
      </div>

      {/* Rejection Details Bottom Sheet */}
      {selectedRejectionOrder && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: '#fff', width: '100%', padding: '24px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', animation: 'slideUp 0.3s ease-out', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Rejection Details</h2>
              <button onClick={() => setSelectedRejectionOrder(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{selectedRejectionOrder.orderNumber}</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444', margin: '4px 0' }}>Order Rejected</h3>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '4px' }}>Reason</div>
                <div style={{ fontSize: '15px', color: '#1e293b' }}>{selectedRejectionOrder.rawBooking.rejection_reason || 'No reason provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {selectedRejectionOrder.rawBooking.rejected_at ? new Date(selectedRejectionOrder.rawBooking.rejected_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : selectedRejectionOrder.date}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const booking = selectedRejectionOrder.rawBooking;
                if (!booking.cylinder_type_id) {
                  alert("This cylinder is currently unavailable.");
                  return;
                }
                setSelectedRejectionOrder(null);
                onOrderAgain(selectedRejectionOrder.productName, parseFloat(booking.rate || '0'), booking.cylinder_type_id);
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Book Again
            </button>
          </div>
          <style>{`
            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
        </div>
      )}
    </div>
  )
}
