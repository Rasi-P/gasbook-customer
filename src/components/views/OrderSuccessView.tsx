import { ScreenFrame } from '../common/ScreenFrame'
import { ShieldIcon } from '../common/Icons'

interface OrderSuccessViewProps {
  orderIds: number[]
  onViewOrders: () => void
  onTrackOrder?: (id: number) => void
  onBackToHome?: () => void
}

export function OrderSuccessView({ orderIds, onViewOrders, onTrackOrder, onBackToHome }: OrderSuccessViewProps) {
  return (
    <ScreenFrame screen="password-success">
      <div className="screen-body screen-body--success" style={{ padding: '24px' }}>
        <div className="success-art" style={{ marginBottom: '24px' }}>
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
          <h2>Booking Confirmed!</h2>
          <p>Your order has been placed successfully.</p>
          <div className="order-ids-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', margin: '24px 0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
              {orderIds.length > 1 ? 'Booking IDs' : 'Booking ID'}
            </span>
            <strong style={{ fontSize: '1.25rem', color: '#1e293b' }}>
              {orderIds.map(id => `#GB${id}`).join(', ')}
            </strong>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {onTrackOrder && (
            <button
              type="button"
              className="primary-button"
              onClick={() => onTrackOrder(orderIds[orderIds.length - 1])}
              style={{ background: '#f97316' }}
            >
              TRACK ORDER
            </button>
          )}
          {onBackToHome && (
            <button
              type="button"
              className="secondary-button"
              onClick={onBackToHome}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'transparent', fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}
            >
              BACK TO HOME
            </button>
          )}
          <button
            type="button"
            className="secondary-button"
            onClick={onViewOrders}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'transparent', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
          >
            VIEW ALL ORDERS
          </button>
        </div>
      </div>
    </ScreenFrame>
  )
}
