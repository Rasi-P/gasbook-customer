import { collectPages } from './pagination'
import { request, ApiError, type BookingRecord, type BookingPreviewResponse, catalogEndpoint } from './auth'
import { pendingCheckoutKey, prepareCheckout, recordCheckout, runCheckout } from './checkoutIntent'
import { buildBookingPreviewPayload } from './pricing'
import type { CartItem } from '../types'
export interface Accessory { id: number; name: string; description: string; category: string; selling_price: string; image: string | null; available: boolean }
export interface BookingItem { id: number; name: string; type: 'cylinder' | 'accessory'; cylinder_type?: number; quantity: number; rate: string; total_amount: string; rate_type?: 'new' | 'refill' | null; deposit_unit_amount?: string | null; refill_unit_amount?: string | null }
export async function fetchAccessories(): Promise<Accessory[]> {
  const endpoint = catalogEndpoint('/products/')
  const rows = await collectPages<Accessory>(endpoint, query => request(`/products/?${query}`))
  if (rows.some(row => typeof row.name !== 'string' || typeof row.available !== 'boolean' ||
      typeof row.category !== 'string' || typeof row.description !== 'string' ||
      !Number.isFinite(Number(row.selling_price)) || Number(row.selling_price) < 0 ||
      (row.image != null && typeof row.image !== 'string'))) throw new Error('Invalid accessory catalog. Please reload.')
  return rows
}
export function placeCart(items: CartItem[], address: string, phone: string, preview: BookingPreviewResponse, customerId: number): Promise<BookingRecord[]> {
  return runCheckout(customerId, async () => {
    if (!items.some(i => i.type === 'cylinder')) throw new Error('Add a cylinder to book accessories with your delivery.')
    if (items.some(item => item.type === 'cylinder' && item.cylinderTypeId === undefined)) throw new Error('A cylinder in your cart is no longer available. Remove it and add it again.')
    if (!preview.quote) throw new Error('Refresh and review the booking total before confirming.')
    const payload = { ...buildBookingPreviewPayload(items), delivery_address: address, delivery_phone: phone }
    const key = await prepareCheckout(customerId, payload)
    try {
      const booking = await request<BookingRecord>('/bookings/checkout/', { method: 'POST', body: JSON.stringify({ ...payload, client_ref: key, quote: preview.quote }) })
      if (!Number.isSafeInteger(booking?.id) || booking.id <= 0) throw new Error('Invalid checkout response')
      recordCheckout(customerId, 'confirmed', booking.id)
      return [booking]
    } catch (error) {
      // A definite transactional validation rejection allows cart editing.
      // Keep the SAME key even then; a late concurrent success must still win.
      if (error instanceof ApiError && error.status === 400) recordCheckout(customerId, 'retryable')
      if (!(error instanceof ApiError) || error.status === 0 || error.status >= 500) {
        throw new Error('The order result is unknown. Keep this cart open. Recover the result or retry safely using this same checkout.')
      }
      throw error
    }
  })
}

export function recoverCart(customerId: number): Promise<BookingRecord[]> {
  return runCheckout(customerId, async () => {
    const key = pendingCheckoutKey(customerId)
    if (!key) throw new Error('There is no pending checkout to recover.')
    const result = await request<{ booking: BookingRecord | null }>(`/bookings/checkout-status/?client_ref=${encodeURIComponent(key)}`)
    if (!result.booking) {
      // Absence is not a cancellation. Editing is safe only because the UUID
      // survives: a late commit will make a changed-payload retry conflict.
      recordCheckout(customerId, 'retryable')
      throw new Error('No completed checkout is visible yet. Review your cart and retry here; the same checkout key will be kept. Do not place a separate order.')
    }
    if (!Number.isSafeInteger(result.booking.id) || result.booking.id <= 0) throw new Error('Invalid checkout recovery response. Keep this cart open and retry recovery.')
    recordCheckout(customerId, 'confirmed', result.booking.id)
    return [result.booking]
  })
}
