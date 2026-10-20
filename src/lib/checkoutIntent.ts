/** One persisted intent per signed-in customer. No address, token or quote is stored. */
export type CheckoutState = 'idle' | 'submitting' | 'pending' | 'confirmed' | 'retryable'
interface Intent { key: string; fingerprint: string; state: Exclude<CheckoutState, 'idle' | 'submitting'>; bookingId?: number }
const prefix = 'gasbook-checkout-intent:'
const listeners = new Set<() => void>()
const running = new Map<number, Promise<unknown>>()

function storage(): Storage {
  try {
    const value = window.sessionStorage
    if (value) return value
  } catch { /* Browser storage can be disabled. Fail before sending a booking. */ }
  throw new Error('Checkout requires browser storage for safe retries. Enable storage and try again.')
}
function read(customerId: number): Intent | null {
  const raw = storage().getItem(prefix + customerId)
  if (!raw) return null
  const item = JSON.parse(raw) as Intent
  if (!/^[0-9a-f-]{36}$/i.test(item.key) || !/^[0-9a-f]{64}$/.test(item.fingerprint) || !['pending', 'confirmed', 'retryable'].includes(item.state)) {
    throw new Error('Checkout recovery data is invalid. Review your orders before contacting support; do not submit another order.')
  }
  return item
}
function write(customerId: number, intent: Intent) {
  try { storage().setItem(prefix + customerId, JSON.stringify(intent)) }
  catch { throw new Error('Unable to save checkout recovery data. Keep this cart open and enable browser storage before retrying.') }
  listeners.forEach(listener => listener())
}
export const subscribeCheckout = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
export function checkoutState(customerId: number): CheckoutState {
  if (running.has(customerId)) return 'submitting'
  try { return read(customerId)?.state ?? 'idle' } catch { return 'pending' }
}
export function checkoutLocked(customerId: number): boolean {
  return ['submitting', 'pending', 'confirmed'].includes(checkoutState(customerId))
}
export function runCheckout<T>(customerId: number, action: () => Promise<T>): Promise<T> {
  const current = running.get(customerId)
  if (current) return current as Promise<T>
  // Register synchronously before any hashing, storage, or network await.
  const task = Promise.resolve().then(action).finally(() => {
    running.delete(customerId)
    listeners.forEach(listener => listener())
  })
  running.set(customerId, task)
  listeners.forEach(listener => listener())
  return task
}
export async function prepareCheckout(customerId: number, payload: unknown): Promise<string> {
  if (!Number.isSafeInteger(customerId) || customerId <= 0) throw new Error('Reload your customer profile before checkout.')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)))
  const fingerprint = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('')
  const previous = read(customerId)
  if (previous && previous.fingerprint !== fingerprint && previous.state !== 'retryable') {
    throw new Error('A previous checkout is unresolved. Recover its result before changing this cart or delivery address.')
  }
  // Preserve an unresolved mixed-cart retry from the previous client version.
  // That format had no customer id; adopt only an exact payload match and let
  // the backend enforce ownership. Never silently replace an unresolved key.
  const legacyRaw = storage().getItem('gasbook-accessory-checkout')
  const legacy = !previous && legacyRaw ? JSON.parse(legacyRaw) as { fingerprint?: string; key?: string } : null
  if (legacy && (legacy.fingerprint !== JSON.stringify(payload) || !/^[0-9a-f-]{36}$/i.test(legacy.key ?? ''))) {
    throw new Error('A previous checkout is unresolved. Restore its cart and delivery address before retrying.')
  }
  const key = previous?.key ?? legacy?.key ?? crypto.randomUUID()
  write(customerId, { key, fingerprint, state: 'pending' })
  if (legacy) storage().removeItem('gasbook-accessory-checkout')
  return key
}
export function recordCheckout(customerId: number, state: 'confirmed' | 'retryable', bookingId?: number) {
  const previous = read(customerId)
  if (previous) write(customerId, { ...previous, state, bookingId })
}
export function pendingCheckoutKey(customerId: number) { return read(customerId)?.key }

/** Call only after the cleared cart and successful result were durably saved. */
export function acknowledgeCheckout(customerId: number, bookingIds: number[]) {
  try {
    const intent = read(customerId)
    if (intent?.state === 'confirmed' && intent.bookingId && bookingIds.includes(intent.bookingId)) {
      storage().removeItem(prefix + customerId)
      listeners.forEach(listener => listener())
    }
  } catch { /* Keep recovery state if storage becomes unavailable. */ }
}
