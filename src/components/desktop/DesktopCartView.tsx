import { useEffect, useState } from 'react'
import { previewBookings, type BookingPreviewResponse, type CustomerProfile } from '../../lib/auth'
import type { CartItem, ProfileUser } from '../../types'
import { buildBookingPreviewPayload, createEmptyPreview, formatMoney, previewItemByCartId } from '../../lib/pricing'
import { getCylinderImage } from '../../lib/formatters'
import { EditProfileModal } from '../common/EditProfileModal'

interface DesktopCartViewProps {
  cartItems: CartItem[]
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onNavigateToExplore: () => void
  onProceedToCheckout: () => void
  customerProfile: CustomerProfile | null
  profileUser?: ProfileUser
  onProfileUpdated?: () => void
}

export function DesktopCartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onNavigateToExplore,
  onProceedToCheckout,
  customerProfile,
  profileUser,
  onProfileUpdated,
}: DesktopCartViewProps) {
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

  const deliveryName = customerProfile?.name?.trim() || customerProfile?.full_name?.trim() || 'Customer'
  const deliveryAddress = customerProfile?.address?.trim() || 'Add your delivery address'

  return (
    <div className="desktop-container">
      {/* 1. Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#1e293b' }}>
            Shopping Cart {totalCount > 0 && <span style={{ color: '#64748b', fontSize: '18px', fontWeight: 500 }}>({totalCount} {totalCount === 1 ? 'item' : 'items'})</span>}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
            Review your selected cylinders and proceed to booking.
          </p>
        </div>

        <button
          onClick={onNavigateToExplore}
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
          <span>← Continue Shopping</span>
        </button>
      </div>

      {cartItems.length > 0 ? (
        <div className="desktop-cart-layout">
          {/* Left Column: Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
                }}
              >
                {/* Product Image */}
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img src={getCylinderImage(item.name, item.variant)} alt={item.name} style={{ height: '60px', objectFit: 'contain' }} />
                </div>

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.variant}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '16.5px', fontWeight: 700, color: '#1e293b' }}>
                    {item.name}
                  </h3>
                  <div style={{ fontSize: '13.5px', color: '#64748b' }}>
                    Unit Price:{' '}
                    {previewItemByCartId(pricingPreview, item.id)?.has_discount && (
                      <span style={{ color: '#94a3b8', textDecoration: 'line-through', marginRight: '6px' }}>
                        {formatMoney(item.unitPrice)}
                      </span>
                    )}
                    <strong style={{ color: '#1e293b' }}>
                      {formatMoney(previewItemByCartId(pricingPreview, item.id)?.rate || item.unitPrice)}
                    </strong>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="desktop-qty-stepper">
                  <button
                    className="desktop-qty-btn"
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="desktop-qty-value">{item.quantity}</span>
                  <button
                    className="desktop-qty-btn"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Total Item Price */}
                <div style={{ minWidth: '100px', textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                    {formatMoney(previewItemByCartId(pricingPreview, item.id)?.final_amount || item.unitPrice * item.quantity)}
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  style={{
                    background: '#fef2f2',
                    border: 'none',
                    borderRadius: '10px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#dc2626',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  title="Remove item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="desktop-sticky-summary">
            <div className="desktop-cart-card">
              {/* Delivery Address Box */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#1052be' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>DELIVERY DESTINATION</span>
                  </div>
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1052be',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Change
                  </button>
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '2px' }}>
                  {deliveryName}
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
                  {deliveryAddress}
                </p>
              </div>

              {/* Price Breakdown */}
              <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                  <span>Original Amount</span>
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
                  <span style={{ color: '#1e293b' }}>Total Payable</span>
                  <span style={{ color: '#1052be' }}>{formatMoney(pricingPreview.summary.final_amount)}</span>
                </div>
              </div>

              {/* Safety banner */}
              <div
                style={{
                  background: '#f0fdf4',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  fontSize: '12.5px',
                  color: '#166534',
                  fontWeight: 500,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span>Safe, sanitized, sealed cylinder guarantee</span>
              </div>

              {/* Proceed CTA */}
              <button
                onClick={onProceedToCheckout}
                style={{
                  width: '100%',
                  background: '#ff7a00',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 122, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>Proceed to Order Summary</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '64px 32px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            maxWidth: '560px',
            margin: '40px auto',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#1052be',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>
            Your Cart is Empty
          </h3>
          <p style={{ margin: '0 0 24px', fontSize: '14.5px', color: '#64748b', lineHeight: 1.5 }}>
            You haven't added any gas cylinders or connections to your cart yet.
          </p>
          <button
            onClick={onNavigateToExplore}
            style={{
              background: '#ff7a00',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '13px 32px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 122, 0, 0.3)',
            }}
          >
            Browse Cylinders
          </button>
        </div>
      )}

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
