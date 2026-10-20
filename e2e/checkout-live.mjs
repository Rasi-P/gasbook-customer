import { chromium, expect } from '@playwright/test'
const live = process.env.INVENTORY_LIVE_URL
if (!live?.startsWith('http://localhost:') && !live?.startsWith('http://127.0.0.1:')) throw new Error('Disposable live server required')
const user = JSON.parse(process.env.CHECKOUT_FIXTURE)
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 900 } })
const page = await context.newPage()
page.setDefaultTimeout(15000)
const visible = locator => locator.filter({ visible: true })
let failPage = true, loseResponse = true
const posts = [], statuses = []
try {
  await context.addInitScript(user => localStorage.setItem('gasbook_customer_auth', JSON.stringify({ accessToken: user.access, refreshToken: user.refresh })), user)
  await context.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/cylinder-types/' && url.searchParams.get('page') === '2' && failPage) {
      return route.fulfill({ status: 503, json: { detail: 'Synthetic catalog interruption' } })
    }
    if (url.pathname === '/api/cylinder-types/') {
      // Preserve the public API Host when forwarding to the private live server,
      // like a reverse proxy. Django's absolute next URL must match that origin.
      const response = await route.fetch({ url: live + url.pathname + url.search,
        headers: { ...route.request().headers(), host: url.host } })
      return route.fulfill({ response })
    }
    if (url.pathname === '/api/bookings/checkout/' && route.request().method() === 'POST') {
      posts.push(route.request().postDataJSON())
      const response = await route.fetch({ url: live + url.pathname + url.search })
      statuses.push(response.status())
      expect([200, 201]).toContain(response.status())
      if (loseResponse) { loseResponse = false; return route.abort('connectionfailed') }
      return route.fulfill({ response })
    }
    return route.continue({ url: live + url.pathname + url.search })
  })
  await page.goto('http://127.0.0.1:5192/#explore')
  await expect(visible(page.getByText('Synthetic catalog interruption'))).toBeVisible()
  await expect(visible(page.locator('.cylinder-card'))).toHaveCount(0)
  failPage = false
  await visible(page.getByRole('button', { name: 'Retry', exact: true })).click()
  await expect(visible(page.locator('.cylinder-card'))).toHaveCount(5)
  await expect(visible(page.locator('.cylinder-card')).last()).toContainText('15 KG Cylinder')
  await page.setViewportSize({ width: 1280, height: 900 })
  // Each responsive catalog retains its existing independent loading/error state.
  await visible(page.getByRole('button', { name: 'Retry', exact: true })).click()
  await expect(visible(page.locator('.cylinder-card'))).toHaveCount(5)
  await visible(page.getByRole('button', { name: 'Home', exact: true })).click()
  await expect(page.locator('.desktop-cylinder-card')).toHaveCount(4) // intentional presentation limit
  await visible(page.getByRole('button', { name: 'Explore Cylinders', exact: true })).first().click()
  await page.reload()
  await page.setViewportSize({ width: 390, height: 900 })
  await visible(page.locator('.cylinder-card').filter({ hasText: '11 KG Cylinder' })).getByRole('button', { name: /^Book(?: Now)?$/ }).click()
  await visible(page.getByRole('button', { name: 'Explore', exact: true })).click()
  await visible(page.locator('.cylinder-card').filter({ hasText: '12 KG Cylinder' })).getByRole('button', { name: /^Book(?: Now)?$/ }).click()
  await visible(page.getByRole('button', { name: 'Proceed to Order Summary' })).click()
  const confirm = visible(page.getByRole('button', { name: /Confirm Booking|Confirm & Place Order/ }))
  await expect(confirm).toBeEnabled()
  // Two synchronous DOM clicks exercise the shared guard before React rerenders.
  await confirm.evaluate(button => { button.click(); button.click() })
  await expect(visible(page.getByText(/The order result is unknown/))).toBeVisible()
  expect(posts).toHaveLength(1)
  expect(posts[0].items).toHaveLength(2)
  await page.reload()
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(visible(page.getByRole('button', { name: 'Recover checkout result' }))).toBeVisible()
  await expect(confirm).toBeEnabled()
  await confirm.click()
  await expect(page).toHaveURL(/#order-success$/)
  expect(posts).toHaveLength(2)
  expect(posts[0].client_ref).toBe(posts[1].client_ref)
  expect(statuses).toEqual([201, 200])
  await expect.poll(() => page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith('gasbook-checkout-intent:')).length)).toBe(0)
  // A second acknowledged intent can legitimately buy the same product again.
  await visible(page.getByRole('button', { name: 'Explore Cylinders', exact: true })).first().click()
  await page.reload()
  await visible(page.locator('.cylinder-card').filter({ hasText: '11 KG Cylinder' })).getByRole('button', { name: /^Book(?: Now)?$/ }).click()
  await visible(page.getByRole('button', { name: 'Proceed to Order Summary' })).click()
  loseResponse = true
  await expect(confirm).toBeEnabled()
  await confirm.click()
  await expect(visible(page.getByText(/The order result is unknown/))).toBeVisible()
  await page.reload()
  await page.setViewportSize({ width: 390, height: 900 })
  await visible(page.getByRole('button', { name: 'Recover checkout result' })).click()
  await expect(page).toHaveURL(/#order-success$/)
  expect(posts).toHaveLength(3) // recovery is read-only, not another POST
  expect(posts[2].client_ref).not.toBe(posts[0].client_ref)
  console.log('PASS: complete paginated catalog, inactive filtering, retry, home limit; atomic cylinder checkout, rapid clicks, lost response, reload, layout switch, same-key replay and read-only recovery against real Django/PostgreSQL.')
} catch (error) {
  console.error((await page.locator('body').innerText()).slice(0, 3500))
  throw error
} finally {
  // Let catalog proxy requests finish before disposing their request context.
  await context.unrouteAll({ behavior: 'wait' })
  await browser.close()
}
