import { test, expect } from '@playwright/test'

const reason = `Unable to fulfil this request.\n${'LongUnbrokenReason'.repeat(240)}\nPlease contact the distributor.`

for (const width of [320, 375, 390, 414, 768, 1024, 1440]) {
  test(`rejection reason wraps and actions remain reachable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 700 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(() => {
      localStorage.setItem('gasbook_customer_auth', JSON.stringify({ accessToken: 'mock', refreshToken: 'mock' }))
    })
    await page.route('**/api/**', async route => {
      expect(route.request().method()).toBe('GET')
      const path = new URL(route.request().url()).pathname.replace(/^.*\/api/, '')
      let data: unknown = { count: 0, results: [] }
      if (path === '/auth/me/') data = { id: 1, role: 'customer', username: 'buyer', name: 'Buyer', must_change_password: false }
      if (path === '/customers/me/') data = { id: 1, user_id: 1, name: 'Buyer', phone: '9000000000' }
      if (path === '/bookings/history/') data = { count: 1, results: [{
        id: 48, order_id: 'GB48', history_source: 'booking', status: 'rejected',
        cylinder_type_id: 1, cylinder_type_name: '5kg Cylinder', cylinder_type_weight: '5', quantity: 2,
        rate: '360', final_amount: '648', original_amount: '720', discount_amount: '72',
        created_at: '2026-10-17T09:37:00Z', rejected_at: '2026-10-17T10:27:00Z', rejection_reason: reason,
      }] }
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) })
    })
    await page.goto('/#orders')
    await page.getByRole('button', { name: /View Details|View Rejection Reason/ }).filter({ visible: true }).first().click()
    const dialog = page.getByRole('dialog', { name: 'Rejection Details' }).filter({ visible: true })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(reason)
    // Wait for the existing entrance animation before measuring viewport bounds.
    await page.waitForTimeout(350)
    const dimensions = await dialog.evaluate(node => {
      const box = node.getBoundingClientRect()
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom,
        width: node.clientWidth, scrollWidth: node.scrollWidth, height: node.clientHeight,
        scrollHeight: node.scrollHeight, viewportWidth: innerWidth, viewportHeight: innerHeight }
    })
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width)
    expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.height)
    expect(dimensions.left).toBeGreaterThanOrEqual(0)
    expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewportWidth)
    expect(dimensions.top).toBeGreaterThanOrEqual(0)
    expect(dimensions.bottom).toBeLessThanOrEqual(dimensions.viewportHeight)
    await page.screenshot({ path: testInfo.outputPath(`rejection-${width}.png`) })
    await dialog.getByRole('button', { name: 'Book Again', exact: true }).scrollIntoViewIfNeeded()
    await expect(dialog.getByRole('button', { name: 'Book Again', exact: true })).toBeInViewport()
    await dialog.getByRole('button', { name: 'Close rejection details' }).click()
    await expect(dialog).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
