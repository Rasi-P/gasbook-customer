import { expect, test } from 'bun:test'
import { login, changePassword, getCurrentUser, logout } from '../src/lib/auth'

test('password change replaces tokens while preserving session-only storage', async () => {
  const session = new Map<string, string>(), local = new Map<string, string>()
  const storage = (values: Map<string, string>) => ({ getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) })
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    sessionStorage: storage(session), localStorage: storage(local),
    location: { hash: '', pathname: '/', search: '' }, history: { replaceState() {} },
  } })
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = new URL(String(input)).pathname
      if (path.endsWith('/auth/me/')) {
        expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer new-test-access')
        return Response.json({ id: 1, role: 'customer' })
      }
      return Response.json(path.endsWith('/auth/token/')
        ? { access: 'old-test-access', refresh: 'old-test-refresh', role: 'customer', must_change_password: true }
        : { detail: 'Updated', access: 'new-test-access', refresh: 'new-test-refresh' })
    }) as typeof fetch
    await login('test-customer', 'test-input', false)
    await changePassword({ current_password: 'test-input', new_password: 'test-input-new', confirm_new_password: 'test-input-new' })
    expect(JSON.parse(session.get('gasbook_customer_auth')!).refreshToken).toBe('new-test-refresh')
    expect(local.has('gasbook_customer_auth')).toBe(false)
    await getCurrentUser()
  } finally {
    await logout()
    globalThis.fetch = originalFetch
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})
