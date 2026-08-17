import { ScreenFrame } from '../common/ScreenFrame'
import { ShieldIcon } from '../common/Icons'

interface OrderSuccessViewProps {
  orderId: number
  onViewOrders: () => void
  onBackToHome: () => void
}

export function OrderSuccessView({ orderId, onViewOrders, onBackToHome }: OrderSuccessViewProps) {
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
          <h2>Booking Confirmed!</h2>
          <p>Order #GB{orderId} has been placed via Cash on Delivery.</p>
          <span style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, display: 'block', marginTop: '8px' }}>
            Admin has been notified for delivery assignment.
          </span>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '24px' }}>
          <button
            type="button"
            className="primary-button"
            onClick={onViewOrders}
            style={{ width: '100%' }}
          >
            TRACK ORDER
          </button>
          
          <button
            type="button"
            onClick={onBackToHome}
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '2px solid #e2e8f0', 
              background: 'transparent',
              color: '#64748b',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            BACK TO HOME
          </button>
        </div>
      </div>
    </ScreenFrame>
  )
}
