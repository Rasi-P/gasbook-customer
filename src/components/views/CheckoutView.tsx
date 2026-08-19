import { useState } from 'react'
import { createBooking, getApiErrorDetails, type CustomerProfile } from '../../lib/auth'
import type { CartItem, ProfileUser } from '../../types'
import { calculateCartPricing } from '../../lib/pricing'
import splashCylinder from '../../assets/splash_cylinder.png'
import { EditProfileModal } from '../common/EditProfileModal'

interface CheckoutViewProps {
  cartItems: CartItem[]
  customerProfile: CustomerProfile | null
  profileUser?: ProfileUser
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onProfileUpdated?: () => void
  onNavigateToExplore: () => void
  onBackToCart: () => void
  onOrderCreated: (orders: {id: number, order_id: string}[], completedCart: CartItem[]) => void
}

export function CheckoutView({
  cartItems,
  customerProfile,
  profileUser,
  onUpdateQuantity,
  onProfileUpdated,
  onNavigateToExplore,
  onBackToCart,
  onOrderCreated,
}: CheckoutViewProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditingAddress, setIsEditingAddress] = useState(false)

  const { subtotal, deliveryFee, total } = calculateCartPricing(cartItems)

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
          note: `Order via Customer App (COD)`,
          payment_method: 'COD',
          payment_status: 'PENDING',
          delivery_address: customerAddress,
          delivery_phone: customerPhone,
        }
        return createBooking(payload)
      })

      const responses = await Promise.all(bookingPromises)
      const createdOrders = responses.map((res: any) => ({ id: res.id, order_id: res.order_id }))
      onOrderCreated(createdOrders, cartItems)
    } catch (err: unknown) {
      const details = getApiErrorDetails(err, 'Unable to place order. Please try again.')
      setError(details.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle empty cart state directly
  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ background: '#EEF4FF', borderRadius: '50%', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5">
            <circle cx="9" cy="21" r="2" />
            <circle cx="20" cy="21" r="2" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.4rem', color: '#1E293B', marginBottom: '8px', margin: 0 }}>Your cart is empty</h2>
        <p style={{ color: '#64748B', marginBottom: '32px' }}>Add a cylinder to your cart to continue.</p>
        <button onClick={onNavigateToExplore} style={{ background: '#2563EB', color: '#FFF', border: 'none', padding: '14px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
          Browse Cylinders
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '160px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px', background: '#FFF', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #F1F5F9' }}>
        <button onClick={onBackToCart} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#1E293B' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '1.2rem', color: '#1E293B', paddingRight: '28px' }}>
          Order Summary
        </h1>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Your Order Card */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
            </svg>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1E293B' }}>Your Order</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item, idx) => (
              <div key={item.id}>
                {idx > 0 && <div style={{ borderTop: '1px solid #F1F5F9', margin: '0 0 16px 0' }} />}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '60px', height: '60px', background: '#F8FAFC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={splashCylinder} alt={item.name} style={{ width: '40px', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem' }}>{item.name}</span>
                        <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>{item.variant}</span>
                      </div>
                      <span style={{ color: '#1E293B', fontSize: '0.95rem' }}>₹{item.unitPrice.toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                        <button onClick={() => onUpdateQuantity(item.id, -1)} style={{ width: '32px', height: '32px', background: '#FFF', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ width: '32px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500, color: '#1E293B' }}>{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} style={{ width: '32px', height: '32px', background: '#FFF', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', margin: '16px 0', borderStyle: 'dashed' }} />
          
          <button onClick={onBackToCart} style={{ width: '100%', background: 'none', border: 'none', color: '#2563EB', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>+</span> Add more items
          </button>
        </div>

        {/* Delivery Address Card */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#1E293B' }}>Delivery Address</h3>
            </div>
            <button onClick={() => setIsEditingAddress(true)} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>Edit</button>
          </div>

          <div style={{ paddingLeft: '28px' }}>
            {hasValidAddress ? (
              <>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem', marginBottom: '4px' }}>
                  {customerName} {customerPhone ? `(${customerPhone})` : ''}
                </div>
                <div style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  {customerAddress}
                </div>
              </>
            ) : (
              <div style={{ color: '#EF4444', fontSize: '0.9rem', padding: '8px 0' }}>
                Please edit and add your delivery address.
              </div>
            )}
          </div>
        </div>

        {/* Price Details Card */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1E293B' }}>Price Details</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', color: '#64748B' }}>
            <span>Subtotal</span>
            <span style={{ color: '#1E293B' }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.95rem', color: '#64748B' }}>
            <span>Delivery Fee</span>
            <span style={{ color: '#1E293B' }}>₹{deliveryFee.toLocaleString('en-IN')}</span>
          </div>
          
          <div style={{ borderTop: '1px solid #F1F5F9', margin: '0 -16px 16px', borderStyle: 'dashed' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#1E293B', fontWeight: 600, fontSize: '1.05rem' }}>Total Amount</span>
            <span style={{ color: '#2563EB', fontWeight: 700, fontSize: '1.15rem' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment Method Card */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1E293B' }}>Payment Method</h3>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: '#DCFCE7', borderRadius: '8px', width: '40px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem' }}>Cash on Delivery (COD)</div>
              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>Pay ₹{total.toLocaleString('en-IN')} upon delivery</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginTop: '8px' }}>
            {error}
          </div>
        )}
      </div>

      {/* Sticky Confirm Button */}
      <div style={{ position: 'fixed', bottom: '68px', left: 0, right: 0, margin: '0 auto', maxWidth: '480px', background: '#FFF', padding: '16px 20px', borderTop: '1px solid #F1F5F9', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)', zIndex: 10 }}>
        <button 
          onClick={handlePlaceOrder}
          disabled={submitting || !hasValidAddress}
          style={{ width: '100%', padding: '16px', background: '#EA580C', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (submitting || !hasValidAddress) ? 0.6 : 1 }}
        >
          {submitting ? 'Placing Order...' : 'Confirm Booking'}
          {!submitting && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>

      {/* Edit Profile Modal */}
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
