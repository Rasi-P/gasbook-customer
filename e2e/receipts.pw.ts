import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { receiptFixture } from '../tests/receiptFixture'
import type { ReceiptData } from '../src/lib/receipt'

const paged = (results: unknown[]) => ({ count: results.length, next: null, previous: null, results })
const booking = { id: 32, order_id: 'GB32', history_source: 'booking', source_id: 32, status: 'delivered',
  cylinder_type: 1, cylinder_type_id: 1, cylinder_type_name: '5kg Cylinder', cylinder_type_weight: '5', quantity: 2,
  rate_type: 'new', deposit_unit_amount: '450', refill_unit_amount: '360', final_amount: '1560', original_amount: '1620', discount_amount: '60',
  created_at: receiptFixture.created_at, delivered_at: '2026-10-16T05:00:00Z', assigned_staff_name: 'Actual Partner' }

async function mockApi(page: Page, receipt: ReceiptData = receiptFixture) {
  await page.addInitScript(() => {
    localStorage.setItem('gasbook_customer_auth', JSON.stringify({ accessToken: 'mock-access', refreshToken: 'mock-refresh' }))
    window.print = () => { window.dispatchEvent(new Event('receipt-test-print')) }
  })
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace(/^.*\/api/, '')
    expect(route.request().method()).toBe('GET') // No real business mutations, even in these UI checks.
    let data: unknown = paged([])
    if (path === '/auth/me/') data = { id: 1, role: 'customer', username: 'buyer', name: 'Buyer', must_change_password: false }
    else if (path === '/customers/me/') data = { id: 1, user_id: 1, name: 'Buyer', full_name: 'Buyer', phone: '9000000000', address: 'Test Street' }
    else if (path === '/bookings/history/') data = paged([booking, { ...booking, history_source: 'sale', order_id: 'SALE-32', display_reference: 'Direct Sale #32', can_track: false, assigned_staff_name: 'Sabco Gas', items: receipt.items }])
    else if (path === '/bookings/32/') data = booking
    else if (path === '/receipts/sale/32/') {
      expect(route.request().headers().authorization).toBe('Bearer mock-access')
      data = receipt
    } else if (path === '/receipts/booking/32/') data = { ...receiptFixture, source: 'booking', transaction_type: 'Booking', number: 'GB32', status: 'Delivered', delivery_partner: 'Actual Partner', completed_at: booking.delivered_at }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) })
  })
}

async function parsePdf(bytes: Buffer) {
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
  const task = getDocument({ data: new Uint8Array(bytes) })
  const pdf = await task.promise
  let text = ''
  const count = pdf.numPages
  for (let i = 1; i <= count; i++) text += (await (await pdf.getPage(i)).getTextContent()).items.map(item => 'str' in item ? item.str : '').join(' ')
  await task.destroy()
  return { text, count }
}

for (const width of [320, 390, 1280]) {
  test(`sale preview, download, print and booking details at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await mockApi(page)
    await page.goto('/#orders')
    const actions = page.getByRole('button', { name: 'View Receipt', exact: true }).filter({ visible: true })
    await expect(actions).toHaveCount(2)
    await actions.nth(1).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: 'Print', exact: true })).toBeEnabled({ timeout: 30000 })
    await expect(dialog).toContainText('Direct Sale · SALE-32')
    await expect(dialog).toContainText('Deposit: ₹450.00 × 2 = ₹900.00')
    await expect(dialog).toContainText(/01:40 am IST/i)
    const size = await dialog.evaluate(node => ({ width: node.clientWidth, scroll: node.scrollWidth, page: document.documentElement.scrollWidth, viewport: innerWidth }))
    expect(size.scroll).toBeLessThanOrEqual(size.width)
    expect(size.page).toBeLessThanOrEqual(size.viewport)
    await page.screenshot({ path: testInfo.outputPath(`receipt-${width}.png`), fullPage: true })
    const downloadEvent = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Download PDF', exact: true }).click()
    const download = await downloadEvent
    expect(download.suggestedFilename()).toBe('Sabco-Gas-Receipt-SALE-32.pdf')
    const pdf = await parsePdf(await readFile((await download.path())!))
    expect(pdf.text).toContain('₹1,560.00')
    expect(pdf.count).toBe(await dialog.locator('.receipt-page').count())
    await page.evaluate(() => { document.body.dataset.printed = 'no'; window.addEventListener('receipt-test-print', () => { document.body.dataset.printed = 'yes' }, { once: true }) })
    await dialog.getByRole('button', { name: 'Print', exact: true }).click()
    await expect(page.locator('body')).toHaveAttribute('data-printed', 'yes')
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('#root')).toBeHidden()
    await expect(dialog.locator('.receipt-toolbar')).toBeHidden()
    const printed = await parsePdf(await page.pdf({ preferCSSPageSize: true }))
    expect(printed.count).toBe(pdf.count)
    await page.emulateMedia({ media: 'screen' })
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(actions.nth(1)).toBeFocused()
    const bookingDownloadEvent = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download PDF', exact: true }).filter({ visible: true }).first().click()
    const bookingDownload = await bookingDownloadEvent
    expect(bookingDownload.suggestedFilename()).toBe('Sabco-Gas-Receipt-GB32.pdf')
    expect((await parsePdf(await readFile((await bookingDownload.path())!))).text).toContain('Booking · GB32')
    await page.getByRole('button', { name: width === 1280 ? 'Receipt & Details' : 'View Details', exact: true }).filter({ visible: true }).first().click()
    await expect(page.getByRole('button', { name: 'Download PDF', exact: true }).filter({ visible: true })).toHaveCount(0)
    await page.getByRole('button', { name: 'View Receipt', exact: true }).filter({ visible: true }).click()
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Print', exact: true })).toBeEnabled({ timeout: 30000 })
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Download PDF', exact: true })).toBeEnabled()
    await expect(page.getByRole('dialog')).toContainText('Booking · GB32')
    await expect(page.getByRole('dialog')).toContainText('Delivery partner: Actual Partner')
    expect(errors).toEqual([])
  })
}

test('long multi-item receipt preserves PDF pagination when previewed and printed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockApi(page, { ...receiptFixture, customer: { name: 'Long Customer Name '.repeat(10), address: 'Building and locality, town and district. '.repeat(20) },
    subtotal: '56700.00', discount_amount: '2100.00', total_amount: '54600.00', balance_due: '54100.00',
    items: Array.from({ length: 35 }, (_, i) => ({ ...receiptFixture.items[0], description: `Cylinder item ${i + 1}` })) })
  await page.goto('/#orders')
  await page.getByRole('button', { name: 'View Receipt', exact: true }).filter({ visible: true }).nth(1).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('button', { name: 'Print', exact: true })).toBeEnabled({ timeout: 30000 })
  const count = await dialog.locator('.receipt-page').count()
  expect(count).toBeGreaterThan(3)
  await expect(dialog).toContainText('Cylinder item 35')
  await dialog.getByRole('button', { name: 'Zoom in' }).click()
  await expect(dialog.getByRole('button', { name: 'Fit width' })).toBeVisible()
  const printed = await parsePdf(await page.pdf({ preferCSSPageSize: true }))
  expect(printed.count).toBe(count)
})

test('denied receipt access displays an error and no private receipt content', async ({ page }) => {
  await mockApi(page)
  await page.route('**/api/receipts/**', route => route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'Receipt not found.' }) }))
  await page.goto('/#orders')
  await page.getByRole('button', { name: 'View Receipt', exact: true }).filter({ visible: true }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('alert')).toContainText('Receipt not found.')
  await expect(dialog.getByRole('button', { name: 'Download PDF', exact: true })).toBeDisabled()
  await expect(dialog.locator('.receipt-page')).toHaveCount(0)
})
