import { test, expect } from '@playwright/test'

test('account outstanding stays independent of history pages and filters on mobile and desktop', async ({ page }, testInfo) => {
  let balance = '1720.50', unavailable = false
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => localStorage.setItem('gasbook_customer_auth', JSON.stringify({ accessToken: 'mock', refreshToken: 'mock' })))
  await page.route('**/api/**', async route => {
    expect(route.request().method()).toBe('GET')
    const url = new URL(route.request().url()), path = url.pathname.replace(/^.*\/api/, '')
    let data: unknown = { count: 0, results: [] }
    if (path === '/auth/me/') data = { id: 1, role: 'customer', name: 'Buyer', username: 'buyer', must_change_password: false }
    if (path === '/customers/me/') {
      if (unavailable) return route.fulfill({ status: 503, json: { detail: 'Temporarily unavailable' } })
      data = { id: 1, user_id: 1, name: 'Buyer', pending_amount: balance }
    }
    if (path === '/bookings/history/') data = { count: 11, results: [{
      id: url.searchParams.get('page') === '2' ? 50 : 49, order_id: url.searchParams.get('page') === '2' ? 'GB50' : 'GB49',
      history_source: 'booking', status: 'delivered', cylinder_type_id: 1, cylinder_type_name: '12kg', cylinder_type_weight: '12', quantity: 1,
      rate: '820', final_amount: '820', created_at: '2026-10-17T10:06:00Z', delivered_at: '2026-10-17T11:19:00Z',
      payment_summary: { sale_id: 49, status: 'PARTIAL', total_amount: '820', paid_amount: '100', balance_due: '720', payments: [] },
    }] }
    await route.fulfill({ json: data })
  })
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/#orders')
  const summary = page.getByRole('region', { name: 'Total outstanding' }).filter({ visible: true })
  await expect(summary).toContainText('₹1,720.50')
  for (const width of [320, 375, 390, 402, 414, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(summary).toContainText('₹1,720.50')
    await expect(summary).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(summary.locator('strong')).toHaveCSS('font-size', '14px')
    const bar = page.locator('.order-filter-bar').filter({ visible: true })
    await expect(bar).toContainText('Completed')
    if (width >= 1024) {
      await expect(bar).toContainText('Outstanding')
      const tabsBox = await bar.locator('.desktop-filter-pills').boundingBox()
      const amountBox = await summary.boundingBox()
      expect(amountBox!.x).toBeGreaterThanOrEqual(tabsBox!.x + tabsBox!.width)
      expect(Math.abs(amountBox!.y + amountBox!.height / 2 - tabsBox!.y - tabsBox!.height / 2)).toBeLessThan(2)
    } else {
      await expect(bar).not.toContainText('Outstanding')
      const header = page.locator('.orders-header--balance')
      await expect(header).toContainText('₹1,720.50')
      const titleBox = (await header.locator('h1').boundingBox())!, amountBox = (await summary.boundingBox())!
      expect(amountBox.x).toBeGreaterThanOrEqual(titleBox.x + titleBox.width)
      expect(Math.abs(amountBox.y + amountBox.height / 2 - titleBox.y - titleBox.height / 2)).toBeLessThan(2)
    }
    const due = page.locator('.payment-summary--due summary').filter({ visible: true })
    await expect(due).toContainText('₹720.00 outstanding')
    await expect(due).toHaveCSS('color', 'rgb(185, 28, 28)')
    expect(await summary.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`outstanding-${width}.png`), fullPage: true })
  }
  await page.getByRole('button', { name: 'Next', exact: true }).filter({ visible: true }).click()
  await expect(page.getByText('Order #GB50', { exact: true }).filter({ visible: true })).toBeVisible()
  await expect(summary).toContainText('₹1,720.50')
  await page.getByRole('button', { name: 'Completed', exact: true }).filter({ visible: true }).click()
  await expect(summary).toContainText('₹1,720.50')
  unavailable = true
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(summary).toContainText('Balance unavailable')
  await expect(summary).not.toContainText('₹0')
  unavailable = false
  balance = '-100.00'
  await summary.getByRole('button', { name: 'Retry' }).click()
  await expect(summary).toContainText('₹0.00')
  await expect(summary).not.toHaveClass(/outstanding-balance--due/)
  expect(errors).toEqual([])
})
