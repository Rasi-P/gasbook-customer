import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import {
  clearHomeState,
  clearTabHash,
  hydrateHomeState,
  isActiveTab,
  loadHomeState,
  readNavState,
  saveHomeState,
  writeTabHistory,
} from '../src/lib/uiState'

class MemoryStorage {
  private store = new Map<string, string>()
  get length() {
    return this.store.size
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }
  getItem(key: string) {
    return this.store.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.store.set(key, value)
  }
  removeItem(key: string) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
}

interface FakeWindow {
  sessionStorage: MemoryStorage
  location: { hash: string; pathname: string; search: string }
  history: { state: unknown; entries: Array<{ state: unknown; url: string; replaced: boolean }>; pushState: (s: unknown, t: string, u: string) => void; replaceState: (s: unknown, t: string, u: string) => void }
}

function installWindow(hash = ''): FakeWindow {
  const fake: FakeWindow = {
    sessionStorage: new MemoryStorage(),
    location: { hash, pathname: '/', search: '' },
    history: {
      state: null,
      entries: [],
      pushState(state, _title, url) {
        this.state = state
        this.entries.push({ state, url, replaced: false })
        fake.location.hash = url.includes('#') ? url.slice(url.indexOf('#')) : ''
      },
      replaceState(state, _title, url) {
        this.state = state
        this.entries.push({ state, url, replaced: true })
        fake.location.hash = url.includes('#') ? url.slice(url.indexOf('#')) : ''
      },
    },
  }
  ;(globalThis as unknown as { window: unknown }).window = fake
  return fake
}

const validCartItem = { id: 'cart-1', cylinderTypeId: 3, name: '19', variant: '19 KG', unitPrice: 1650, quantity: 2, type: 'cylinder' as const }

describe('uiState (P2-23)', () => {
  let win: FakeWindow

  beforeEach(() => {
    win = installWindow()
  })

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window
  })

  it('isActiveTab rejects unknown strings', () => {
    expect(isActiveTab('cart')).toBe(true)
    expect(isActiveTab('track-order')).toBe(true)
    expect(isActiveTab('admin')).toBe(false)
    expect(isActiveTab(42)).toBe(false)
  })

  it('persists under gasbook_customer_ui:<userId> and loads it back', () => {
    saveHomeState(7, { cartItems: [validCartItem], activeTab: 'cart', previousTab: 'home', trackingBookingId: null, lastCreatedBookings: [] })
    expect(win.sessionStorage.getItem('gasbook_customer_ui:7')).not.toBeNull()
    expect(loadHomeState(7)?.activeTab).toBe('cart')
    expect(loadHomeState(8)).toBeNull()
  })

  it('returns null for malformed JSON instead of throwing', () => {
    win.sessionStorage.setItem('gasbook_customer_ui:7', '{not json')
    expect(loadHomeState(7)).toBeNull()
    win.sessionStorage.setItem('gasbook_customer_ui:7', '[1,2]')
    expect(loadHomeState(7)).toBeNull()
  })

  it('hydrates cart + tab from storage and drops invalid cart rows', () => {
    win.sessionStorage.setItem(
      'gasbook_customer_ui:7',
      JSON.stringify({
        cartItems: [validCartItem, { id: 'bad', quantity: 0 }, 'junk'],
        activeTab: 'cart',
        previousTab: 'orders',
        trackingBookingId: 12,
        lastCreatedBookings: [{ id: 1, status: 'pending' }, { nope: true }],
      }),
    )
    const state = hydrateHomeState(7)
    expect(state.cartItems).toEqual([validCartItem])
    expect(state.activeTab).toBe('cart')
    expect(state.previousTab).toBe('orders')
    expect(state.trackingBookingId).toBe(12)
    expect(state.lastCreatedBookings).toHaveLength(1)
  })

  it('prefers the #tab hash over the stored tab', () => {
    win.location.hash = '#orders'
    saveHomeState(7, { cartItems: [], activeTab: 'profile', previousTab: 'home', trackingBookingId: null, lastCreatedBookings: [] })
    expect(hydrateHomeState(7).activeTab).toBe('orders')
  })

  it('sanitises tabs that would render blank', () => {
    win.location.hash = '#track-order'
    expect(hydrateHomeState(1).activeTab).toBe('home') // no tracking id → previous tab (home)

    win.location.hash = '#order-success'
    expect(hydrateHomeState(1).activeTab).toBe('home') // no bookings

    win.location.hash = '#checkout'
    expect(hydrateHomeState(1).activeTab).toBe('explore') // empty cart

    win.location.hash = '#bogus'
    expect(hydrateHomeState(1).activeTab).toBe('home')
  })

  it('clears every per-user snapshot and the hash on logout', () => {
    saveHomeState(1, { cartItems: [validCartItem], activeTab: 'cart', previousTab: 'home', trackingBookingId: null, lastCreatedBookings: [] })
    saveHomeState(2, { cartItems: [], activeTab: 'home', previousTab: 'home', trackingBookingId: null, lastCreatedBookings: [] })
    win.sessionStorage.setItem('gasbook_customer_auth', '{"accessToken":"a","refreshToken":"b"}')
    win.location.hash = '#cart'

    clearHomeState()
    clearTabHash()

    expect(win.sessionStorage.getItem('gasbook_customer_ui:1')).toBeNull()
    expect(win.sessionStorage.getItem('gasbook_customer_ui:2')).toBeNull()
    expect(win.sessionStorage.getItem('gasbook_customer_auth')).not.toBeNull() // tokens are handled by lib/auth
    expect(win.location.hash).toBe('')
  })

  it('writes #tab history entries and marks pushed ones', () => {
    writeTabHistory({ gasbookTab: 'home', trackingBookingId: null, previousTab: 'home' }, true)
    writeTabHistory({ gasbookTab: 'orders', trackingBookingId: null, previousTab: 'home' }, false)
    writeTabHistory({ gasbookTab: 'track-order', trackingBookingId: 5, previousTab: 'orders' }, false)

    expect(win.history.entries.map((entry) => entry.url)).toEqual(['/#home', '/#orders', '/#track-order'])
    expect(win.history.entries[0].replaced).toBe(true)
    expect(readNavState(win.history.entries[0].state)?.pushed).toBe(false)
    expect(readNavState(win.history.entries[2].state)).toEqual({ gasbookTab: 'track-order', trackingBookingId: 5, previousTab: 'orders', pushed: true })
    expect(readNavState({ gasbookTab: 'nope' })).toBeNull()
    expect(readNavState(null)).toBeNull()
  })

  it('carries the owning userId so popstate can ignore a previous user\'s entries', () => {
    writeTabHistory({ gasbookTab: 'track-order', trackingBookingId: 41, previousTab: 'orders', userId: 7 }, false)
    const popped = readNavState(win.history.entries[0].state)
    expect(popped?.userId).toBe(7)
    expect(popped?.userId === 8).toBe(false)
    // Entries written before userId existed read back as unowned (undefined), never as the current user.
    expect(readNavState({ gasbookTab: 'orders', trackingBookingId: null, previousTab: 'home' })?.userId).toBeUndefined()
  })
})
