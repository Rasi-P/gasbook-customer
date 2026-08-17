import { useState } from 'react'
import splashCylinder from '../../assets/splash_cylinder.png'
import type { CustomerProfile } from '../../lib/auth'
import type { CartItem, ProfileUser } from '../../types'
import { EditProfileModal } from '../common/EditProfileModal'

interface CartViewProps {
  cartItems: CartItem[]
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onNavigateToExplore: () => void
  onProceedToCheckout: () => void
  customerProfile: CustomerProfile | null
  profileUser?: ProfileUser
  onProfileUpdated?: () => void
}

export function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onNavigateToExplore,
  onProceedToCheckout,
  customerProfile,
  profileUser,
  onProfileUpdated,
}: CartViewProps) {
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
  const deliveryFee = cartItems.length > 0 ? 40 : 0
  const total = subtotal + deliveryFee
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleCheckout = () => {
    onProceedToCheckout()
  }

  const handleChangeAddress = () => {
    setIsEditingAddress(true)
  }

  const deliveryName = customerProfile?.name?.trim() || customerProfile?.full_name?.trim() || 'Customer'
  const deliveryAddress = customerProfile?.address?.trim() || 'Add your delivery address in GasBook.'

  return (
    <div className="cart-scroll-container">
      {/* 1. Header */}
      <div className="cart-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
        <button onClick={onNavigateToExplore} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#64748b' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="cart-title" style={{ margin: 0, fontSize: '1.25rem' }}>Cart</h1>
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
                <h4 className="address-name">{deliveryName}</h4>
                <p className="address-text">{deliveryAddress}</p>
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
            <span>Proceed to Order Summary</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button className="secondary-button" onClick={onNavigateToExplore} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'transparent', fontWeight: 600, color: '#3b82f6', cursor: 'pointer', marginTop: '12px' }}>
            Continue Shopping
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

          <h2 className="empty-title">Your Cart is Empty</h2>
          <p className="empty-subtitle">Add a cylinder to your cart to continue.</p>

          <button className="empty-explore-btn" onClick={onNavigateToExplore}>
            Book Cylinder
          </button>
        </div>
      )}

      {/* Edit Profile Modal for changing delivery address */}
      {isEditingAddress && profileUser && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setIsEditingAddress(false)}
          onSuccess={() => {
            setIsEditingAddress(false)
            if (onProfileUpdated) onProfileUpdated()
          }}
        />
      )}
    </div>
  )
}
