import { beforeAll, expect, it } from 'bun:test'
import { resolve } from 'node:path'
import { Font, renderToBuffer } from '@react-pdf/renderer'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReceiptDocument } from '../src/components/receipt/ReceiptDocument'
import { ReceiptActions } from '../src/components/receipt/ReceiptActions'
import { receiptFilename, receiptTarget } from '../src/lib/receipt'
import type { ReceiptData } from '../src/lib/receipt'
import { receiptFixture } from './receiptFixture'

beforeAll(() => {
  Font.register({ family: 'ReceiptNoto', fonts: [
    { src: resolve('public/fonts/NotoSans-Regular.ttf') },
    { src: resolve('public/fonts/NotoSans-Bold.ttf'), fontWeight: 700 },
  ] })
})

async function parse(receipt: ReceiptData) {
  const buffer = await renderToBuffer(<ReceiptDocument receipt={receipt} />)
  expect(buffer.subarray(0, 5).toString()).toBe('%PDF-')
  const task = getDocument({ data: new Uint8Array(buffer) })
  const document = await task.promise
  const pages: string[] = []
  for (let i = 1; i <= document.numPages; i++) {
    const page = await document.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    expect(viewport.width).toBeCloseTo(595.28, 1)
    expect(viewport.height).toBeCloseTo(841.89, 1)
    const items = (await page.getTextContent()).items.filter(item => 'str' in item)
    for (const item of items) {
      // Every drawn text fragment stays inside A4 with room for the page footer.
      expect(item.transform[4]).toBeGreaterThanOrEqual(39)
      expect(item.transform[4] + item.width).toBeLessThanOrEqual(557)
      expect(item.transform[5]).toBeGreaterThan(15)
      expect(item.transform[5]).toBeLessThan(820)
    }
    pages.push(items.map(item => item.str).join(' ').replace(/\s+/g, ' '))
  }
  await task.destroy()
  return pages
}

it('generates a real A4 PDF with saved components, discount, partial payment and IST timestamp', async () => {
  const pages = await parse(receiptFixture)
  expect(pages).toHaveLength(1)
  const text = pages.join(' ')
  for (const expected of ['Sabco Gas', 'SALE-32', 'Direct Sale', 'Jéan Customer', '16 Oct 2026',
    'Deposit: ₹450.00 × 2 = ₹900.00', 'Refill charge: ₹360.00 × 2 = ₹720.00',
    'Discount', '₹-60.00', '₹1,560.00', 'Amount paid', '₹500.00', 'Outstanding balance', '₹1,060.00', 'GPay']) {
    expect(text).toContain(expected)
  }
  expect(text).toMatch(/01:40 am IST/i)
})

it('uses the same template for delivered bookings with their delivery partner', async () => {
  const pages = await parse({ ...receiptFixture, number: 'GB32', source: 'booking', transaction_type: 'Booking',
    status: 'Delivered', delivery_partner: 'Actual Delivery Partner', completed_at: '2026-10-16T05:00:00Z' })
  const text = pages.join(' ')
  expect(text).toContain('Booking · GB32')
  expect(text).toContain('Delivery partner: Actual Delivery Partner')
  expect(text).toMatch(/10:30 am IST/i)
  expect(text).not.toContain('Direct Sale')
})

it('omits unknown optional details and legacy components without repricing historical totals', async () => {
  const text = (await parse({ ...receiptFixture, customer: { name: 'Legacy Buyer' },
    paid_amount: null, balance_due: null, payment_method: null, discount_amount: '0.00',
    items: [{ ...receiptFixture.items[0], rate_type: null, deposit_unit_amount: null, refill_unit_amount: null,
      unit_amount: '777.00', unit_label: 'Recorded unit rate', total_amount: '777.00' }],
    subtotal: '777.00', total_amount: '777.00' })).join(' ')
  expect(text).toContain('₹777.00')
  for (const absent of ['Deposit:', 'Refill charge:', 'Delivery partner:', 'Delivered:', 'Discount', 'Amount paid', 'Outstanding balance', 'undefined', 'null']) {
    expect(text).not.toContain(absent)
  }
})

it('shows cancelled/refunded status and original amounts without claiming an active payable', async () => {
  const text = (await parse({ ...receiptFixture, cancelled: true, status: 'Cancelled', payment_status: 'Refunded',
    cancelled_at: '2026-10-16T04:00:00Z', refunded_at: '2026-10-16T06:00:00Z',
    refund_amount: '500.00', balance_due: '0.00' })).join(' ')
  for (const expected of ['Cancelled · Refunded', 'Original transaction total', 'Originally collected', 'Refund paid', 'Refund confirmed:', '₹0.00']) expect(text).toContain(expected)
  expect(text).toMatch(/11:30 am IST/i)
  expect(text).not.toContain('Total payable')
})

it('refill-only receipts omit the deposit and preserve a fully discounted zero payable', async () => {
  const text = (await parse({ ...receiptFixture, items: [{ ...receiptFixture.items[0], rate_type: 'refill',
    deposit_unit_amount: '0.00', unit_amount: '360.00', total_amount: '0.00' }],
    subtotal: '720.00', discount_amount: '720.00', total_amount: '0.00', paid_amount: '0.00', balance_due: '0.00', payment_status: 'Paid' })).join(' ')
  expect(text).not.toContain('Deposit:')
  expect(text).toContain('Refill charge: ₹360.00 × 2 = ₹720.00')
  expect(text).toContain('Total payable ₹0.00')
})

it('paginates long addresses and many items without clipping text or dropping totals', async () => {
  const items = Array.from({ length: 45 }, (_, i) => ({ ...receiptFixture.items[0], description: `Cylinder item ${i + 1} with a long descriptive cylinder name` }))
  const pages = await parse({ ...receiptFixture, customer: { name: 'Very Long Customer Name '.repeat(8), address: 'Long address with building, floor and locality information. '.repeat(15) }, items,
    subtotal: '72900.00', discount_amount: '2700.00', total_amount: '70200.00', balance_due: '69700.00' })
  expect(pages.length).toBeGreaterThan(3)
  const text = pages.join(' ')
  for (let i = 1; i <= 45; i++) expect(text).toContain(`Cylinder item ${i} with`)
  expect(pages.at(-1)).toContain('Outstanding balance')
  for (let i = 0; i < pages.length; i++) expect(pages[i]).toContain(`Page ${i + 1} of ${pages.length}`)
}, 15000)

it('keeps booking/sale IDs distinct and creates a safe meaningful download filename', () => {
  expect(receiptTarget({ id: 32 })).toEqual({ source: 'booking', id: 32 })
  expect(receiptTarget({ id: 32, history_source: 'sale', source_id: 33 })).toEqual({ source: 'sale', id: 33 })
  expect(receiptFilename('SALE-32')).toBe('Sabco-Gas-Receipt-SALE-32.pdf')
  expect(receiptFilename('../GB/32')).not.toContain('/')
})

it('exposes both receipt actions for any order type', () => {
  for (const source of ['sale', 'booking']) {
    const html = renderToStaticMarkup(<ReceiptActions order={{ id: 32, history_source: source }} />)
    expect(html).toContain('View Receipt')
    expect(html).toContain('Download PDF')
  }
})
