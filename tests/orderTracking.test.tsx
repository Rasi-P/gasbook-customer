import { expect, it } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { TrackingProgress } from '../src/components/common/OrderTracking'
import { confirmedBooking } from './orderConfirmationFixture'
it('pending tracking does not claim dispatch or completion', () => {
  const html = renderToStaticMarkup(<TrackingProgress booking={confirmedBooking} />)
  expect(html.match(/class="is-done"/g)).toHaveLength(1)
  expect(html).toContain('Awaiting dispatch.')
  expect(html).toContain('Awaiting delivery.')
  expect(html).not.toContain('Time unavailable')
})
it('accepted and reassigned orders retain the existing progress rules', () => {
  const accepted = renderToStaticMarkup(<TrackingProgress booking={{ ...confirmedBooking, status: 'accepted', assigned_staff_name: 'Partner' }} />)
  expect(accepted.match(/class="is-done"/g)).toHaveLength(2)
  expect(accepted).toContain('Accepted by Partner')
  expect(accepted).toContain('Awaiting dispatch.')
  const pending = renderToStaticMarkup(<TrackingProgress booking={{ ...confirmedBooking, needs_reassignment: true }} />)
  expect(pending).toContain('Reassigning your delivery partner')
})
it('delivered and rejected timelines use saved event timestamps only', () => {
  const delivered = renderToStaticMarkup(<TrackingProgress booking={{ ...confirmedBooking, status: 'delivered', approved_at: '2026-10-17T10:00:00Z', delivered_at: '2026-10-17T11:00:00Z' }} />)
  expect(delivered.match(/class="is-done"/g)).toHaveLength(4)
  expect(delivered).toMatch(/04:30 pm IST/i)
  const rejected = renderToStaticMarkup(<TrackingProgress booking={{ ...confirmedBooking, status: 'rejected', rejected_at: '2026-10-17T10:00:00Z', rejection_reason: 'Outside delivery area' }} />)
  expect(rejected).toContain('Order Rejected')
  expect(rejected).toContain('Outside delivery area')
  expect(rejected).toMatch(/03:30 pm IST/i)
  expect(rejected).not.toContain('Out for Delivery')
})
