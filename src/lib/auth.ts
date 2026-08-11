export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  access: string
  refresh: string
  must_change_password: boolean
  user_id?: number
}

export interface CurrentUser {
  id: number
  username: string
  name: string
  role: string
  redirect: string | null
  must_change_password: boolean
  vehicle_location_name: string | null
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  confirm_new_password: string
}

export interface CustomerProfile {
  id: number
  user_id: number
  username: string
  full_name: string
  name: string
  phone: string
  email: string
  address: string
  created_at: string
  updated_at: string
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api').replace(/\/+$/, '')
const STORAGE_KEY = 'gasbook_customer_auth'

let activeStorage: Storage | null = null
let cachedTokens: AuthTokens | null = loadStoredTokens()
let refreshRequest: Promise<AuthTokens> | null = null

function getStorage(kind: 'local' | 'session'): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function readTokens(storage: Storage | null): AuthTokens | null {
  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<AuthTokens>
    if (typeof parsed.accessToken === 'string' && typeof parsed.refreshToken === 'string') {
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
      }
    }
  } catch {
    storage.removeItem(STORAGE_KEY)
  }

  return null
}

function loadStoredTokens(): AuthTokens | null {
  const sessionStorage = getStorage('session')
  const localStorage = getStorage('local')

  const sessionTokens = readTokens(sessionStorage)
  if (sessionTokens) {
    activeStorage = sessionStorage
    return sessionTokens
  }

  const localTokens = readTokens(localStorage)
  if (localTokens) {
    activeStorage = localStorage
    return localTokens
  }

  activeStorage = null
  return null
}

function clearPersistedTokens() {
  getStorage('session')?.removeItem(STORAGE_KEY)
  getStorage('local')?.removeItem(STORAGE_KEY)
}

function persistTokens(tokens: AuthTokens, remember: boolean) {
  clearPersistedTokens()

  const storage = getStorage(remember ? 'local' : 'session')
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(tokens))
    activeStorage = storage
  } else {
    activeStorage = null
  }

  cachedTokens = tokens
}

function replaceTokens(tokens: Partial<AuthTokens>) {
  if (!cachedTokens) {
    return
  }

  const nextTokens: AuthTokens = {
    accessToken: tokens.accessToken ?? cachedTokens.accessToken,
    refreshToken: tokens.refreshToken ?? cachedTokens.refreshToken,
  }

  cachedTokens = nextTokens

  if (activeStorage) {
    activeStorage.setItem(STORAGE_KEY, JSON.stringify(nextTokens))
  }
}

function clearTokens() {
  clearPersistedTokens()
  cachedTokens = null
  activeStorage = null
}

function buildUrl(path: string) {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  const data = text ? tryParseJson(text) : null

  if (!response.ok) {
    throw new ApiError(extractMessage(data, response.statusText || 'Request failed.'), response.status, data)
  }

  return data as T
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (!data || typeof data !== 'object') {
    return fallback
  }

  const record = data as Record<string, unknown>
  if (typeof record.detail === 'string' && record.detail.trim()) {
    return record.detail
  }

  const firstFieldMessage = Object.values(record)
    .map((value) => {
      if (typeof value === 'string' && value.trim()) {
        return value
      }
      if (Array.isArray(value) && value.length > 0) {
        const joined = value.filter((item): item is string => typeof item === 'string').join(' ')
        return joined.trim()
      }
      return ''
    })
    .find(Boolean)

  return firstFieldMessage || fallback
}

async function rawRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(buildUrl(path), init)
  } catch {
    throw new ApiError('Network error. Please check your connection and try again.', 0, null)
  }

  return parseResponse<T>(response)
}

async function refreshTokens(): Promise<AuthTokens> {
  if (!cachedTokens?.refreshToken) {
    clearTokens()
    throw new ApiError('Session expired. Please sign in again.', 401, null)
  }

  if (!refreshRequest) {
    refreshRequest = rawRequest<{ access: string; refresh?: string }>('/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refresh: cachedTokens.refreshToken }),
    })
      .then((data) => {
        const nextTokens: AuthTokens = {
          accessToken: data.access,
          refreshToken: data.refresh ?? cachedTokens!.refreshToken,
        }
        replaceTokens(nextTokens)
        return nextTokens
      })
      .catch((error) => {
        clearTokens()
        if (error instanceof ApiError) {
          throw error
        }
        throw new ApiError('Session expired. Please sign in again.', 401, null)
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean; retryOnUnauthorized?: boolean } = {},
): Promise<T> {
  const { auth = true, retryOnUnauthorized = true } = options
  const headers = new Headers(init.headers)

  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    if (!cachedTokens?.accessToken) {
      throw new ApiError('Session expired. Please sign in again.', 401, null)
    }
    headers.set('Authorization', `Bearer ${cachedTokens.accessToken}`)
  }

  try {
    return await rawRequest<T>(path, {
      ...init,
      headers,
    })
  } catch (error) {
    if (
      auth &&
      retryOnUnauthorized &&
      error instanceof ApiError &&
      error.status === 401 &&
      cachedTokens?.refreshToken
    ) {
      await refreshTokens()
      return request<T>(path, init, { auth, retryOnUnauthorized: false })
    }

    throw error
  }
}

export async function login(username: string, password: string, remember: boolean): Promise<LoginResponse> {
  const data = await request<LoginResponse>(
    '/auth/token/',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    },
    { auth: false, retryOnUnauthorized: false },
  )

  persistTokens(
    {
      accessToken: data.access,
      refreshToken: data.refresh,
    },
    remember,
  )

  return data
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>('/auth/me/', { method: 'GET' })
}

export async function getCustomerProfile(): Promise<CustomerProfile | null> {
  const data = await request<CustomerProfile[]>('/customers/', { method: 'GET' })
  return data[0] ?? null
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ detail: string }> {
  return request<{ detail: string }>('/auth/change-password/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface CylinderTypeItem {
  id: number
  name: string
  weight: string
  selling_price: string
  is_active: boolean
}

export async function fetchCylinderTypes(): Promise<CylinderTypeItem[]> {
  const data = await request<any>('/cylinder-types/', { method: 'GET' })
  return data.results || data || []
}

export async function createBooking(payload: Record<string, unknown>): Promise<{ id: number }> {
  return request<{ id: number }>('/bookings/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchCustomerBookings(): Promise<any[]> {
  const data = await request<any>('/bookings/', { method: 'GET' })
  return data.results || data || []
}

export async function logout() {
  clearTokens()
}

export function hasStoredSession() {
  return Boolean(cachedTokens?.accessToken && cachedTokens?.refreshToken)
}

export function getApiErrorDetails(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) {
    return {
      message: fallback,
      fieldErrors: {} as Record<string, string>,
      status: 0,
    }
  }

  return {
    message: extractMessage(error.data, error.message || fallback),
    fieldErrors: normalizeFieldErrors(error.data),
    status: error.status,
  }
}

function normalizeFieldErrors(data: unknown) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {}
  }

  return Object.entries(data as Record<string, unknown>).reduce<Record<string, string>>((accumulator, [key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      accumulator[key] = value
      return accumulator
    }

    if (Array.isArray(value)) {
      const joined = value.filter((item): item is string => typeof item === 'string').join(' ')
      if (joined.trim()) {
        accumulator[key] = joined
      }
    }

    return accumulator
  }, {})
}
