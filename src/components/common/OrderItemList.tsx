import type { BookingRecord } from '../../lib/auth'
import type { BookingItem } from '../../lib/products'
import { formatMoney } from '../../lib/pricing'
import { PricingBreakdown } from './PricingBreakdown'
import '../../styles/order-items.css'

// A legacy booking is its own cylinder line. Never derive a breakdown from today's rates.
function savedItems(order: BookingRecord): BookingItem[] {
  if (order.order_items?.length) return order.order_items
  return [{ id: order.id, type: 'cylinder', name: order.cylinder_type_name,
    quantity: order.quantity, rate: order.rate,
    total_amount: order.final_amount ?? order.total_amount ?? '0',
    rate_type: order.rate_type, deposit_unit_amount: order.deposit_unit_amount == null ? null : String(order.deposit_unit_amount),
    refill_unit_amount: order.refill_unit_amount == null ? null : String(order.refill_unit_amount) }]
}


export function OrderItemList({ order }: { order: BookingRecord }) {
  return <div className="order-items">{savedItems(order).map(item => <article className="order-items__item" key={`${item.type}-${item.id}`}>
          <div className="order-items__item-row">
            <div><h3>{item.name}</h3>
              <span className="order-items__item-type">{item.type === 'accessory' ? 'Accessory' : item.rate_type === 'new' ? 'New cylinder' : item.rate_type === 'refill' ? 'Refill' : 'Cylinder'}</span>
              <p>Qty {item.quantity}{item.rate != null && <> × {formatMoney(Number(item.rate))} each</>}</p>
            </div>
            <strong>{formatMoney(Number(item.total_amount))}</strong>
          </div>
          {item.type === 'cylinder' && item.rate_type && item.deposit_unit_amount != null && item.refill_unit_amount != null &&
            <details className="order-items__breakdown">
              <summary>{item.rate_type === 'new' ? 'Deposit & refill breakdown' : 'Refill breakdown'}</summary>
              <PricingBreakdown value={item} />
            </details>}
        </article>)}</div>
}
