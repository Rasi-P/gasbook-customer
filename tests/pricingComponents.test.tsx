import { expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { PricingBreakdown } from '../src/components/common/PricingBreakdown';

const line = { rate_type: 'new' as const, deposit_unit_amount: '450.00', refill_unit_amount: '300.00', quantity: 3, total_amount: '2150.00' };
it('shows both quantity-scaled components, refill discount and exact saved total', () => {
  const html = renderToStaticMarkup(<PricingBreakdown value={line} />);
  for (const text of ['New Cylinder', 'Deposit: ₹450.00 × 3 = ₹1,350.00', 'Refill Charge: ₹300.00 × 3 = ₹900.00', 'Refill discount: −₹100.00', 'Total: ₹2,150.00']) expect(html).toContain(text);
});
it('refills display no deposit and preserve a fully discounted zero total', () => {
  const html = renderToStaticMarkup(<PricingBreakdown value={{ ...line, rate_type: 'refill', deposit_unit_amount: '0', total_amount: '0' }} />);
  expect(html).not.toContain('Deposit:');
  expect(html).toContain('Refill discount: −₹900.00');
  expect(html).toContain('Total: ₹0.00');
});
it('does not fabricate legacy or missing component breakdowns', () => {
  expect(renderToStaticMarkup(<PricingBreakdown value={{ total_amount: '777', quantity: 1 }} />)).toBe('');
  expect(renderToStaticMarkup(<PricingBreakdown value={{ ...line, deposit_unit_amount: null }} />)).toBe('');
});

import { OrderPricingBreakdown } from '../src/components/common/PricingBreakdown';
import { CartPricing } from '../src/components/common/CartPricing';
import { buildBookingPreviewPayload } from '../src/lib/pricing';
import type { CartItem } from '../src/types';
it('booking and multi-item direct-sale history keep saved pricing without combining it twice', () => {
  const sale = renderToStaticMarkup(<OrderPricingBreakdown order={{ items: [{...line, id: 1, cylinder_type_name: '5kg'}, {...line, id: 2, cylinder_type_name: '19kg', rate_type: 'refill', deposit_unit_amount: '0', total_amount: '900'}] }} />);
  expect(sale.match(/Deposit:/g)?.length).toBe(1);
  expect(sale).toContain('Total: ₹2,150.00');
  expect(sale).toContain('Total: ₹900.00');
  expect(renderToStaticMarkup(<OrderPricingBreakdown order={line} />)).toContain('Deposit:');
});
it('cart preview sends purchase type and quantity without submitting browser prices', () => {
  const item: CartItem = { id: 'cart1', cylinderTypeId: 1, name: '5kg', variant: 'Cylinder', unitPrice: 1, quantity: 3, type: 'cylinder', rateType: 'new' };
  expect(buildBookingPreviewPayload([item]).items[0]).toEqual({client_item_id:'cart1', cylinder_type:1, quantity:3, rate_type:'new'});
  expect(buildBookingPreviewPayload([{...item, rateType:undefined}]).items[0].rate_type).toBe('refill');
  const html = renderToStaticMarkup(<CartPricing items={[item]} preview={null} onRateTypeChange={() => {}} />);
  expect(html).toContain('New Cylinder — deposit + refill');
  expect(html).toContain('Refill — no deposit');
  expect(html).not.toContain('Total:');
});
