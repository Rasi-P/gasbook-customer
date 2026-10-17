import { useState } from 'react'
import type { BookingRecord } from '../../lib/auth'
import { formatDateTime } from '../../lib/dateTime'
import { formatMoney } from '../../lib/pricing'
import { OrderItemList } from './OrderItemList'
import '../../styles/order-confirmation.css'

export interface OrderConfirmationProps {
  orders: BookingRecord[]
  onViewOrders: () => void
  onTrackOrder?: (id: number) => void
  onBackToHome?: () => void
}


export function OrderConfirmation({ orders, onViewOrders, onTrackOrder, onBackToHome }: OrderConfirmationProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const subtotal = orders.reduce((sum, order) => sum + Number(order.original_amount ?? order.total_amount ?? 0), 0)
  const discount = orders.reduce((sum, order) => sum + Number(order.discount_amount ?? 0), 0)
  const total = orders.reduce((sum, order) => sum + Number(order.final_amount ?? order.total_amount ?? 0), 0)
  const cod = orders.length > 0 && orders.every(order => order.payment_method === 'COD')
  async function copyIds() {
    try {
      await navigator.clipboard.writeText(orders.map(order => `#${order.order_id}`).join(', '))
      setCopyState('copied')
    } catch { setCopyState('error') }
  }

  return <section className="order-confirmation" aria-label="Booking confirmation">
    <header className="order-confirmation__header">
      <span className="order-confirmation__check" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4 10-10" /></svg></span>
      <h1>Booking confirmed!</h1>
      <p>Your order has been submitted. We’ll notify you as it progresses.</p>
    </header>

    <div className="order-confirmation__booking">
      <div><span className="order-confirmation__eyebrow">{orders.length > 1 ? 'Booking numbers' : 'Booking number'}</span>
        {orders.map(order => <div className="order-confirmation__reference" key={order.id}>
          <strong>#{order.order_id}</strong><span>Booked {formatDateTime(order.created_at)}</span>
        </div>)}
      </div>
      <button type="button" className="order-confirmation__copy" onClick={copyIds}>{copyState === 'copied' ? 'Copied!' : orders.length > 1 ? 'Copy IDs' : 'Copy ID'}</button>
    </div>
    {copyState === 'error' && <p className="order-confirmation__copy-error" role="status">Couldn’t copy the booking number. You can select it above.</p>}

    <section className="order-confirmation__items" aria-label="Ordered items">
      <h2>Your items</h2>
      {orders.map(order => <div key={order.id}>
        {orders.length > 1 && <h3 className="order-confirmation__order-label">#{order.order_id}</h3>}
        <OrderItemList order={order} />
      </div>)}
    </section>

    <section className="order-confirmation__payment" aria-label="Payment summary">
      <h2>Payment summary</h2>
      <dl>
        <div><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
        {discount > 0 && <div className="order-confirmation__discount"><dt>Discount</dt><dd>−{formatMoney(discount)}</dd></div>}
        <div className="order-confirmation__total"><dt>Total payable{cod ? ' (COD)' : ''}</dt><dd>{formatMoney(total)}</dd></div>
      </dl>
    </section>

    <nav className="order-confirmation__actions" aria-label="Booking actions">
      {onTrackOrder && orders.length > 0 && <button type="button" className="order-confirmation__track" onClick={() => onTrackOrder(orders[0].id)}>Track delivery <span aria-hidden="true">→</span></button>}
      <div>
        {onBackToHome && <button type="button" onClick={onBackToHome}>Back to Home</button>}
        <button type="button" onClick={onViewOrders}>View All Orders</button>
      </div>
    </nav>
  </section>
}
