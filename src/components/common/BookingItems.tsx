import type { BookingItem } from '../../lib/products'
import { PricingBreakdown } from './PricingBreakdown'
import '../../styles/accessories.css'
export function BookingItems({ items }: { items?: BookingItem[] }) {
  if (!items?.length) return null
  return <div className="booking-item-list" aria-label="Booking items">{items.map(item => <section key={`${item.type}-${item.id}`}>
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}><span>{item.name} · {item.type === 'cylinder' ? 'Cylinder' : 'Accessory'}<br />{item.quantity} × ₹{Number(item.rate).toLocaleString('en-IN')}</span><strong>₹{Number(item.total_amount).toLocaleString('en-IN')}</strong></div>
    <PricingBreakdown value={item} />
  </section>)}</div>
}
