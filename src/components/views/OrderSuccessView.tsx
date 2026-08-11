import { ScreenFrame } from '../common/ScreenFrame'
import { ShieldIcon } from '../common/Icons'

interface OrderSuccessViewProps {
  orderId: number
  onViewOrders: () => void
}

export function OrderSuccessView({ orderId, onViewOrders }: OrderSuccessViewProps) {
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
          <h2>Order Placed Successfully!</h2>
          <p>Order #GB{orderId} has been placed via Cash on Delivery.</p>
          <span style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, display: 'block', marginTop: '8px' }}>
            Admin has been notified for delivery assignment.
          </span>
        </header>

        <button
          type="button"
          className="primary-button"
          onClick={onViewOrders}
        >
          VIEW MY ORDERS
        </button>
      </div>
    </ScreenFrame>
  )
}
