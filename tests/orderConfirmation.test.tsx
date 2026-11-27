import { expect, it } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { OrderSuccessView } from '../src/components/views/OrderSuccessView'
import { DesktopOrderSuccessView } from '../src/components/desktop/DesktopOrderSuccessView'
import { confirmedBooking } from './orderConfirmationFixture'
const callbacks = { onViewOrders: () => {}, onTrackOrder: () => {}, onBackToHome: () => {} }
it('shares the same saved mixed-order summary on mobile and desktop', () => {
  const mobile = renderToStaticMarkup(<OrderSuccessView orders={[confirmedBooking]} {...callbacks} />)
  expect(renderToStaticMarkup(<DesktopOrderSuccessView orders={[confirmedBooking]} {...callbacks} />)).toBe(mobile)
  for (const text of ['GB48', '5kg cylinder', '21kg cylinder', 'Gas Regulator', '₹4,620', '₹4,548', '₹1,248', '₹500', '−₹72', 'Total payable (COD)']) expect(mobile).toContain(text)
  expect(mobile).toMatch(/03:07 pm IST/i)
  expect(mobile.match(/<article /g)).toHaveLength(3)
  expect(mobile.match(/<details /g)).toHaveLength(2)
  expect(mobile).not.toContain('<details open')
  expect(mobile.indexOf('Your items')).toBeLessThan(mobile.indexOf('Payment summary'))
})
it('preserves zero totals and omits invented legacy price components', () => {
  const html = renderToStaticMarkup(<OrderSuccessView orders={[{ ...confirmedBooking, order_items: undefined, original_amount: '1320', discount_amount: '1320', final_amount: '0', total_amount: '1320', payment_method: undefined }]} {...callbacks} />)
  expect(html).not.toContain('<details')
  expect(html).not.toContain('(COD)')
  expect(html).toContain('<dd>₹0</dd>')
  expect(html).toContain('Qty 2')
})
it('identifies separate bookings and keeps optional actions optional', () => {
  const html = renderToStaticMarkup(<OrderSuccessView orders={[confirmedBooking, { ...confirmedBooking, id: 49, order_id: 'GB49' }]} onViewOrders={() => {}} />)
  expect(html).toContain('Booking numbers')
  expect(html).toContain('GB49')
  expect(html).toContain('₹9,096')
  expect(html).not.toContain('Track delivery')
  expect(html).not.toContain('Back to Home')
})
