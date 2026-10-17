// Actual customer application, with every API request mocked (read-only).
import assert from 'node:assert/strict'
import { chromium, expect } from '@playwright/test'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage(), errors = []
page.on('pageerror', error => errors.push(error.message))
const list = results => ({ count: results.length, results, next: null, previous: null })
let status = 'pending', failure = 0
const booking = { id: 48, order_id: 'GB48', history_source: 'booking', source_id: 48, can_track: true,
 cylinder_type: 1, cylinder_type_name: '5kg', cylinder_type_weight: '5', quantity: 2, rate: '660',
 created_at: '2026-10-17T09:37:00Z', original_amount: '4620', discount_amount: '72', final_amount: '4548', payment_method: 'COD',
 delivery_address: 'A long delivery address with house name and street, landmark, and aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
 order_items: [
 { id: 1, name: '5kg cylinder', type: 'cylinder', quantity: 2, rate: '660', total_amount: '1248', rate_type: 'new', deposit_unit_amount: '300', refill_unit_amount: '360' },
 { id: 2, name: '[DEMO] LPG Gas Regulator with a very long accessory name', type: 'accessory', quantity: 2, rate: '250', total_amount: '500' },
 { id: 3, name: '21kg cylinder', type: 'cylinder', quantity: 1, rate: '2800', total_amount: '2800', rate_type: 'new', deposit_unit_amount: '1200', refill_unit_amount: '1600' },
 ] }
await page.addInitScript(() => {
 localStorage.setItem('gasbook_customer_auth', JSON.stringify({ accessToken: 'mock-access', refreshToken: 'mock-refresh' }))
 localStorage.setItem('gasbook_customer_ui:1', JSON.stringify({ activeTab: 'track-order', trackingOrderId: 48, trackingSource: 'orders', cartItems: [] }))
})
await page.route('**/api/**', async route => {
 const path = new URL(route.request().url()).pathname.replace(/^.*\/api/, '')
 assert.equal(route.request().method(), 'GET', `Unexpected mutation: ${path}`)
 const record = { ...booking, status, assigned_staff_name: status === 'delivered' ? 'Delivery partner with a very long name' : null,
 assigned_staff_phone: status === 'delivered' ? '9000000002' : null, approved_at: status === 'delivered' ? '2026-10-17T10:00:00Z' : null,
 delivered_at: status === 'delivered' ? '2026-10-17T11:00:00Z' : null, rejected_at: status === 'cancelled' ? '2026-10-17T10:00:00Z' : null }
 let data = list([])
 if (path === '/auth/me/') data = { id: 1, role: 'customer', username: 'buyer', name: 'Buyer', must_change_password: false }
 else if (path === '/customers/me/') data = { id: 1, user_id: 1, name: 'Buyer', phone: '9000000000', address: 'Test Street' }
 else if (path === '/bookings/history/') data = list([record])
 else if (path === '/bookings/48/') {
   assert.equal(route.request().headers().authorization, 'Bearer mock-access')
   if (failure) return route.fulfill({ status: failure, json: { detail: 'Test unavailable' } })
   data = record
 }
 await route.fulfill({ json: data })
})
try {
 await page.goto(`${process.env.APP_URL || 'http://localhost:5174'}/#orders`)
 // Use the existing history action to open tracking without modifying any order.
 await page.getByRole('button', { name: /Track/i }).filter({ visible: true }).first().click()
 const content = page.locator('.order-tracking:visible')
 await expect(content.getByRole('region', { name: 'Booking details' })).toContainText('#GB48')
 for (const width of [320, 375, 390, 414, 768, 1024, 1440]) {
   await page.setViewportSize({ width, height: 900 })
   await expect(content.locator('.order-items__item')).toHaveCount(3)
   await expect(content.locator('.order-tracking__total')).toContainText('₹4,548')
   await expect(content.locator('.pricing-components').first()).not.toBeVisible()
   await expect(content.getByRole('region', { name: 'Delivery progress' })).toContainText('Awaiting delivery.')
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}`)
   const amounts = await content.locator('.order-items__item-row > strong').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().right))
   assert.ok(Math.max(...amounts) - Math.min(...amounts) < 1, `Misaligned amounts at ${width}`)
   await expect(content.getByRole('button', { name: 'View Receipt', exact: true })).toHaveCount(0)
   await expect(content.getByRole('button', { name: 'Download PDF', exact: true })).toHaveCount(0)
   await page.screenshot({ path: `/private/tmp/customer-tracking-${width}.png`, fullPage: true })
 }
 await page.setViewportSize({ width: 375, height: 900 })
 await content.getByText('Deposit & refill breakdown', { exact: true }).first().click()
 await expect(content.locator('.pricing-components').first()).toContainText('Refill discount: −₹72.00')
 for (const next of ['delivered', 'cancelled']) {
   status = next; await page.reload()
   await expect(content.locator('.order-tracking__status')).toHaveText(next === 'delivered' ? 'Delivered' : 'Cancelled')
   await expect(content.getByRole('button', { name: 'View Receipt', exact: true })).toHaveCount(next === 'delivered' ? 1 : 0)
   if (next === 'delivered') {
     await expect(content.getByRole('region', { name: 'Delivery progress' })).toContainText(/04:30 pm IST/i)
     await expect(content.getByRole('link', { name: 'Call', exact: true })).toHaveAttribute('href', 'tel:9000000002')
   } else {
     await expect(content.getByRole('region', { name: 'Delivery progress' }).getByText('Out for Delivery', { exact: true })).toHaveCount(0)
   }
 }
 failure = 503; await page.reload(); await expect(content.getByRole('alert')).toContainText('Unable to load tracking details.')
 failure = 0; await content.getByRole('button', { name: 'Retry' }).click(); await expect(content.locator('.order-tracking__status')).toHaveText('Cancelled')
 failure = 404; await page.reload(); await expect(content.getByRole('alert')).toContainText('Order not found.')
 await content.getByRole('button', { name: 'Back', exact: true }).click()
 await expect(page).toHaveURL(/#orders$/)
 assert.deepEqual(errors, [])
 console.log('PASS tracking: actual app with mocked APIs, seven widths, mixed items, saved totals, breakdowns, IST progress, partner call, receipt action, cancelled/delivered, 404/retry and back navigation.')
} catch(error) { console.error(errors); console.error((await page.locator('body').innerText()).slice(0, 1800)); throw error } finally { await browser.close() }
