import { expect, it } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AccessoryCard, CatalogTabs } from '../src/components/common/AccessoryCatalog'
import { BookingItems } from '../src/components/common/BookingItems'
import { CartPricing } from '../src/components/common/CartPricing'
import { buildBookingPreviewPayload } from '../src/lib/pricing'
import type { CartItem } from '../src/types'
const accessory: CartItem = { id: 'p1', productId: 42, type: 'accessory', name: 'Regulator', variant: 'Accessory', quantity: 2, unitPrice: 1 }
it('sends accessory identity and quantity without client prices or cylinder selectors', () => {
  const payload = buildBookingPreviewPayload([accessory])
  expect(payload.items).toEqual([{ client_item_id: 'p1', product: 42, quantity: 2 }])
  const html = renderToStaticMarkup(<CartPricing items={[accessory]} preview={null} onRateTypeChange={() => {}} />)
  expect(html).not.toContain('<select')
})
it('counts cylinders and accessories dynamically in the same catalog tabs', () => {
  const html = renderToStaticMarkup(<CatalogTabs value="accessory" onChange={() => {}} cylinders={5} accessories={3} />)
  expect(html).toContain('All Products (8)'); expect(html).toContain('Gas Cylinders (5)'); expect(html).toContain('Accessories (3)')
})
it('hides unavailable accessories', () => {
  const html = renderToStaticMarkup(<AccessoryCard product={{ id: 1, name: 'Regulator', category: 'Accessory', description: 'Gas regulator', selling_price: '250', available: false, image: '/media/regulator.png' }} onAdd={() => {}} />)
  expect(html).toBe('')
})
it('shows available products without a quantity selector or stock counts', () => {
  const html = renderToStaticMarkup(<AccessoryCard product={{ id: 1, name: 'Regulator', category: 'Accessory', description: 'Gas regulator', selling_price: '250', available: true, image: '/media/regulator.png' }} onAdd={() => {}} />)
  expect(html).toContain('/media/regulator.png'); expect(html).toContain('₹250'); expect(html).toContain('Add to cart')
  expect(html).not.toContain('<input'); expect(html).not.toContain('Quantity'); expect(html).not.toContain('in stock')
})
it('renders saved mixed booking lines including quantities and totals', () => {
  const html = renderToStaticMarkup(<BookingItems items={[{ id: 1, name: '5kg', type: 'cylinder', quantity: 1, rate: '810', total_amount: '774', rate_type: 'new', deposit_unit_amount: '450', refill_unit_amount: '360' }, { id: 2, name: 'Regulator', type: 'accessory', quantity: 2, rate: '250', total_amount: '500' }]} />)
  for (const value of ['5kg', 'Regulator', 'Cylinder', 'Accessory', 'Deposit', 'Refill', '774', '500']) expect(html).toContain(value)
})
