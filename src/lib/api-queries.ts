import { request } from './auth'

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BookingQueryParams {
  page?: number;
  status?: string;
  search?: string;
}

export interface NotificationQueryParams {
  page?: number;
}

export function buildQueryString(params: Record<string, string | number | undefined | null>): string {
  const queryParts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
    }
  }
  return queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
}

export async function fetchPaginatedBookings(params: BookingQueryParams): Promise<PaginatedResponse<any>> {
  const qs = buildQueryString(params as any)
  const data = await request<PaginatedResponse<any> | any[]>(`/bookings/${qs}`, { method: 'GET' })
  // If the backend isn't paginating (e.g. settings missing), polyfill it to match the type
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data
    }
  }
  // Also handle the case where it's not an array but missing results
  if (!data.results) {
    return {
        count: 0,
        next: null,
        previous: null,
        results: []
    }
  }
  return data
}

export async function fetchPaginatedNotifications(params: NotificationQueryParams): Promise<PaginatedResponse<any>> {
  const qs = buildQueryString(params as any)
  const data = await request<PaginatedResponse<any> | any[]>(`/notifications/${qs}`, { method: 'GET' })
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  if (!data.results) {
    return { count: 0, next: null, previous: null, results: [] }
  }
  return data
}
