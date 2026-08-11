import { useState } from 'react'
import splashCylinder from '../../assets/splash_cylinder.png'
import type { OrderItem } from '../../types'

interface OrdersViewProps {
  onNavigateToExplore: () => void
  onTrackOrder: (orderId: string) => void
  onOrderAgain: (orderId: string) => void
}

export function OrdersView({
  onNavigateToExplore,
  onTrackOrder,
  onOrderAgain,
}: OrdersViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all')
  const orders: OrderItem[] = [
    {
      id: 'ord-1',
      orderNumber: 'Order #GB12345678',
      date: '10 May 2025',
      productName: 'Domestic LPG',
      weight: '14.2 KG',
      price: '₹1,100',
      status: 'ongoing',
      statusLabel: 'Out for Delivery',
      etaOrDate: 'Arriving in 18 mins',
      actionLabel: 'Track Order',
    },
    {
      id: 'ord-2',
      orderNumber: 'Order #GB12340001',
      date: '02 May 2025',
      productName: 'Domestic LPG',
      weight: '14.2 KG',
      price: '₹1,100',
      status: 'completed',
      statusLabel: 'Delivered',
      etaOrDate: 'Delivered on 02 May',
      actionLabel: 'Order Again',
    },
    {
      id: 'ord-3',
      orderNumber: 'Order #GB12330045',
      date: '25 Apr 2025',
      productName: 'Domestic LPG',
      weight: '14.2 KG',
      price: '₹1,100',
      status: 'completed',
      statusLabel: 'Delivered',
      etaOrDate: 'Delivered on 25 Apr',
      actionLabel: 'Order Again',
    },
  ]

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'all') return true
    return order.status === selectedFilter
  })

  return (
    <div className="orders-scroll-container">
      {/* 1. Header */}
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        {orders.length > 0 && (
          <button className="orders-notification-btn" aria-label="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="orders-notification-dot" />
          </button>
        )}
      </div>

      {/* 2. Filter Tabs (Only shown when orders exist) */}
      {orders.length > 0 && (
        <div className="filter-tabs-row">
          <button
            className={`filter-tab-btn ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab-btn ${selectedFilter === 'ongoing' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('ongoing')}
          >
            Ongoing
          </button>
          <button
            className={`filter-tab-btn ${selectedFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-tab-btn ${selectedFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      )}

      {/* 3. Populated Orders List or Empty State */}
      {filteredOrders.length > 0 ? (
        <div className="orders-list-container">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-item-card">
              {/* Top Row: Order ID + Date */}
              <div className="order-card-top">
                <span className="order-card-id">{order.orderNumber}</span>
                <span className="order-card-date">{order.date}</span>
              </div>

              {/* Main Content: Cylinder + Info + Status/Action */}
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
                  <div className={`status-pill ${order.status}`}>
                    {order.status === 'ongoing' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    )}
                    {order.status === 'completed' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {order.status === 'cancelled' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                    <span>{order.statusLabel}</span>
                  </div>

                  <div className="status-detail-text">
                    {order.status === 'ongoing' ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )}
                    <span>{order.etaOrDate}</span>
                  </div>

                  <button
                    className="order-action-outline-btn"
                    onClick={() => {
                      if (order.status === 'ongoing') {
                        onTrackOrder(order.id)
                      } else {
                        onOrderAgain(order.id)
                      }
                    }}
                  >
                    {order.actionLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* 4. Help / Older Orders Card */}
          <div className="help-order-card" onClick={() => setSelectedFilter('cancelled')}>
            <div className="help-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <circle cx="11" cy="14" r="3" />
                <line x1="13.5" y1="16.5" x2="16" y2="19" />
              </svg>
            </div>
            <div className="help-card-text">
              <h4 className="help-card-title">Can't find your order?</h4>
              <p className="help-card-subtitle">View your cancelled or older orders</p>
            </div>
            <div className="help-card-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State (Matching Reference) */
        <div className="orders-empty-state">
          <div className="empty-illustration-box-wrap">
            <svg width="220" height="200" viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background Glow */}
              <circle cx="120" cy="105" r="75" fill="#EEF4FF" />
              
              {/* Floating Bubbles */}
              <circle cx="48" cy="70" r="4.5" fill="#DBEAFE" />
              <circle cx="192" cy="62" r="5" fill="#DBEAFE" />
              <circle cx="170" cy="72" r="3" fill="#DBEAFE" />
              
              {/* Curved Motion Dotted Arrow (Right) */}
              <path d="M190 76C212 90 216 112 200 128" stroke="#93C5FD" strokeWidth="2.5" strokeDasharray="3 3" fill="none" strokeLinecap="round" />
              <path d="M196 128L200 128L204 122" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* Decorative Botanical Leaves (Left) */}
              <path d="M52 108C42 104 38 92 42 88C46 84 56 88 56 100" fill="#93C5FD" opacity="0.8" />
              <path d="M56 100C46 98 42 88 48 84C54 80 60 88 58 106" fill="#60A5FA" opacity="0.8" />
              <path d="M60 110C48 108 44 114 48 120C52 126 62 122 62 112" fill="#93C5FD" opacity="0.8" />
              <path d="M62 118C52 124 54 132 60 134C66 136 70 128 66 120" fill="#60A5FA" opacity="0.8" />
              <line x1="68" y1="126" x2="52" y2="92" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />

              {/* Shadow underneath box */}
              <ellipse cx="120" cy="158" rx="80" ry="12" fill="#DBEAFE" opacity="0.7" />

              {/* Clipboard (Sitting Inside Box) */}
              <g transform="translate(68, 54)">
                {/* Board */}
                <rect x="10" y="8" width="84" height="106" rx="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3.5" />
                {/* Clip */}
                <rect x="32" y="0" width="40" height="18" rx="4" fill="#2563EB" />
                <circle cx="52" cy="9" r="4" fill="#FFFFFF" />
                
                {/* Checklist Items */}
                <rect x="22" y="24" width="8" height="8" rx="2" fill="#DBEAFE" />
                <line x1="36" y1="28" x2="78" y2="28" stroke="#DBEAFE" strokeWidth="3" strokeLinecap="round" />

                <rect x="22" y="38" width="8" height="8" rx="2" fill="#DBEAFE" />
                <line x1="36" y1="42" x2="88" y2="42" stroke="#DBEAFE" strokeWidth="3" strokeLinecap="round" />

                <rect x="22" y="52" width="8" height="8" rx="2" fill="#DBEAFE" />
                <line x1="36" y1="56" x2="74" y2="56" stroke="#DBEAFE" strokeWidth="3" strokeLinecap="round" />

                <rect x="22" y="66" width="8" height="8" rx="2" fill="#93C5FD" />
                <path d="M24 70L26 72L30 68" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="36" y1="70" x2="84" y2="70" stroke="#DBEAFE" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Open Parcel Box */}
              {/* Back flap */}
              <polygon points="62,118 78,92 162,92 178,118" fill="#3B82F6" />
              
              {/* Box Left Side */}
              <polygon points="62,118 108,126 108,162 62,152" fill="#60A5FA" />
              
              {/* Box Right Side */}
              <polygon points="108,126 178,118 178,152 108,162" fill="#4B8BF5" />

              {/* Left Open Flap */}
              <polygon points="62,118 50,102 96,110 108,126" fill="#93C5FD" />
              
              {/* Right Open Flap */}
              <polygon points="108,126 120,110 166,102 178,118" fill="#93C5FD" />

              {/* Flame / GasBook Logo on Front of Box */}
              <g transform="translate(138, 134) scale(0.65)">
                <path d="M12 2C12 2 15 6 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 6 12 2 12 2Z" fill="#DBEAFE" />
                <path d="M12 6C12 6 18 11 18 16C18 19.31 15.31 22 12 22C8.69 22 6 19.31 6 16C6 11 12 6 12 6Z" fill="#EFF6FF" opacity="0.9" />
              </g>
            </svg>
          </div>

          <h2 className="empty-title">No orders yet</h2>
          <p className="empty-subtitle">
            Your gas cylinder and accessory orders will appear here once you place one.
          </p>

          <button className="empty-explore-btn" onClick={onNavigateToExplore}>
            <span>Explore Products</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
