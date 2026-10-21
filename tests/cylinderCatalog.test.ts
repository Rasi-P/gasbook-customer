import { afterEach, beforeEach, expect, it } from 'bun:test'
import { API_BASE_URL, activeCylinderTypes, fetchCylinderTypes, login, logout } from '../src/lib/auth'
import { cylinderSubject, registerCylinderImages } from '../src/lib/formatters'
import { resolveCylinderImage, type CylinderImageSubject } from '../src/lib/cylinderImages'

const pic = (subject: CylinderImageSubject) => resolveCylinderImage(subject, API_BASE_URL)
const getCylinderImage = (name: string) => pic(cylinderSubject({ name }))

const originalFetch = globalThis.fetch
beforeEach(async () => {
  globalThis.fetch = (async () => Response.json({ access: 'synthetic-access', refresh: 'synthetic-refresh', role: 'customer' })) as typeof fetch
  await login('synthetic-customer', 'synthetic-input', false)
})
afterEach(async () => { await logout(); globalThis.fetch = originalFetch })
const cylinder = (id: number) => ({ id, name: `Catalog ${id}`, weight: '5', is_active: true, refill_rate: '360', deposit_amount: '450', image: null })
it('uses bundled images for a complete demo catalog with no uploaded media', async () => {
  const weights = [5, 12, 17, 19, 21, 33]
  const all = weights.map((weight, i) => ({ ...cylinder(i + 1), name: `Demo ${weight}kg`, weight: String(weight) }))
  registerCylinderImages(all.map(type => ({ ...type, image: 'https://unused.invalid/old.png' })))
  const seen = pages(() => ({ count: all.length, results: all, next: null }))
  const result = await fetchCylinderTypes()
  for (const type of result) {
    const image = pic(cylinderSubject({ id: type.id, name: type.name, weight: type.weight }))
    // No uploads: every type shows its weight's SABCO file (33 kg too), served by the backend.
    expect(image).toBe(`${new URL(API_BASE_URL).origin}/static/cylinders/sabco-${Number(type.weight)}kg.png`)
    expect(image).not.toContain('unused.invalid')
  }
  expect(seen).toHaveLength(1)
})
function pages(respond: (page: number, url: URL) => unknown | Response) {
  const seen: string[] = []
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = new URL(String(input)); seen.push(url.href)
    const result = respond(Number(url.searchParams.get('page') || 1), url)
    return result instanceof Response ? result : Response.json(result)
  }) as typeof fetch
  return seen
}
for (const size of [0, 4, 10, 11, 25]) {
  it(`loads the entire ${size}-item catalog with no unnecessary requests`, async () => {
    const all = Array.from({ length: size }, (_, index) => cylinder(index + 1))
    const seen = pages((page, url) => ({ count: size, results: all.slice((page - 1) * 10, page * 10), next: page * 10 < size ? new URL(`?page=${page + 1}`, url).href : null }))
    expect(await fetchCylinderTypes()).toEqual(all)
    expect(seen).toHaveLength(Math.max(1, Math.ceil(size / 10)))
  })
}
it('preserves inactive history rows and registers images only after every page succeeds', async () => {
  registerCylinderImages([{ name: 'Catalog 1', image: null }])
  const fallback = getCylinderImage('Catalog 1')
  pages((page, url) => {
    if (page === 1) return { count: 2, results: [{ ...cylinder(1), is_active: false, image: 'https://images.invalid/one.png' }], next: new URL('?page=2', url).href }
    expect(getCylinderImage('Catalog 1')).toBe(fallback)
    return { count: 2, results: [cylinder(2)], next: null }
  })
  const all = await fetchCylinderTypes()
  expect(all).toHaveLength(2)
  expect(activeCylinderTypes(all).map(item => item.id)).toEqual([2])
  expect(getCylinderImage('Catalog 1')).toBe('https://images.invalid/one.png')
})
it('rejects a later failure without publishing images and permits a complete retry', async () => {
  registerCylinderImages([{ name: 'Catalog 1', image: null }])
  const fallback = getCylinderImage('Catalog 1')
  const first = { ...cylinder(1), image: 'https://images.invalid/retried.png' }
  let failed = true
  pages((page, url) => page === 1 ? { count: 2, results: [first], next: new URL('?page=2', url).href }
    : failed ? Response.json({ detail: 'Unavailable' }, { status: 503 }) : { count: 2, results: [cylinder(2)], next: null })
  await expect(fetchCylinderTypes()).rejects.toThrow()
  expect(getCylinderImage('Catalog 1')).toBe(fallback)
  failed = false
  expect(await fetchCylinderTypes()).toHaveLength(2)
  expect(getCylinderImage('Catalog 1')).toBe(first.image)
})
const invalidPages: Record<string, (page: number, url: URL) => unknown> = {
  'cross-origin next': () => ({ count: 2, results: [cylinder(1)], next: 'https://untrusted.invalid/api/cylinder-types/?page=2' }),
  'wrong endpoint': (_, url) => ({ count: 2, results: [cylinder(1)], next: new URL('/api/users/?page=2', url).href }),
  'repeated page': (_, url) => ({ count: 2, results: [cylinder(1)], next: new URL('?page=1', url).href }),
  'skipped page': (_, url) => ({ count: 2, results: [cylinder(1)], next: new URL('?page=3', url).href }),
  'duplicate ids': () => ({ count: 2, results: [cylinder(1), cylinder(1)], next: null }),
  'bad count': () => ({ count: '1', results: [cylinder(1)], next: null }),
  'malformed image row': () => ({ count: 2, results: [cylinder(1), { ...cylinder(2), image: 42 }], next: null }),
  'missing next': () => ({ count: 1, results: [cylinder(1)] }),
  'truncated final page': () => ({ count: 2, results: [cylinder(1)], next: null }),
  'unexpected empty intermediate': (_, url) => ({ count: 2, results: [], next: new URL('?page=2', url).href }),
  'inconsistent counts': (page, url) => ({ count: page === 1 ? 2 : 3, results: [cylinder(page)], next: page === 1 ? new URL('?page=2', url).href : null }),
  'empty final page': (page, url) => ({ count: 2, results: page === 1 ? [cylinder(1)] : [], next: page === 1 ? new URL('?page=2', url).href : null }),
  'duplicate across pages': (page, url) => ({ count: 2, results: [cylinder(1)], next: page === 1 ? new URL('?page=2', url).href : null }),
  'extra query parameters': (_, url) => ({ count: 2, results: [cylinder(1)], next: new URL('?page=2&page=3', url).href }),
}
for (const [name, respond] of Object.entries(invalidPages)) {
  it(`fails closed on ${name}`, async () => {
    const seen = pages(respond)
    await expect(fetchCylinderTypes()).rejects.toThrow('incomplete')
    expect(seen.length).toBeLessThanOrEqual(2)
    expect(seen.every(value => !value.includes('untrusted.invalid'))).toBe(true)
  })
}
it('bounds catalog requests even if every next page advances', async () => {
  const seen = pages((page, url) => ({ count: 1001, results: [cylinder(page)], next: new URL(`?page=${page + 1}`, url).href }))
  await expect(fetchCylinderTypes()).rejects.toThrow('incomplete')
  expect(seen).toHaveLength(1000)
})
