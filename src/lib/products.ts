import { request, createBooking, type BookingRecord, type BookingPreviewResponse } from './auth'
import { buildBookingPreviewPayload } from './pricing'
import type { CartItem } from '../types'
export interface Accessory { id: number; name: string; description: string; category: string; selling_price: string; image: string | null; available: boolean }
export interface BookingItem { id: number; name: string; type: 'cylinder' | 'accessory'; cylinder_type?: number; quantity: number; rate: string; total_amount: string; rate_type?: 'new' | 'refill' | null; deposit_unit_amount?: string | null; refill_unit_amount?: string | null }
export async function fetchAccessories() {
  const rows: Accessory[] = []
  let page: number | null = 1
  while (page) {
    const data: { results: Accessory[]; next: string | null } = await request(`/products/?page=${page}`)
    rows.push(...data.results); page = data.next ? page + 1 : null
  }
  return rows
}
const retryKeys = new Map<string, string>()
export async function placeCart(items: CartItem[], address: string, phone: string, preview: BookingPreviewResponse): Promise<BookingRecord[]> {
  if (!items.some(i => i.type === 'accessory')) {
    if (items.some(item => item.cylinderTypeId === undefined)) throw new Error('A cylinder in your cart is no longer available. Remove it and add it again.')
    return Promise.all(items.map(item => createBooking({ cylinder_type: item.cylinderTypeId, quantity: item.quantity,
      rate_type: item.rateType ?? 'refill', note: 'Order via Customer App (COD)', payment_method: 'COD', payment_status: 'PENDING', delivery_address: address, delivery_phone: phone })))
  }
  if (!items.some(i => i.type === 'cylinder')) throw new Error('Add a cylinder to book accessories with your delivery.')
  const payload = { ...buildBookingPreviewPayload(items), delivery_address: address, delivery_phone: phone }
  const fingerprint = JSON.stringify(payload)
  const storageKey = 'gasbook-accessory-checkout'
  let key = retryKeys.get(fingerprint)
  try { const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); if (saved?.fingerprint === fingerprint) key = saved.key } catch { /* optional persistence */ }
  if (!key) key = crypto.randomUUID()
  retryKeys.set(fingerprint, key)
  try { sessionStorage.setItem(storageKey, JSON.stringify({ fingerprint, key })) } catch { /* optional persistence */ }
  const booking = await request<BookingRecord>('/bookings/checkout/', { method: 'POST', body: JSON.stringify({ ...payload, client_ref: key, quote: preview.quote }) })
  retryKeys.delete(fingerprint)
  try { sessionStorage.removeItem(storageKey) } catch { /* optional persistence */ }
  return [booking]
}
