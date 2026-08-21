import { useEffect, useState } from 'react'
import { createBooking, getApiErrorDetails, previewBookings, type BookingPreviewResponse, type BookingRecord, type CustomerProfile } from '../../lib/auth'
import type { CartItem, ProfileUser } from '../../types'
import { buildBookingPreviewPayload, createEmptyPreview, formatMoney, previewItemByCartId, previewUnitRates } from '../../lib/pricing'
import { getCylinderImage } from '../../lib/formatters'
import { EditProfileModal } from '../common/EditProfileModal'

interface DesktopCheckoutViewProps {
  cartItems: CartItem[]
  customerProfile: CustomerProfile | null
  profileUser?: ProfileUser
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onProfileUpdated?: () => void
  onNavigateToExplore: () => void
  onBackToCart: () => void
  onOrderCreated: (bookings: BookingRecord[]) => void
}

export function DesktopCheckoutView({
  cartItems,
  customerProfile,
  profileUser,
  onUpdateQuantity,
  onProfileUpdated,
  onNavigateToExplore,
  onBackToCart,
  onOrderCreated,
}: DesktopCheckoutViewProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditingAddress, setIsEditingAddress] = useState(false)

  const [pricingPreview, setPricingPreview] = useState<BookingPreviewResponse>(createEmptyPreview())
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    let ignore = false

    if (cartItems.length === 0) {
      setPricingPreview(createEmptyPreview())
      return
    }

    previewBookings(buildBookingPreviewPayload(cartItems))
      .then((data) => {
        if (!ignore) setPricingPreview(data)
      })
      .catch(() => {
        if (!ignore) setPricingPreview(createEmptyPreview())
      })

    return () => {
      ignore = true
    }
  }, [cartItems])

  const customerName = customerProfile?.name?.trim() || customerProfile?.full_name?.trim() || 'Customer'
  const customerPhone = customerProfile?.phone?.trim() || ''
  const customerAddress = customerProfile?.address?.trim() || ''
  const hasValidAddress = Boolean(customerAddress)

  const handlePlaceOrder = async () => {
    if (submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const bookingPromises = cartItems.map((item) => {
        const payload = {
          cylinder_type: item.cylinderTypeId || 1,
          quantity: item.quantity || 1,
          note: `Order via Customer Desktop Web (COD)`,
          payment_method: 'COD',
          payment_status: 'PENDING',
          delivery_address: customerAddress,
          delivery_phone: customerPhone,
        }
        return createBooking(payload)
      })

      const responses = await Promise.all(bookingPromises)
      onOrderCreated(responses)
    } catch (err: unknown) {
      const details = getApiErrorDetails(err, 'Unable to place order. Please try again.')
      setError(details.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="desktop-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Your Cart is Empty</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Add a cylinder to proceed with booking.</p>
        <button
          onClick={onNavigateToExplore}
          style={{
            background: '#1052be',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 28px',
            fontSize: '14.5px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Browse Cylinders
        </button>
      </div>
    )
  }

  return (
    <div className="desktop-container">
      {/* 1. Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#1e293b' }}>
            Checkout &amp; Order Summary
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
            Confirm your delivery address and payment method to complete booking.
          </p>
        </div>

        <button
          onClick={onBackToCart}
          style={{
            background: 'none',
            border: 'none',
            color: '#1052be',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>← Back to Cart</span>
        </button>
      </div>

      {/* 2. Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left Column: Your Order + Payment Method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Review Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1052be" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
                  Your Order ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </h3>
              </div>
              <button
                onClick={onNavigateToExplore}
                style={{ background: 'none', border: 'none', color: '#1052be', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                + Add More
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img src={getCylinderImage(item.name, item.variant)} alt={item.name} style={{ height: '44px', objectFit: 'contain' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14.5px', color: '#1e293b' }}>{item.name}</span>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                          {item.variant}
                        </span>
                      </div>
                      {(() => {
                        const rates = previewUnitRates(previewItemByCartId(pricingPreview, item.id), item.unitPrice)
                        return (
                          <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                            {rates.hasDiscount && (
                              <span style={{ color: '#94a3b8', textDecoration: 'line-through', marginRight: '6px' }}>
                                {formatMoney(rates.original)}
                              </span>
                            )}
                            {formatMoney(rates.effective)} × {item.quantity}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="desktop-qty-stepper">
                      <button className="desktop-qty-btn" onClick={() => onUpdateQuantity(item.id, -1)}>
                        −
                      </button>
                      <span className="desktop-qty-value">{item.quantity}</span>
                      <button className="desktop-qty-btn" onClick={() => onUpdateQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>

                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', minWidth: '80px', textAlign: 'right' }}>
                      {formatMoney(previewItemByCartId(pricingPreview, item.id)?.final_amount || item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1052be" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
                Payment Method
              </h3>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '14px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#166534' }}>
                  Cash on Delivery (COD)
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#15803d' }}>
                  Pay {formatMoney(pricingPreview.summary.final_amount)} in cash or UPI directly to your delivery agent at doorstep.
                </p>
              </div>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Address & Summary CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Delivery Address Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1052be">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#1e293b' }}>
                  Delivery Address
                </h3>
              </div>
              <button
                onClick={() => setIsEditingAddress(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1052be',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Edit Address
              </button>
            </div>

            {hasValidAddress ? (
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#1e293b', marginBottom: '2px' }}>
                  {customerName} {customerPhone && <span style={{ color: '#64748b', fontWeight: 500 }}>({customerPhone})</span>}
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: 1.45 }}>
                  {customerAddress}
                </p>
              </div>
            ) : (
              <div style={{ background: '#fef2f2', padding: '14px 16px', borderRadius: '12px', color: '#dc2626', fontSize: '13.5px' }}>
                Please add a valid delivery address before placing order.
              </div>
            )}
          </div>

          {/* Price Breakdown & CTA */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
              Payment Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                <span>Original Amount ({totalCount} cylinders)</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatMoney(pricingPreview.summary.original_amount)}</span>
              </div>
              {pricingPreview.summary.has_discount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>- {formatMoney(pricingPreview.summary.discount_amount)}</span>
                </div>
              )}

              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800 }}>
                <span style={{ color: '#1e293b' }}>Final Amount</span>
                <span style={{ color: '#1052be' }}>{formatMoney(pricingPreview.summary.final_amount)}</span>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={submitting || !hasValidAddress}
              style={{
                width: '100%',
                background: '#ff7a00',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '15px',
                fontSize: '16px',
                fontWeight: 800,
                cursor: submitting || !hasValidAddress ? 'not-allowed' : 'pointer',
                opacity: submitting || !hasValidAddress ? 0.6 : 1,
                boxShadow: '0 6px 20px rgba(255, 122, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
              {!submitting && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Address Edit Modal */}
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
