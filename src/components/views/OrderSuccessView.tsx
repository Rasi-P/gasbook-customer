import { useEffect, useState } from 'react'
import type { CartItem } from '../../types'
import { calculateCartPricing } from '../../lib/pricing'

interface OrderSuccessViewProps {
  orderIds: number[]
  cartItems: CartItem[]
  onViewOrders: () => void
  onTrackOrder?: (id: number) => void
  onBackToHome?: () => void
}

export function OrderSuccessView({ orderIds, cartItems, onViewOrders, onTrackOrder, onBackToHome }: OrderSuccessViewProps) {
  const { subtotal, deliveryFee, total } = calculateCartPricing(cartItems)

  const handleCopyIds = () => {
    const text = orderIds.map(id => `#GB${id}`).join(', ')
    navigator.clipboard.writeText(text)
  }

  return (
    <div style={{ background: '#FFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .success-anim-container {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 40px auto 24px;
        }
        .success-circle {
          width: 80px;
          height: 80px;
          background: #22C55E;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.4);
        }
        .success-check {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: draw-check 0.4s 0.2s ease-out forwards;
        }
        .confetti-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          opacity: 0;
          animation: pop 0.6s 0.1s ease-out forwards;
        }
        
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes draw-check {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pop {
          0% { transform: scale(0) translate(0, 0); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: scale(1) translate(var(--tx), var(--ty)); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .success-circle, .success-check, .confetti-dot {
            animation: none !important;
            stroke-dashoffset: 0 !important;
            opacity: 1 !important;
          }
          .confetti-dot { opacity: 0 !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
        {onBackToHome && (
          <button onClick={onBackToHome} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 8px 8px 0', color: '#1E293B' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        )}
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '1.2rem', color: '#1E293B', paddingRight: onBackToHome ? '32px' : '0' }}>
          Booking Confirmed
        </h1>
      </div>

      <div style={{ padding: '0 24px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Animated Success Icon */}
        <div className="success-anim-container">
          {/* Confetti particles */}
          <div className="confetti-dot" style={{ background: '#3B82F6', top: '10%', left: '10%', '--tx': '-30px', '--ty': '-30px' } as any}></div>
          <div className="confetti-dot" style={{ background: '#F59E0B', top: '20%', right: '-10%', '--tx': '40px', '--ty': '-20px' } as any}></div>
          <div className="confetti-dot" style={{ background: '#EF4444', bottom: '-10%', left: '20%', '--tx': '-20px', '--ty': '30px' } as any}></div>
          <div className="confetti-dot" style={{ background: '#10B981', bottom: '10%', right: '10%', '--tx': '30px', '--ty': '30px' } as any}></div>
          <div className="confetti-dot" style={{ background: '#8B5CF6', top: '-10%', left: '50%', '--tx': '0px', '--ty': '-40px' } as any}></div>
          
          <div className="success-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline className="success-check" points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#132B4F', margin: '0 0 8px 0' }}>Booking Confirmed!</h2>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.95rem' }}>Your order has been placed successfully.</p>
        </div>

        {/* Booking IDs */}
        <div style={{ border: '1px solid #F1F5F9', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>
              {orderIds.length > 1 ? 'Booking ID(s)' : 'Booking ID'}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22C55E' }}>
              {orderIds.map(id => `#GB${id}`).join(', ')}
            </div>
          </div>
          <button onClick={handleCopyIds} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>

        {/* Order Summary */}
        <div style={{ border: '1px solid #F1F5F9', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1E293B' }}>Order Summary</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
            <span style={{ color: '#64748B' }}>Subtotal</span>
            <span style={{ color: '#1E293B', fontWeight: 500 }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.95rem' }}>
            <span style={{ color: '#64748B' }}>Delivery Fee</span>
            <span style={{ color: '#1E293B', fontWeight: 500 }}>₹{deliveryFee.toLocaleString('en-IN')}</span>
          </div>
          
          <div style={{ borderTop: '1px solid #F1F5F9', margin: '0 -20px 16px', borderStyle: 'dashed' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#1E293B', fontWeight: 700, fontSize: '1.05rem' }}>Total Amount</span>
            <span style={{ color: '#22C55E', fontWeight: 700, fontSize: '1.2rem' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          {/* Payment Method */}
          <div style={{ marginTop: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.9rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
            <span>Payment Method</span>
            <span style={{ fontWeight: 600, color: '#1E293B' }}>Cash on Delivery</span>
          </div>
        </div>

        {/* Info Box */}
        <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', lineHeight: 1.4 }}>
            We will notify you once your order is confirmed and out for delivery.
          </p>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {onTrackOrder && orderIds.length > 0 && (
            <button 
              onClick={() => onTrackOrder(orderIds[0])}
              style={{ width: '100%', padding: '16px', background: '#EA580C', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Track Order
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </button>
          )}

          {onBackToHome && (
            <button 
              onClick={onBackToHome}
              style={{ width: '100%', padding: '14px', background: 'transparent', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Back to Home
            </button>
          )}

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button onClick={onViewOrders} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View All Orders
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
