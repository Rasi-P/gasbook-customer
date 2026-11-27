import { afterEach, beforeEach, expect, it } from 'bun:test'
import { placeCart, recoverCart } from '../src/lib/products'
import { acknowledgeCheckout, checkoutLocked, checkoutState, pendingCheckoutKey } from '../src/lib/checkoutIntent'
import { login, logout, type BookingPreviewResponse } from '../src/lib/auth'
import type { CartItem } from '../src/types'

const originalFetch = globalThis.fetch
const originalWindow = globalThis.window
let data: Map<string, string>
const customer = 314
const items: CartItem[] = [1, 2].map(id => ({ id: `c${id}`, cylinderTypeId: id, type: 'cylinder', name: `Cylinder ${id}`, variant: '5kg', quantity: 1, unitPrice: 360 }))
const preview = { quote: 'synthetic-signed-quote', items: [], summary: { original_amount: '720', discount_amount: '0', final_amount: '720', has_discount: false } } satisfies BookingPreviewResponse
const booking = { id: 99, order_id: 'TEST99', order_items: [{ id: 1 }, { id: 2 }] }
beforeEach(async () => {
  data = new Map()
  globalThis.window = { sessionStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) }, removeItem: (key: string) => data.delete(key) } } as unknown as Window & typeof globalThis
  globalThis.fetch = (async () => Response.json({ access: 'synthetic-access', refresh: 'synthetic-refresh', role: 'customer' })) as typeof fetch
  await login('synthetic-customer', 'synthetic-input', false)
})
afterEach(async () => { await logout(); globalThis.fetch = originalFetch; globalThis.window = originalWindow })
const submit = () => placeCart(items, 'Synthetic address', '9000000000', preview, customer)

it('sends all lines atomically and retains a non-sensitive key until acknowledged cart clearing', async () => {
  const calls: string[] = []
  globalThis.fetch = (async (url, init) => {
    calls.push(String(url))
    const body = JSON.parse(String(init?.body))
    expect(body.items).toHaveLength(2)
    expect(body.client_ref).toBe(pendingCheckoutKey(customer))
    return Response.json(booking, { status: 201 })
  }) as typeof fetch
  expect(await submit()).toEqual([booking])
  expect(calls).toHaveLength(1)
  expect(calls[0]).toEndWith('/bookings/checkout/')
  expect(checkoutState(customer)).toBe('confirmed')
  const saved = [...data.values()].join('')
  for (const sensitive of ['Synthetic address', '9000000000', 'synthetic-signed-quote']) expect(saved).not.toContain(sensitive)
  acknowledgeCheckout(customer, [98])
  expect(pendingCheckoutKey(customer)).toBeDefined()
  acknowledgeCheckout(customer, [99])
  expect(pendingCheckoutKey(customer)).toBeUndefined()
})
it('shares an in-flight request between rapid clicks and the two layouts', async () => {
  let calls = 0
  globalThis.fetch = (async () => { calls++; await new Promise(resolve => setTimeout(resolve, 10)); return Response.json(booking) }) as typeof fetch
  const first = submit(), second = submit()
  expect(first).toBe(second)
  expect(checkoutState(customer)).toBe('submitting')
  expect(await Promise.all([first, second])).toEqual([[booking], [booking]])
  expect(calls).toBe(1)
})
it('keeps an unknown outcome and retries with the identical persisted key after a lost response', async () => {
  const keys: string[] = []
  globalThis.fetch = (async (_, init) => {
    keys.push(JSON.parse(String(init?.body)).client_ref)
    if (keys.length === 1) throw new TypeError('Synthetic lost response after commit')
    return Response.json(booking)
  }) as typeof fetch
  await expect(submit()).rejects.toThrow('unknown')
  expect(checkoutLocked(customer)).toBe(true)
  acknowledgeCheckout(customer, [99])
  expect(pendingCheckoutKey(customer)).toBe(keys[0])
  expect(await submit()).toEqual([booking])
  expect(keys[0]).toBe(keys[1])
})
it('recovers a successful server result without needing a current quote or repeating POSTs', async () => {
  globalThis.fetch = (async () => { throw new TypeError('Lost') }) as typeof fetch
  await expect(submit()).rejects.toThrow()
  const saved = [...data.entries()]
  data = new Map(saved) // persisted storage survives a new page context
  globalThis.fetch = (async (url, init) => {
    expect(String(url)).toContain('/bookings/checkout-status/?client_ref=')
    expect(init?.method ?? 'GET').toBe('GET')
    return Response.json({ booking })
  }) as typeof fetch
  expect(await recoverCart(customer)).toEqual([booking])
  expect(checkoutState(customer)).toBe('confirmed')
})
it('does not clear an unresolved intent when recovery sees no completed booking', async () => {
  globalThis.fetch = (async () => { throw new TypeError('Lost') }) as typeof fetch
  await expect(submit()).rejects.toThrow()
  const key = pendingCheckoutKey(customer)
  globalThis.fetch = (async () => Response.json({ booking: null })) as typeof fetch
  await expect(recoverCart(customer)).rejects.toThrow('No completed checkout')
  expect(pendingCheckoutKey(customer)).toBe(key)
  expect(checkoutLocked(customer)).toBe(false)
  // A late original commit still blocks a changed cart using this same UUID.
  globalThis.fetch = (async (_, init) => {
    expect(JSON.parse(String(init?.body)).client_ref).toBe(key)
    return Response.json({ detail: 'Retry key belongs to another booking request.' }, { status: 409 })
  }) as typeof fetch
  await expect(placeCart(items.slice(0, 1), 'Changed address', '', preview, customer)).rejects.toThrow('Retry key')
  expect(checkoutState(customer)).toBe('pending')
})
it('definite full validation failure permits correction but never silently changes the retry key', async () => {
  const keys: string[] = []
  globalThis.fetch = (async (_, init) => {
    keys.push(JSON.parse(String(init?.body)).client_ref)
    return keys.length === 1 ? Response.json({ detail: 'Invalid later line' }, { status: 400 }) : Response.json(booking)
  }) as typeof fetch
  await expect(submit()).rejects.toThrow()
  expect(checkoutState(customer)).toBe('retryable')
  expect(checkoutLocked(customer)).toBe(false)
  expect(await placeCart(items.slice(0, 1), 'Synthetic address', '9000000000', preview, customer)).toEqual([booking])
  expect(keys[0]).toBe(keys[1])
})
it('never sends independent successful lines after a transactional server failure', async () => {
  let requests = 0
  globalThis.fetch = (async () => { requests++; return Response.json({ detail: 'Synthetic transaction failure' }, { status: 500 }) }) as typeof fetch
  await expect(submit()).rejects.toThrow('unknown')
  expect(requests).toBe(1)
  expect(checkoutState(customer)).toBe('pending')
})
it('blocks changed payloads during uncertain recovery and keeps separate customer intents', async () => {
  globalThis.fetch = (async () => { throw new TypeError('Lost') }) as typeof fetch
  await expect(submit()).rejects.toThrow()
  await expect(placeCart(items, 'Changed address', '', preview, customer)).rejects.toThrow('unresolved')
  expect(pendingCheckoutKey(customer + 1)).toBeUndefined()
})
it('preserves the intent on a malformed success response instead of clearing the cart', async () => {
  globalThis.fetch = (async () => Response.json({ id: null }, { status: 201 })) as typeof fetch
  await expect(submit()).rejects.toThrow('unknown')
  expect(checkoutState(customer)).toBe('pending')
})
it('fails before sending when durable recovery storage is unavailable', async () => {
  globalThis.window = {} as Window & typeof globalThis
  let calls = 0
  globalThis.fetch = (async () => { calls++; return Response.json(booking) }) as typeof fetch
  await expect(submit()).rejects.toThrow()
  expect(calls).toBe(0)
})

it('adopts an exact previous-version mixed-checkout retry key without retaining plaintext recovery data', async () => {
  const { buildBookingPreviewPayload } = await import('../src/lib/pricing')
  const key = crypto.randomUUID()
  data.set('gasbook-accessory-checkout', JSON.stringify({ key, fingerprint: JSON.stringify({ ...buildBookingPreviewPayload(items), delivery_address: 'Synthetic address', delivery_phone: '9000000000' }) }))
  globalThis.fetch = (async (_, init) => {
    expect(JSON.parse(String(init?.body)).client_ref).toBe(key)
    return Response.json(booking)
  }) as typeof fetch
  expect(await submit()).toEqual([booking])
  expect(data.has('gasbook-accessory-checkout')).toBe(false)
  expect(pendingCheckoutKey(customer)).toBe(key)
})
