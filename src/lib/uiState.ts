import type { ActiveTab, CartItem } from '../types'
import type { BookingRecord } from './auth'

const PERSIST_PREFIX = 'gasbook_customer_ui:'

export interface PersistedHomeState {
  cartItems: CartItem[]
  activeTab: ActiveTab
  previousTab: ActiveTab
  trackingBookingId: number | null
  lastCreatedBookings: BookingRecord[]
}

export interface NavState {
  gasbookTab: ActiveTab
  trackingBookingId: number | null
  previousTab: ActiveTab
  /** True for entries created by in-app navigation (pushState), absent for the mount-time replaceState. */
  pushed?: boolean
  /** Owner of the entry; popstate ignores entries written by a different user in the same tab. */
  userId?: number
}

export const ACTIVE_TABS: readonly ActiveTab[] = [
  'home',
  'explore',
  'orders',
  'cart',
  'checkout',
  'order-success',
  'profile',
  'track-order',
]

export function isActiveTab(value: unknown): value is ActiveTab {
  return typeof value === 'string' && (ACTIVE_TABS as readonly string[]).includes(value)
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function storageKey(userId: number) {
  return `${PERSIST_PREFIX}${userId}`
}

export function loadHomeState(userId: number): Partial<PersistedHomeState> | null {
  const storage = getSessionStorage()
  if (!storage) {
    return null
  }
  try {
    const raw = storage.getItem(storageKey(userId))
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    return parsed as Partial<PersistedHomeState>
  } catch {
    return null
  }
}

export function saveHomeState(userId: number, state: PersistedHomeState) {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }
  try {
    storage.setItem(storageKey(userId), JSON.stringify(state))
  } catch {
    // Quota exceeded / private mode: persistence is best-effort.
  }
}

export function clearHomeState() {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }
  try {
    const keys: string[] = []
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)
      if (key && key.startsWith(PERSIST_PREFIX)) {
        keys.push(key)
      }
    }
    keys.forEach((key) => storage.removeItem(key))
  } catch {
    // ignore
  }
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') {
    return false
  }
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.variant === 'string' &&
    typeof item.unitPrice === 'number' &&
    Number.isFinite(item.unitPrice) &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    (item.type === 'cylinder' || item.type === 'accessory') &&
    (item.cylinderTypeId === undefined || typeof item.cylinderTypeId === 'number')
  )
}

function isValidBookingRecord(value: unknown): value is BookingRecord {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return typeof record.id === 'number' && typeof record.status === 'string'
}

export function readTabFromHash(): ActiveTab | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const hash = window.location.hash.replace(/^#/, '')
    return isActiveTab(hash) ? hash : null
  } catch {
    return null
  }
}

/**
 * Builds the initial HomeScreen state from the URL hash plus the per-user
 * sessionStorage snapshot, sanitising combinations that would render a blank
 * screen (track-order without an id, order-success without bookings, checkout
 * with an empty cart).
 */
export function hydrateHomeState(userId: number): PersistedHomeState {
  const persisted = loadHomeState(userId)

  const cartItems = Array.isArray(persisted?.cartItems) ? persisted.cartItems.filter(isValidCartItem) : []
  const lastCreatedBookings = Array.isArray(persisted?.lastCreatedBookings)
    ? persisted.lastCreatedBookings.filter(isValidBookingRecord)
    : []
  const trackingBookingId = typeof persisted?.trackingBookingId === 'number' ? persisted.trackingBookingId : null
  const previousTab: ActiveTab = isActiveTab(persisted?.previousTab) && persisted.previousTab !== 'track-order' ? persisted.previousTab : 'home'

  let activeTab: ActiveTab = readTabFromHash() ?? (isActiveTab(persisted?.activeTab) ? persisted.activeTab : 'home')

  if (activeTab === 'track-order' && trackingBookingId === null) {
    activeTab = previousTab
  }
  if (activeTab === 'order-success' && lastCreatedBookings.length === 0) {
    activeTab = 'home'
  }
  if (activeTab === 'checkout' && cartItems.length === 0) {
    activeTab = 'explore'
  }

  return { cartItems, activeTab, previousTab, trackingBookingId, lastCreatedBookings }
}

export function readNavState(value: unknown): NavState | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const state = value as Record<string, unknown>
  if (!isActiveTab(state.gasbookTab)) {
    return null
  }
  return {
    gasbookTab: state.gasbookTab,
    trackingBookingId: typeof state.trackingBookingId === 'number' ? state.trackingBookingId : null,
    previousTab: isActiveTab(state.previousTab) ? state.previousTab : 'home',
    pushed: state.pushed === true,
    userId: typeof state.userId === 'number' ? state.userId : undefined,
  }
}

export function writeTabHistory(state: NavState, replace: boolean) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    const url = `${window.location.pathname}${window.location.search}#${state.gasbookTab}`
    if (replace) {
      window.history.replaceState(state, '', url)
    } else {
      window.history.pushState({ ...state, pushed: true }, '', url)
    }
  } catch {
    // History API unavailable (e.g. sandboxed iframe): navigation still works in-memory.
  }
}

export function currentNavState(): NavState | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return readNavState(window.history.state)
  } catch {
    return null
  }
}

/** Drops the `#tab` fragment so the next sign-in starts from a clean URL. */
export function clearTabHash() {
  if (typeof window === 'undefined') {
    return
  }
  try {
    if (window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  } catch {
    // ignore
  }
}
