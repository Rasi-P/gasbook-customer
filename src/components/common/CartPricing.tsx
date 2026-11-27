import type { CartItem } from '../../types'
import type { BookingPreviewResponse } from '../../lib/auth'
import { PricingBreakdown } from './PricingBreakdown'

export function CartPricing({ items, preview, onRateTypeChange }: {
  items: CartItem[]; preview: BookingPreviewResponse | null;
  onRateTypeChange: (id: string, value: 'new' | 'refill') => void;
}) {
  return <div style={{ display: 'grid', gap: 16, minWidth: 0, marginBlock: 16 }}>
    {items.map(item => <div key={item.id} style={{ display: 'grid', gap: 8, minWidth: 0 }}>
      {item.type === 'cylinder' && <label style={{ display: 'grid', gap: 6 }}>
        <span>{item.name} {item.variant} — Rate Type</span>
        <select aria-label={`${item.name} ${item.variant} rate type`} value={item.rateType ?? 'refill'}
          style={{ width: '100%', minWidth: 0, padding: 10, borderRadius: 8 }}
          onChange={event => onRateTypeChange(item.id, event.target.value as 'new' | 'refill')}>
          <option value="refill">Refill — no deposit</option>
          <option value="new">New Cylinder — deposit + refill</option>
        </select>
      </label>}
      <PricingBreakdown value={preview?.items.find(line => line.client_item_id === item.id)} />
    </div>)}
  </div>;
}
