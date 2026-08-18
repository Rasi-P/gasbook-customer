import { useState } from 'react'
import { createBooking, getApiErrorDetails, type CustomerProfile } from '../../lib/auth'
import type { CartItem } from '../../types'

interface CheckoutViewProps {
  cartItems: CartItem[]
  customerProfile: CustomerProfile | null
  onBackToCart: () => void
  onOrderCreated: (orderIds: number[], completedCart: CartItem[]) => void
}

import { calculateCartPricing } from '../../lib/pricing'

export function CheckoutView({
  cartItems,
  customerProfile,
  onBackToCart,
  onOrderCreated,
}: CheckoutViewProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { subtotal, deliveryFee, total } = calculateCartPricing(cartItems)

  const customerName = customerProfile?.name?.trim() || customerProfile?.full_name?.trim() || ''
  const customerPhone = customerProfile?.phone?.trim() || ''
  const customerAddress = customerProfile?.address?.trim() || ''
  
  const hasValidAddress = Boolean(customerAddress)

  const handlePlaceOrder = async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)

    try {
      // Create a booking for each distinct cart item. 
      // The API currently accepts cylinder_type and quantity.
      const bookingPromises = cartItems.map((item) => {
        const payload = {
          cylinder_type: item.cylinderTypeId || 1,
          quantity: item.quantity || 1,
          note: `Order via Customer App (COD)`,
          payment_method: 'COD',
          payment_status: 'PENDING',
          delivery_address: customerAddress,
          delivery_phone: customerPhone,
        }
        return createBooking(payload)
      })

      // Wait for all bookings to succeed
      const responses = await Promise.all(bookingPromises)
      
      // Extract the order IDs
      const orderIds = responses.map((res: any) => res.id)
      onOrderCreated(orderIds, cartItems)
    } catch (err: unknown) {
      const details = getApiErrorDetails(err, 'Unable to place order. Please try again.')
      setError(details.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cart-scroll-container">
      {/* 1. Header */}
      <div className="cart-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
        <button onClick={onBackToCart} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#64748b' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="cart-title" style={{ margin: 0, fontSize: '1.25rem' }}>Order Summary</h1>
      </div>

      <div className="cart-populated-layout">
        {/* 2. Order Summary Card */}
        <div className="cart-summary-card" style={{ marginTop: '0' }}>
          <h3 className="section-title" style={{ fontSize: '1.05rem', marginBottom: '12px' }}>
            Order Summary
          </h3>
          <div className="cart-items-list" style={{ gap: '10px' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>
                  {item.quantity}x {item.name} ({item.variant})
                </span>
                <span style={{ fontWeight: 600 }}>
                  ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="price-divider" style={{ margin: '12px 0' }} />

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
              <span className="total-label">Total Amount</span>
              <span className="total-val">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* 3. Delivery Details Card */}
        <div className="cart-summary-card">
          <h3 className="section-title" style={{ fontSize: '1.05rem', marginBottom: '12px' }}>
            Delivery Details
          </h3>
          <div className="delivery-address-row">
            <div className="address-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            {hasValidAddress ? (
              <div className="address-details">
                <h4 className="address-name">{customerName} {customerPhone ? `(${customerPhone})` : ''}</h4>
                <p className="address-text">{customerAddress}</p>
              </div>
            ) : (
              <div className="address-details">
                <h4 className="address-name" style={{ color: '#ef4444' }}>Address Missing</h4>
                <p className="address-text">Please add your address in your Profile to book a cylinder.</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Payment Method Card */}
        <div className="cart-summary-card">
          <h3 className="section-title" style={{ fontSize: '1.05rem', marginBottom: '12px' }}>
            Payment Method
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '2px solid #2563EB' }}>
            <span style={{ fontSize: '1.4rem' }}>💵</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#1E293B', display: 'block', fontSize: '0.95rem' }}>Cash on Delivery (COD)</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Pay ₹{total.toLocaleString('en-IN')} upon delivery</span>
            </div>
            <span style={{ color: '#2563EB', fontWeight: 'bold' }}>✓</span>
          </div>
        </div>

        {error && <p className="form-feedback form-feedback--error">{error}</p>}

        {/* 5. Submit Button */}
        <button 
          className="proceed-checkout-btn" 
          onClick={handlePlaceOrder} 
          disabled={submitting || !hasValidAddress}
          style={{ opacity: (!hasValidAddress) ? 0.6 : 1 }}
        >
          <span>{submitting ? 'Placing Order...' : 'Confirm Booking'}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}
