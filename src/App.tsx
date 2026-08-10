import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import {
  changePassword,
  getApiErrorDetails,
  getCurrentUser,
  hasStoredSession,
  login,
  logout,
  type CurrentUser,
} from './lib/auth'
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
  onChange,
  onToggle,
  autoComplete,
}: {
  id: string
  value: string
  placeholder: string
  visible: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onToggle: () => void
  autoComplete?: string
}) {
  return (
    <div className="input-wrapper">
      <LockIcon />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
      />
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

function ExploreView({
  cartCount,
  onBook,
  onNavigateToCart,
}: {
  cartCount: number
  onBook: (productName: string) => void
  onNavigateToCart: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cylinder' | 'connection'>('all')

  const products = [
    {
      id: 'p1',
      name: '12 KG Gas Cylinder',
      price: '₹1,300',
      category: 'cylinder',
      isPopular: true,
    },
    {
      id: 'p2',
      name: '17 KG Gas Cylinder',
      price: '₹2,400',
      category: 'cylinder',
      isPopular: false,
    },
  ]

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (selectedCategory === 'cylinder' && p.category === 'cylinder') ||
      searchQuery === ''
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="explore-scroll-container">
      {/* 1. Header */}
      <div className="explore-header">
        <h1 className="explore-title">Explore</h1>
        <button className="cart-header-btn" onClick={onNavigateToCart} aria-label="Shopping Cart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
        </button>
      </div>

      {/* 2. Search Field */}
      <div className="explore-search-bar">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search cylinders, accessories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="explore-search-input"
        />
        {searchQuery && (
          <button className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      {/* 3. Categories (ONLY 2 CATEGORIES) */}
      <div className="explore-categories-section">
        <div className="section-header">
          <h2 className="section-title">Categories</h2>
          <button className="view-all-btn" onClick={() => setSelectedCategory('all')}>
            <span>View all</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <div className="categories-two-grid">
          {/* Category 1: Gas Cylinder */}
          <div
            className={`category-card cylinder-category ${selectedCategory === 'cylinder' ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === 'cylinder' ? 'all' : 'cylinder')}
            role="button"
            tabIndex={0}
          >
            <div className="category-img-wrapper">
              <img src={splashCylinder} className="category-cylinder-img" alt="Gas Cylinder" />
            </div>
            <span className="category-name">Gas Cylinder</span>
          </div>

          {/* Category 2: New Connection */}
          <div
            className={`category-card connection-category ${selectedCategory === 'connection' ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === 'connection' ? 'all' : 'connection')}
            role="button"
            tabIndex={0}
          >
            <div className="category-img-wrapper">
              <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Clipboard body */}
                <rect x="22" y="24" width="56" height="68" rx="8" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="4" />
                {/* Clipboard clip */}
                <rect x="36" y="16" width="28" height="14" rx="4" fill="#3B82F6" />
                <circle cx="50" cy="23" r="3" fill="#FFFFFF" />
                {/* Checklist lines with checkmarks */}
                <path d="M32 40L36 44L44 36" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="48" y1="40" x2="68" y2="40" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" />
                
                <path d="M32 54L36 58L44 50" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="48" y1="54" x2="68" y2="54" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" />
                
                <path d="M32 68L36 72L44 64" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="48" y1="68" x2="68" y2="68" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round" />
                
                {/* Blue verified badge */}
                <circle cx="70" cy="74" r="14" fill="#1D4ED8" />
                <path d="M64 74L68 78L76 70" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="category-name">New Connection</span>
          </div>
        </div>
      </div>

      {/* 4. Quick Book Section */}
      <div className="quick-book-section">
        <div className="quick-book-header">
          <h2 className="section-title">Quick Book</h2>
          <div className="quick-book-subhead">
            <span className="orange-accent-bar" />
            <span className="subhead-text">Popular gas cylinders</span>
          </div>
        </div>

        {/* 2-Column Product Grid */}
        <div className="products-grid">
          {filteredProducts.map((prod) => (
            <div key={prod.id} className="product-card">
              {prod.isPopular && (
                <div className="popular-badge">
                  <span className="flame-icon">🔥</span>
                  <span>Most Popular</span>
                </div>
              )}
              <div className="product-img-container">
                <img src={splashCylinder} className="product-cylinder-img" alt={prod.name} />
              </div>
              <div className="product-details">
                <h3 className="product-name">{prod.name}</h3>
                <div className="product-price">{prod.price}</div>
                <button className="product-book-btn" onClick={() => onBook(prod.name)}>
                  Book
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="no-products-found">
              <p>No products match "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Why Choose GasBook? Section */}
      <div className="why-choose-card">
        <h3 className="why-choose-title">Why Choose GasBook?</h3>
        <div className="why-choose-grid">
          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h4 className="feature-name">On-time Delivery</h4>
            <p className="feature-desc">Always on time</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h4 className="feature-name">Safe &amp; Secure</h4>
            <p className="feature-desc">100% safety</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <h4 className="feature-name">Trusted by 10L+</h4>
            <p className="feature-desc">Happy customers</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OrderItem {
  id: string
  orderNumber: string
  date: string
  productName: string
  weight: string
  price: string
  status: 'ongoing' | 'completed' | 'cancelled'
  statusLabel: string
  etaOrDate: string
  actionLabel: string
}

function OrdersView({
  onNavigateToExplore,
  onTrackOrder,
  onOrderAgain,
}: {
  onNavigateToExplore: () => void
  onTrackOrder: (orderId: string) => void
  onOrderAgain: (orderId: string) => void
}) {
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

interface CartItem {
  id: string
  name: string
  variant: string
  unitPrice: number
  quantity: number
  type: 'cylinder' | 'accessory'
}

function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onNavigateToExplore,
}: {
  cartItems: CartItem[]
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onNavigateToExplore: () => void
}) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
  const deliveryFee = cartItems.length > 0 ? 40 : 0
  const total = subtotal + deliveryFee
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleCheckout = () => {
    alert(`Proceeding to checkout for total ₹${total.toLocaleString('en-IN')}`)
  }

  const handleChangeAddress = () => {
    alert('Opening address management...')
  }

  return (
    <div className="cart-scroll-container">
      {/* 1. Header */}
      <div className="cart-header">
        <h1 className="cart-title">My Cart</h1>
        {totalCount > 0 && (
          <div className="cart-header-icon-wrap" aria-label="Cart items">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="cart-count-badge">{totalCount}</span>
          </div>
        )}
      </div>

      {cartItems.length > 0 ? (
        <div className="cart-populated-layout">
          {/* 2. Product Cart Cards */}
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-product-card">
                {/* Left: Product Image */}
                <div className="cart-product-img-wrap">
                  {item.type === 'cylinder' ? (
                    <img src={splashCylinder} className="cart-cylinder-img" alt={item.name} />
                  ) : (
                    <div className="cart-accessory-svg">
                      <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                        <path d="M22 68C18 52 28 36 48 36C70 36 82 50 82 66C82 78 68 84 48 84C32 84 22 76 22 68Z" stroke="#F97316" strokeWidth="9" strokeLinecap="round" />
                        <ellipse cx="50" cy="52" rx="20" ry="14" fill="#1D4ED8" />
                        <circle cx="50" cy="48" r="13" fill="#2563EB" />
                        <circle cx="50" cy="46" r="6" fill="#3B82F6" />
                        <circle cx="50" cy="46" r="2.5" fill="#FFFFFF" />
                        <rect x="68" y="52" width="13" height="7" rx="2" fill="#1E293B" />
                        <rect x="46" y="62" width="8" height="11" rx="2" fill="#1E293B" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Center & Info */}
                <div className="cart-product-info">
                  <div className="cart-title-row">
                    <h3 className="cart-product-name">{item.name}</h3>
                    <button
                      className="cart-delete-btn"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  <span className="cart-variant-badge">{item.variant}</span>

                  <div className="cart-bottom-row">
                    {/* Quantity Control */}
                    <div className="cart-qty-control">
                      <button
                        className="qty-btn qty-minus"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn qty-plus"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <span className="cart-item-price">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Delivery Address & Price Summary Card */}
          <div className="cart-summary-card">
            {/* Delivery Address */}
            <div className="delivery-address-row">
              <div className="address-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="address-details">
                <span className="address-label">Delivery Address</span>
                <h4 className="address-name">Aleena Jomy</h4>
                <p className="address-text">Edappally, Kochi, Kerala - 682024</p>
              </div>
              <button className="change-address-btn" onClick={handleChangeAddress}>
                <span>Change</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="price-breakdown-section">
              <div className="price-row">
                <span className="price-label">Subtotal</span>
                <span className="price-val">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-row">
                <span className="price-label">Delivery Fee</span>
                <span className="price-val">₹{deliveryFee.toLocaleString('en-IN')}</span>
              </div>

              <div className="price-divider" />

              <div className="price-row total-row">
                <span className="total-label">Total</span>
                <span className="total-val">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Safety Message Strip */}
            <div className="safety-delivery-strip">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>Safe, secure and on-time delivery</span>
            </div>
          </div>

          {/* 4. Checkout CTA Button */}
          <button className="proceed-checkout-btn" onClick={handleCheckout}>
            <span>Proceed to Checkout</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="empty-cart-content">
          <div className="empty-illustration-circle">
            <svg width="140" height="140" viewBox="0 0 160 160" fill="none">
              <circle cx="80" cy="80" r="70" fill="#EEF4FF" />
              <circle cx="112" cy="48" r="11" fill="#DBEAFE" />
              <circle cx="112" cy="48" r="6" fill="#93C5FD" opacity="0.6" />
              
              <path d="M42 50H54L68 100H116L126 60H56" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M68 60H126" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
              <path d="M72 75H122" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
              <path d="M76 90H118" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
              
              <line x1="80" y1="56" x2="76" y2="98" stroke="#93C5FD" strokeWidth="2.5" />
              <line x1="95" y1="56" x2="93" y2="98" stroke="#93C5FD" strokeWidth="2.5" />
              <line x1="110" y1="56" x2="110" y2="98" stroke="#93C5FD" strokeWidth="2.5" />
              
              <circle cx="70" cy="116" r="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="4" />
              <circle cx="114" cy="116" r="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="4" />
            </svg>
          </div>

          <h2 className="empty-title">Your cart is empty</h2>
          <p className="empty-subtitle">Products you add will show up here.</p>

          <button className="empty-explore-btn" onClick={onNavigateToExplore}>
            Explore Products
          </button>
        </div>
      )}
    </div>
  )
}

function HomeView({ onBook }: { onBook: (productName: string) => void }) {
  const [hasActiveOrder] = useState(false)

  return (
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

interface ProfileUser {
  name: string
  email: string
  phone: string
  memberSince: string
}

function ProfileView({
  user = {
    name: 'Aleena Jomy',
    email: 'aleenajomy4@gmail.com',
    phone: '+91 85471 39184',
    memberSince: 'May 2025',
  },
  onNavigateToAddresses,
  onLogout,
}: {
  user?: ProfileUser
  onNavigateToAddresses: () => void
  onLogout: () => void
}) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="profile-scroll-container">
      {/* 1. Profile Hero Card */}
      <div className="profile-hero-card">
        {/* Background Decorative Rings */}
        <div className="hero-bg-ring hero-ring-1" />
        <div className="hero-bg-ring hero-ring-2" />
        <div className="hero-bg-ring hero-ring-3" />

        <div className="profile-hero-content">
          <div className="profile-avatar-circle">
            <span className="avatar-initials">{initials}</span>
          </div>
          <div className="profile-hero-text">
            <h1 className="profile-user-name">{user.name}</h1>
            <p className="profile-hero-subtitle">
              Manage your account and saved details.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Account Details Section */}
      <div className="profile-section">
        <h2 className="profile-section-heading">Account Details</h2>
        <div className="profile-card">
          {/* Row 1: Phone */}
          <div className="profile-row-item">
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="profile-row-label">Phone Number</span>
            </div>
            <span className="profile-row-val">{user.phone}</span>
          </div>

          <div className="profile-row-divider" />

          {/* Row 2: Email */}
          <div className="profile-row-item">
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <span className="profile-row-label">Email Address</span>
            </div>
            <span className="profile-row-val profile-email-val">{user.email}</span>
          </div>

          <div className="profile-row-divider" />

          {/* Row 3: Member Since */}
          <div className="profile-row-item">
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="profile-row-label">Member Since</span>
            </div>
            <span className="profile-row-val">{user.memberSince}</span>
          </div>
        </div>
      </div>

      {/* 3. Account Section */}
      <div className="profile-section">
        <h2 className="profile-section-heading">Account</h2>
        <div className="profile-card">
          {/* Row 1: My Addresses */}
          <button className="profile-action-row" onClick={onNavigateToAddresses}>
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className="profile-row-action-label">My Addresses</span>
            </div>
            <div className="profile-chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          <div className="profile-row-divider" />

          {/* Row 2: Logout */}
          <button className="profile-action-row" onClick={onLogout}>
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <span className="profile-row-action-label">Logout</span>
            </div>
            <div className="profile-chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function HomeScreen({ onLogout }: { onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'orders' | 'cart' | 'profile'>('home')
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter((item): item is CartItem => item !== null)
    )
  }

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleBook = (productName: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.name.toLowerCase().includes(productName.toLowerCase()) || productName.toLowerCase().includes(item.name.toLowerCase()))
      if (existing) {
        return prev.map((item) => (item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          name: productName,
          variant: productName.includes('17') ? '17 KG' : '14.2 KG',
          unitPrice: productName.includes('17') ? 2400 : 1300,
          quantity: 1,
          type: 'cylinder',
        },
      ]
    })
    setActiveTab('cart')
  }

  const handleNavigateToCart = () => {
    setActiveTab('cart')
  }

  return (
    <div className="home-root">
      <div className="home-reference-frame">
        {/* Render Tab Content based on activeTab */}
        {activeTab === 'explore' && (
          <ExploreView
            cartCount={cartCount}
            onBook={handleBook}
            onNavigateToCart={handleNavigateToCart}
          />
        )}
        {activeTab === 'home' && (
          <HomeView onBook={handleBook} />
        )}
        {activeTab === 'orders' && (
          <OrdersView
            onNavigateToExplore={() => setActiveTab('explore')}
            onTrackOrder={(orderId) => alert(`Opening tracking details for ${orderId}`)}
            onOrderAgain={(orderId) => alert(`Reordering items from ${orderId}`)}
          />
        )}
        {activeTab === 'cart' && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onNavigateToExplore={() => setActiveTab('explore')}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView
            onNavigateToAddresses={() => alert('Opening My Addresses')}
            onLogout={() => {
              if (onLogout) {
                onLogout()
              } else {
                alert('Logging out...')
              }
            }}
          />
        )}

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
            <div className="nav-cart-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </div>
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

type NextScreen = Exclude<ScreenType, 'splash'>

type PasswordFieldErrors = {
  current_password?: string
  new_password?: string
  confirm_new_password?: string
}

function resolvePostLoginScreen(user: CurrentUser | null, mustChangePassword: boolean): NextScreen {
  if (user?.must_change_password || mustChangePassword) {
    return 'change-password'
  }

  return 'home'
}

function buildFallbackUser(username: string, userId: number | undefined, mustChangePassword: boolean): CurrentUser {
  return {
    id: userId ?? 0,
    username,
    name: username,
    role: 'customer',
    redirect: null,
    must_change_password: mustChangePassword,
    vehicle_location_name: null,
  }
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash')
  const [postSplashScreen, setPostSplashScreen] = useState<NextScreen>('login')
  const [isSplashReady, setIsSplashReady] = useState(false)
  const [isBootstrapComplete, setIsBootstrapComplete] = useState(false)
  const [authUser, setAuthUser] = useState<CurrentUser | null>(null)

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    rememberMe: false,
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [loginError, setLoginError] = useState<string | null>(null)
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<PasswordFieldErrors>({})
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsSplashReady(true)
    }, 2300)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let isCancelled = false

    const bootstrapSession = async () => {
      let nextScreen: NextScreen = 'login'
      let restoredUser: CurrentUser | null = null
      let restoreError: string | null = null

      if (hasStoredSession()) {
        try {
          restoredUser = await getCurrentUser()
          nextScreen = resolvePostLoginScreen(restoredUser, restoredUser.must_change_password)
        } catch (error) {
          const details = getApiErrorDetails(error, 'Unable to restore your session. Please sign in again.')
          await logout()
          restoreError =
            details.status === 401
              ? 'Your session expired. Please sign in again.'
              : details.message || 'Unable to restore your session. Please sign in again.'
        }
      }

      if (isCancelled) {
        return
      }

      setAuthUser(restoredUser)
      setPostSplashScreen(nextScreen)
      setLoginError(restoreError)
      setIsBootstrapComplete(true)
    }

    void bootstrapSession()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (currentScreen === 'splash' && isSplashReady && isBootstrapComplete) {
      setCurrentScreen(postSplashScreen)
    }
  }, [currentScreen, isBootstrapComplete, isSplashReady, postSplashScreen])

  useEffect(() => {
    const requiresAuth =
      currentScreen === 'change-password' || currentScreen === 'password-success' || currentScreen === 'home'

    if (!requiresAuth || hasStoredSession()) {
      return
    }

    setAuthUser(null)
    setCurrentScreen('login')
    setLoginError('Please sign in to continue.')
  }, [currentScreen])

  const displayName = authUser?.name?.trim() || authUser?.username || loginForm.username.trim() || 'Customer'

  const updateLoginField = (field: 'username' | 'password') => (event: ChangeEvent<HTMLInputElement>) => {
    setLoginForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const updatePasswordField =
    (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => (event: ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
      setPasswordFieldErrors((current) => ({
        ...current,
        [field === 'currentPassword'
          ? 'current_password'
          : field === 'newPassword'
            ? 'new_password'
            : 'confirm_new_password']: undefined,
      }))
      setChangePasswordError(null)
    }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const username = loginForm.username.trim()
    if (!username || !loginForm.password) {
      setLoginError('Username and password are required.')
      return
    }

    setIsLoginSubmitting(true)
    setLoginError(null)

    try {
      const tokenResponse = await login(username, loginForm.password, loginForm.rememberMe)

      let user: CurrentUser

      try {
        user = await getCurrentUser()
      } catch (error) {
        const details = getApiErrorDetails(error, 'Unable to load your account details.')
        if (details.status === 401) {
          throw error
        }
        user = buildFallbackUser(username, tokenResponse.user_id, tokenResponse.must_change_password)
      }

      setAuthUser(user)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordFieldErrors({})
      setChangePasswordError(null)
      setLoginForm((current) => ({
        ...current,
        password: '',
      }))
      setCurrentScreen(resolvePostLoginScreen(user, tokenResponse.must_change_password))
    } catch (error) {
      const details = getApiErrorDetails(error, 'Invalid username or password.')
      await logout()
      setAuthUser(null)
      setLoginError(details.message)
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsPasswordSubmitting(true)
    setChangePasswordError(null)
    setPasswordFieldErrors({})

    try {
      await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_new_password: passwordForm.confirmPassword,
      })

      let nextUser: CurrentUser | null = authUser
        ? { ...authUser, must_change_password: false }
        : buildFallbackUser(loginForm.username.trim() || 'customer', undefined, false)

      try {
        nextUser = await getCurrentUser()
      } catch (error) {
        const details = getApiErrorDetails(error, 'Password changed, but account details could not be refreshed.')
        if (details.status === 401) {
          throw error
        }
      }

      setAuthUser(nextUser)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setCurrentScreen('password-success')
    } catch (error) {
      const details = getApiErrorDetails(error, 'Unable to change password. Please try again.')

      if (details.status === 401) {
        await logout()
        setAuthUser(null)
        setCurrentScreen('login')
        setLoginError('Your session expired. Please sign in again.')
      } else {
        setPasswordFieldErrors({
          current_password: details.fieldErrors.current_password,
          new_password: details.fieldErrors.new_password,
          confirm_new_password: details.fieldErrors.confirm_new_password,
        })
        setChangePasswordError(details.message)
      }
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setAuthUser(null)
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setCurrentScreen('login')
  }

  if (currentScreen === 'splash') {
    return (
      <div className="app-container">
        <div className="app-screen">
          <div className="splash-screen" onClick={() => setIsSplashReady(true)}>
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
                  <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={loginForm.username}
                    onChange={updateLoginField('username')}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <LegacyPasswordInput
                  id="login-password"
                  value={loginForm.password}
                  placeholder="Password"
                  visible={showLoginPassword}
                  onChange={updateLoginField('password')}
                  onToggle={() => setShowLoginPassword((value) => !value)}
                  autoComplete="current-password"
                />
              </div>

              <div className="form-actions">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        rememberMe: event.target.checked,
                      }))
                    }
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-link">
                  Forgot Password?
                </button>
              </div>

              {loginError ? <p className="form-feedback form-feedback--error">{loginError}</p> : null}

              <button type="submit" className="btn-primary" disabled={isLoginSubmitting}>
                {isLoginSubmitting ? 'SIGNING IN...' : 'LOGIN'}
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
              <h2>Welcome {displayName} 👋</h2>
              <p>Please change your password to continue</p>
            </div>

            <form className="login-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="current-password">Current Password</label>
                <LegacyPasswordInput
                  id="current-password"
                  value={passwordForm.currentPassword}
                  placeholder="Current Password"
                  visible={showCurrentPassword}
                  onChange={updatePasswordField('currentPassword')}
                  onToggle={() => setShowCurrentPassword((value) => !value)}
                  autoComplete="current-password"
                />
                {passwordFieldErrors.current_password ? (
                  <p className="field-feedback">{passwordFieldErrors.current_password}</p>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <LegacyPasswordInput
                  id="new-password"
                  value={passwordForm.newPassword}
                  placeholder="New Password"
                  visible={showNewPassword}
                  onChange={updatePasswordField('newPassword')}
                  onToggle={() => setShowNewPassword((value) => !value)}
                  autoComplete="new-password"
                />
                {passwordFieldErrors.new_password ? <p className="field-feedback">{passwordFieldErrors.new_password}</p> : null}
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <LegacyPasswordInput
                  id="confirm-password"
                  value={passwordForm.confirmPassword}
                  placeholder="Confirm Password"
                  visible={showConfirmPassword}
                  onChange={updatePasswordField('confirmPassword')}
                  onToggle={() => setShowConfirmPassword((value) => !value)}
                  autoComplete="new-password"
                />
                {passwordFieldErrors.confirm_new_password ? (
                  <p className="field-feedback">{passwordFieldErrors.confirm_new_password}</p>
                ) : null}
              </div>

              <ul className="password-hints">
                <li>At least 8 characters</li>
                <li>Include number &amp; symbol</li>
              </ul>

              {changePasswordError ? <p className="form-feedback form-feedback--error">{changePasswordError}</p> : null}

              <button type="submit" className="btn-primary" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'SAVING...' : 'SAVE PASSWORD'}
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

          <button
            type="button"
            className="primary-button"
            onClick={() => setCurrentScreen(hasStoredSession() ? 'home' : 'login')}
          >
            CONTINUE
          </button>
        </div>
      </ScreenFrame>
    )
  }

  return <HomeScreen onLogout={handleLogout} />
}

export default App
