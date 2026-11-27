import { describe, expect, it } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { mapHistoryOrder } from '../src/lib/orderHistory'
import { OrderHistoryEvents } from '../src/components/common/OrderHistoryEvents'
import { getOrderStatusMeta } from '../src/lib/orderStatus'

const sale = { id: 7, history_source: 'sale', status: 'delivered', display_reference: 'Direct Sale #7', created_at: '2026-10-13T20:45:00Z', final_amount: '900', assigned_staff_name: 'Sabco Gas' }

describe('shared mobile and desktop history', () => {
  it('keeps both sale and booking when their numeric IDs match', () => {
    const booking = {...sale, history_source: 'booking', order_id: 'GB7', assigned_staff_name: 'Ravi'}
    const rows = [sale, booking].map(mapHistoryOrder)
    expect(rows.map(r => r.id)).toEqual(['sale-7', 'booking-7'])
    expect(rows[0].statusLabel).toBe('Sale Completed')
    expect(rows[0].date).toMatch(/Recorded 14 Oct 2026.*02:15 am IST/i)
    expect(rows[1].statusLabel).toBe('Delivered')
    expect(rows[1].date).toStartWith('Booked ')
    expect(renderToStaticMarkup(<OrderHistoryEvents order={sale} />)).toContain('Sabco Gas')
    const bookingHtml = renderToStaticMarkup(<OrderHistoryEvents order={booking} />)
    expect(bookingHtml).toContain('Ravi')
    expect(bookingHtml).not.toContain('Sabco Gas')
  })
  it('keeps a cancelled sale and renders its cancellation and confirmed refund times', () => {
    const cancelled = {...sale, status: 'cancelled', cancelled_at: '2026-10-15T01:00:00Z', refunded_at: '2026-10-16T02:00:00Z'}
    const row = mapHistoryOrder(cancelled)
    expect(row.status).toBe('cancelled')
    expect(row.statusLabel).toBe('Cancelled')
    const html = renderToStaticMarkup(<OrderHistoryEvents order={cancelled} />)
    expect(html).toMatch(/Cancelled 15 Oct 2026.*06:30 am IST/i)
    expect(html).toMatch(/Refunded 16 Oct 2026.*07:30 am IST/i)
    expect(html).not.toContain('Delivered')
  })
  it('does not claim a pending refund or use updated_at for delivery', () => {
    const html = renderToStaticMarkup(<OrderHistoryEvents order={{...sale, status: 'cancelled'}} />)
    expect(html).toContain('Cancelled Time unavailable')
    expect(html).not.toContain('Refunded')
    expect(getOrderStatusMeta('delivered', {updated_at: sale.created_at}).description).toBe('Delivered on Time unavailable')
  })
})
