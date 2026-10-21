import { test, expect, type Page } from '@playwright/test'

// Cylinder pictures in a real browser: custom upload first, else the weight's SABCO default from the backend's
// /static/cylinders/, else the generic cylinder; a missing (404) or broken picture steps down instead of breaking.
// Every request to the API host is answered here: nothing reaches a real backend.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
const MISSING_DEFAULTS = new Set(['sabco-14kg.png']) // a default the operator has not added yet

const type = (id: number, weight: number, image: string | null = null, name = `${weight}kg`) =>
  ({ id, name, weight: `${weight}.00`, refill_rate: '100', deposit_amount: '0', is_active: true, image })
const catalog = [
  ...[2, 3, 4, 5, 12, 14, 19, 21, 33].map((kg, i) => type(i + 1, kg)),
  type(20, 19, 'API/media/cylinder-images/ok.png', 'Commercial custom'),
  type(21, 21, 'API/media/cylinder-images/gone.png', 'Commercial broken'),
  type(22, 35, null, 'Industrial 35'),
]

async function mockBackend(page: Page, requested: string[]) {
  await page.addInitScript(() => localStorage.setItem('gasbook_customer_auth', JSON.stringify({ accessToken: 'mock', refreshToken: 'mock' })))
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:5192)[^/]+\//, async route => {
    const url = new URL(route.request().url())
    const origin = url.origin
    if (url.pathname.startsWith('/static/cylinders/') || url.pathname.startsWith('/media/')) {
      requested.push(url.pathname)
      const missing = MISSING_DEFAULTS.has(url.pathname.split('/').pop()!) || url.pathname.endsWith('/gone.png')
      return route.fulfill(missing ? { status: 404, body: 'Not found' } : { contentType: 'image/png', body: PNG })
    }
    // Writes (e.g. the cart's pricing preview) are refused here; nothing may reach a real backend.
    if (route.request().method() !== 'GET') return route.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"Offline test"}' })
    const path = url.pathname.replace(/^.*\/api/, '')
    let data: unknown = { count: 0, results: [], next: null, previous: null }
    if (path === '/auth/me/') data = { id: 1, role: 'customer', username: 'buyer', name: 'Buyer', must_change_password: false }
    if (path === '/customers/me/') data = { id: 1, user_id: 1, name: 'Buyer', phone: '9000000000' }
    if (path === '/cylinder-types/') {
      const results = catalog.map(row => ({ ...row, image: row.image?.replace('API', origin) ?? null }))
      data = { count: results.length, results, next: null, previous: null }
    }
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) })
  })
}

/** Every visible cylinder picture has loaded and decoded: nothing is broken or blank. */
async function pictures(page: Page) {
  const images = page.locator('img[data-cylinder-image]').filter({ visible: true })
  await expect(images.first()).toBeVisible()
  await expect.poll(() => images.evaluateAll(list => list.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true)
  return images.evaluateAll(list => list.map(img => ({ alt: img.getAttribute('alt'), src: img.getAttribute('src')!, state: img.getAttribute('data-cylinder-image') })))
}

for (const width of [390, 1280]) {
  test(`product cards resolve custom, SABCO default and generic pictures at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    const requested: string[] = []
    await mockBackend(page, requested)
    await page.goto('/#explore')
    await expect.poll(async () => (await pictures(page)).length).toBeGreaterThanOrEqual(catalog.length)
    const all = await pictures(page)

    for (const kg of [2, 3, 4, 5, 12, 19, 21, 33]) {
      const img = all.find(i => i.src.endsWith(`/static/cylinders/sabco-${kg}kg.png`))
      expect(img, `${kg} kg default`).toBeTruthy()
      expect(img!.state).toBe('primary')
    }
    // 14 kg's file is missing (404): the generic cylinder replaces it, not a broken image.
    expect(requested).toContain('/static/cylinders/sabco-14kg.png')
    expect(all.some(i => i.src.startsWith('data:image/svg+xml') && i.state === 'fallback')).toBe(true)
    // A working custom upload wins; a broken one steps down to its weight's default.
    expect(all.some(i => i.src.endsWith('/media/cylinder-images/ok.png') && i.state === 'primary')).toBe(true)
    expect(requested).toContain('/media/cylinder-images/gone.png')
    expect(all.filter(i => i.src.endsWith('/static/cylinders/sabco-21kg.png')).map(i => i.state)).toContain('fallback')
    // An unsupported weight goes straight to the generic cylinder without requesting a file.
    expect(requested.some(path => path.includes('35kg'))).toBe(false)
    expect(errors).toEqual([])
  })
}

test('the cart line for a cylinder whose default is missing still shows a picture', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  const requested: string[] = []
  await mockBackend(page, requested)
  await page.goto('/#explore')
  await pictures(page)
  await page.locator('.catalog-card').filter({ hasText: '14 KG' }).getByRole('button').first().click()
  await expect(page.locator('.cart-product-card').first()).toBeVisible()
  const cart = page.locator('.cart-product-card img[data-cylinder-image]')
  await expect.poll(() => cart.evaluate(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true)
  expect(await cart.getAttribute('src')).toMatch(/^data:image\/svg\+xml,/)
  expect(await cart.getAttribute('data-cylinder-image')).toBe('fallback')
})
