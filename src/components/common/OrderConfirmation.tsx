import { useState } from 'react'
import type { BookingRecord } from '../../lib/auth'
import type { BookingItem } from '../../lib/products'
import { formatDateTime } from '../../lib/dateTime'
import { formatMoney } from '../../lib/pricing'
import { PricingBreakdown } from './PricingBreakdown'
import '../../styles/order-confirmation.css'

export interface OrderConfirmationProps {
  orders: BookingRecord[]
  onViewOrders: () => void
  onTrackOrder?: (id: number) => void
  onBackToHome?: () => void
}

// A legacy booking is its own cylinder line. Never derive a breakdown from today's rates.
function savedItems(order: BookingRecord): BookingItem[] {
  if (order.order_items?.length) return order.order_items
  return [{ id: order.id, type: 'cylinder', name: order.cylinder_type_name,
    quantity: order.quantity, rate: order.rate,
    total_amount: order.final_amount ?? order.total_amount ?? '0',
    rate_type: order.rate_type, deposit_unit_amount: order.deposit_unit_amount == null ? null : String(order.deposit_unit_amount),
    refill_unit_amount: order.refill_unit_amount == null ? null : String(order.refill_unit_amount) }]
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
        {savedItems(order).map(item => <article className="order-confirmation__item" key={`${item.type}-${item.id}`}>
          <div className="order-confirmation__item-row">
            <div><h3>{item.name}</h3>
              <span className="order-confirmation__item-type">{item.type === 'accessory' ? 'Accessory' : item.rate_type === 'new' ? 'New cylinder' : item.rate_type === 'refill' ? 'Refill' : 'Cylinder'}</span>
              <p>Qty {item.quantity}{item.rate != null && <> × {formatMoney(Number(item.rate))} each</>}</p>
            </div>
            <strong>{formatMoney(Number(item.total_amount))}</strong>
          </div>
          {item.type === 'cylinder' && item.rate_type && item.deposit_unit_amount != null && item.refill_unit_amount != null &&
            <details className="order-confirmation__breakdown">
              <summary>{item.rate_type === 'new' ? 'Deposit & refill breakdown' : 'Refill breakdown'}</summary>
              <PricingBreakdown value={item} />
            </details>}
        </article>)}
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
