import { useState } from 'react'
import type { OrderItem } from '../../types'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { fetchPaginatedBookings } from '../../lib/api-queries'
import { Pagination } from '../common/Pagination'
import { getCylinderDisplay, getCylinderImage } from '../../lib/formatters'
import { DesktopRejectionModal } from './DesktopRejectionModal'

interface DesktopOrdersViewProps {
  onNavigateToExplore: () => void
  onTrackOrder: (orderId: number) => void
  onOrderAgain: (productName: string, price?: number, cylinderTypeId?: number) => void
}

export function DesktopOrdersView({
  onNavigateToExplore,
  onTrackOrder,
  onOrderAgain,
}: DesktopOrdersViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all')
  const [selectedRejectionOrder, setSelectedRejectionOrder] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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
    setPage(1)
    updateFilters({ status: mapFilterToStatus(filter) })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    updateFilters({ search: searchQuery })
  }

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
      etaOrDate = `Out for delivery with ${b.assigned_staff_name || 'Delivery Partner'}`
    } else if (b.status === 'delivered') {
      statusLabel = 'Delivered'
      statusKind = 'completed'
      etaOrDate = 'Successfully delivered to your address'
    } else if (b.status === 'cancelled') {
      statusLabel = 'Cancelled'
      statusKind = 'cancelled'
      etaOrDate = 'Order was cancelled'
    } else if (b.status === 'rejected') {
      statusLabel = 'Rejected'
      statusKind = 'cancelled'
      etaOrDate = b.rejection_reason ? `Reason: ${b.rejection_reason}` : 'Order could not be fulfilled'
    }

    const priceNum = parseFloat(b.rate || '0')
    const finalPrice = priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Standard Rate'

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
      rejectionReason: b.rejection_reason,
    }
  })

  return (
    <div className="desktop-container">
      {/* 1. Header & Filters Row */}
      <div className="desktop-orders-header-row">
        <div>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#1e293b' }}>
            My Orders
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
            Manage and track your LPG cylinder bookings.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="desktop-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="desktop-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setPage(1)
                updateFilters({ search: '' })
              }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="desktop-filter-pills" style={{ marginBottom: '28px' }}>
        <button
          className={`desktop-filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          All Orders
        </button>
        <button
          className={`desktop-filter-pill ${selectedFilter === 'ongoing' ? 'active' : ''}`}
          onClick={() => handleFilterClick('ongoing')}
        >
          Ongoing
        </button>
        <button
          className={`desktop-filter-pill ${selectedFilter === 'completed' ? 'active' : ''}`}
          onClick={() => handleFilterClick('completed')}
        >
          Completed
        </button>
        <button
          className={`desktop-filter-pill ${selectedFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => handleFilterClick('cancelled')}
        >
          Cancelled / Rejected
        </button>
      </div>

      {/* 2. Orders Content */}
      {isLoading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#1052be', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', fontSize: '15px' }}>Loading your orders...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px solid #fee2e2' }}>
          <h3 style={{ color: '#dc2626', margin: '0 0 8px' }}>Unable to load orders</h3>
          <p style={{ color: '#64748b' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px', background: '#1052be', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      ) : mappedOrders.length > 0 ? (
        <>
          <div className="desktop-orders-grid">
            {mappedOrders.map((order) => (
              <div key={order.id} className="desktop-order-card">
                {/* Top: Order ID & Date */}
                <div className="desktop-order-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="desktop-order-id">{order.orderNumber}</span>
                    <span
                      style={{
                        background:
                          order.statusCode === 'pending'
                            ? '#fef3c7'
                            : order.statusCode === 'delivered'
                            ? '#dcfce7'
                            : order.statusCode === 'rejected' || order.statusCode === 'cancelled'
                            ? '#fee2e2'
                            : '#eff6ff',
                        color:
                          order.statusCode === 'pending'
                            ? '#92400e'
                            : order.statusCode === 'delivered'
                            ? '#166534'
                            : order.statusCode === 'rejected' || order.statusCode === 'cancelled'
                            ? '#991b1b'
                            : '#1d4ed8',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {order.statusLabel}
                    </span>
                  </div>
                  <span className="desktop-order-date">{order.date}</span>
                </div>

                {/* Body: Cylinder details */}
                <div className="desktop-order-body">
                  <div className="desktop-order-img-wrap">
                    <img src={getCylinderImage(order.productName, order.weight)} alt="" style={{ height: '50px', objectFit: 'contain' }} />
                  </div>
                  <div className="desktop-order-info">
                    <h4 className="desktop-order-name">{order.productName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '11.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                        {order.weight}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Qty: {order.rawBooking?.quantity || 1}</span>
                    </div>
                    <div className="desktop-order-price">{order.price}</div>
                  </div>
                </div>

                {/* Status description for non-rejected orders */}
                {order.statusCode !== 'rejected' && (
                  <div style={{ fontSize: '13px', color: '#64748b', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                    {order.etaOrDate}
                  </div>
                )}

                {/* Actions */}
                <div className="desktop-order-actions">
                  {order.statusCode === 'rejected' ? (
                    <button
                      onClick={() => setSelectedRejectionOrder(order)}
                      style={{
                        width: '100%',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>View Rejection Reason</span>
                      <span>→</span>
                    </button>
                  ) : order.statusCode === 'delivered' ? (
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                      <button
                        onClick={() => onTrackOrder(order.rawBooking.id)}
                        style={{
                          flex: 1,
                          background: '#f1f5f9',
                          color: '#334155',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '9px',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Receipt &amp; Details
                      </button>
                      <button
                        onClick={() => {
                          if (!order.rawBooking.cylinder_type_id) {
                            alert('This cylinder is currently unavailable.')
                            return
                          }
                          onOrderAgain(order.productName, parseFloat(order.rawBooking.rate || '0'), order.rawBooking.cylinder_type_id)
                        }}
                        style={{
                          flex: 1,
                          background: '#1052be',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '9px',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Order Again
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onTrackOrder(order.rawBooking.id)}
                      style={{
                        width: '100%',
                        background: '#1052be',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Track Order</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={params.page || 1}
            totalItems={totalOrders}
            pageSize={10}
            onPageChange={setPage}
            disabled={isLoading}
          />
        </>
      ) : (
        /* Empty Orders State */
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '64px 32px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#1052be',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
            {selectedFilter === 'all' ? 'No orders placed yet' : `No ${selectedFilter} orders`}
          </h3>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
            {selectedFilter === 'all'
              ? 'When you book LPG cylinders, your order updates and delivery details will show up here.'
              : `You have no ${selectedFilter} cylinder orders at the moment.`}
          </p>
          <button
            onClick={onNavigateToExplore}
            style={{
              background: '#ff7a00',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '13px 28px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 122, 0, 0.3)',
            }}
          >
            Book a Cylinder
          </button>
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {selectedRejectionOrder && (
        <DesktopRejectionModal
          order={selectedRejectionOrder}
          onClose={() => setSelectedRejectionOrder(null)}
          onOrderAgain={onOrderAgain}
        />
      )}
    </div>
  )
}
