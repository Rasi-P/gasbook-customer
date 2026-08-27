import { useState } from 'react'
import type { BookingRecord } from '../../lib/auth'
import { formatMoney } from '../../lib/pricing'

interface DesktopOrderSuccessViewProps {
  orders: BookingRecord[]
  onViewOrders: () => void
  onTrackOrder?: (id: number) => void
  onBackToHome?: () => void
}

export function DesktopOrderSuccessView({
  orders,
  onViewOrders,
  onTrackOrder,
  onBackToHome,
}: DesktopOrderSuccessViewProps) {
  const [copied, setCopied] = useState(false)
  const subtotal = orders.reduce((sum, order) => sum + Number(order.original_amount || order.total_amount || 0), 0)
  const discount = orders.reduce((sum, order) => sum + Number(order.discount_amount || 0), 0)
  const total = orders.reduce((sum, order) => sum + Number(order.final_amount || order.total_amount || 0), 0)

  const handleCopyIds = () => {
    const text = orders.map((o) => `#${o.order_id}`).join(', ')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="desktop-container" style={{ maxWidth: '680px', margin: '40px auto' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '28px',
          padding: '48px 40px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          textAlign: 'center',
        }}
      >
        {/* Animated Checkmark Circle */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#22c55e',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 800, color: '#1e293b' }}>
          Booking Confirmed Successfully!
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: '15px', color: '#64748b' }}>
          Your LPG cylinder request has been submitted and is being processed for delivery.
        </p>

        {/* Order ID Box */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {orders.length > 1 ? 'Booking Identifiers' : 'Booking Number'}
            </span>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#1052be', marginTop: '2px' }}>
              {orders.map((o) => `#${o.order_id}`).join(', ')}
            </div>
          </div>

          <button
            onClick={handleCopyIds}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>

        {/* Summary Breakdown */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '28px',
            border: '1px solid #f1f5f9',
            textAlign: 'left',
          }}
        >
          <h4 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
            Payment Summary
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            <span>Original Amount</span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatMoney(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
              <span>Discount</span>
              <span style={{ fontWeight: 600, color: '#16a34a' }}>- {formatMoney(discount)}</span>
            </div>
          )}
          <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0 12px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 800 }}>
            <span style={{ color: '#1e293b' }}>Total Payable (COD)</span>
            <span style={{ color: '#1052be' }}>{formatMoney(total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {onTrackOrder && orders.length > 0 && (
            <button
              onClick={() => onTrackOrder(orders[0].id)}
              style={{
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
              }}
            >
              <span>Track Live Delivery Progress</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  color: '#1052be',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back to Home
              </button>
            )}

            <button
              onClick={onViewOrders}
              style={{
                flex: 1,
                background: '#f1f5f9',
                color: '#334155',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
