// Mount the real confirmation views with saved fixtures. No backend requests or writes.
import assert from 'node:assert/strict'
import { chromium, expect } from '@playwright/test'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.route('**/api/**', route => route.abort())
await page.route('**/__confirmation-preview', route => route.fulfill({ contentType: 'text/html', body: `
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div>
<script type="module">
import RefreshRuntime from '/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;
const React = (await import('/node_modules/.vite/deps/react.js')).default;
const dom = await import('/node_modules/.vite/deps/react-dom_client.js');
const createRoot = dom.createRoot || dom.default.createRoot;
const {OrderSuccessView} = await import('/src/components/views/OrderSuccessView.tsx');
const {DesktopOrderSuccessView} = await import('/src/components/desktop/DesktopOrderSuccessView.tsx');
const {confirmedBooking} = await import('/tests/orderConfirmationFixture.ts');
await import('/src/index.css'); await import('/src/styles/desktop.css');
Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: async text => {
 if (window.failCopy) throw Error('Clipboard denied'); window.copiedIds = text;
}}});
const root = createRoot(document.getElementById('root'));
window.renderConfirmation = (desktop, multiple = false) => root.render(React.createElement(desktop ? DesktopOrderSuccessView : OrderSuccessView, {
 orders: multiple ? [confirmedBooking, {...confirmedBooking, id:49, order_id:'GB49'}] : [confirmedBooking],
 onTrackOrder: id => window.trackedId = id, onBackToHome: () => window.action = 'home', onViewOrders: () => window.action = 'orders'
}));
window.renderConfirmation(false);
</script></body></html>` }))
try {
  await page.goto(`${process.env.APP_URL || 'http://localhost:5174'}/__confirmation-preview`)
  const confirmation = page.getByRole('region', { name: 'Booking confirmation' })
  await expect(confirmation).toBeVisible()
  for (const width of [320, 375, 390, 414, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(width => window.renderConfirmation(width >= 768), width)
    await expect(page.getByRole('region', { name: 'Payment summary' })).toContainText('₹4,548')
    await expect(page.locator('.order-items__item')).toHaveCount(3)
    await expect(page.locator('.pricing-components').first()).not.toBeVisible()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}`)
    const amounts = await page.locator('.order-items__item-row > strong').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().right))
    assert.ok(Math.max(...amounts) - Math.min(...amounts) < 1, `Misaligned item amounts at ${width}`)
    await page.screenshot({ path: `/private/tmp/customer-confirmation-${width}.png`, fullPage: true })
  }
  await page.setViewportSize({ width: 320, height: 900 })
  await page.getByText('Deposit & refill breakdown', { exact: true }).first().click()
  await expect(page.locator('.pricing-components').first()).toBeVisible()
  await expect(page.locator('.pricing-components').first()).toContainText('Refill discount: −₹72.00')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await page.getByRole('button', { name: 'Copy ID', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible()
  assert.equal(await page.evaluate(() => window.copiedIds), '#GB48')
  await page.evaluate(() => { window.failCopy = true })
  await page.getByRole('button', { name: 'Copied!' }).click()
  await expect(page.getByRole('status')).toContainText('Couldn’t copy')
  await page.getByRole('button', { name: 'Track delivery' }).click()
  assert.equal(await page.evaluate(() => window.trackedId), 48)
  await page.getByRole('button', { name: 'Back to Home' }).click()
  assert.equal(await page.evaluate(() => window.action), 'home')
  await page.getByRole('button', { name: 'View All Orders' }).click()
  assert.equal(await page.evaluate(() => window.action), 'orders')
  await page.evaluate(() => { window.failCopy = false; window.renderConfirmation(false, true) })
  await expect(page.getByRole('region', { name: 'Payment summary' })).toContainText('₹9,096')
  await page.getByRole('button', { name: 'Copy IDs', exact: true }).click()
  assert.equal(await page.evaluate(() => window.copiedIds), '#GB48, #GB49')
  assert.deepEqual(errors, [])
  console.log('PASS confirmation: mobile/desktop views, seven widths, aligned saved amounts, expandable pricing, copy success/failure, navigation callbacks and multiple bookings. Fixture-only; no backend writes.')
} catch (error) { console.error(errors); console.error((await page.locator('body').innerText()).slice(0, 1000)); throw error } finally { await browser.close() }
