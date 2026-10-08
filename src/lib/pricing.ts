import type { BookingPreviewItem, BookingPreviewResponse } from './auth'
import type { CartItem } from '../types'

export function amountToNumber(value: number | string | undefined | null) {
  return Number(value || 0)
}

export function formatMoney(value: number | string | undefined | null) {
  return `₹${amountToNumber(value).toLocaleString('en-IN')}`
}

export function buildBookingPreviewPayload(cartItems: CartItem[]) {
  return {
    items: cartItems.map((item) => ({
      client_item_id: item.id,
      cylinder_type: item.cylinderTypeId || 1,
      quantity: item.quantity || 1,
    })),
  }
}

export function createEmptyPreview(): BookingPreviewResponse {
  return {
    items: [],
    summary: {
      original_amount: '0',
      discount_amount: '0',
      final_amount: '0',
      has_discount: false,
    },
  }
}

export function previewItemByCartId(preview: BookingPreviewResponse | null, cartItemId: string): BookingPreviewItem | undefined {
  return preview?.items.find((item) => item.client_item_id === cartItemId)
}

// `rate` from the preview API is the pre-discount unit rate; the discounted unit
// rate has to be derived from the line total, which is what customers actually pay.
export function previewUnitRates(item: BookingPreviewItem | undefined, fallbackUnitPrice: number) {
  const quantity = Number(item?.quantity || 0)
  const original = item ? amountToNumber(item.rate) : fallbackUnitPrice
  const effective = item && quantity > 0 ? amountToNumber(item.final_amount) / quantity : original
  return { original, effective, hasDiscount: Boolean(item?.has_discount) }
}

export interface OrderPriceSource {
  final_amount?: string | number | null
  total_amount?: string | number | null
  original_amount?: string | number | null
  discount_amount?: string | number | null
  rate?: string | number | null
  quantity?: number | string | null
}

function hasAmount(value: string | number | null | undefined): value is string | number {
  return value !== null && value !== undefined && value !== ''
}

export interface OrderPrice {
  finalAmount: number
  originalAmount: number
  hasDiscount: boolean
  /** Formatted final (discounted) total, or the fallback label when no amount is known. */
  price: string
  /** Formatted pre-discount total, only when a discount was applied. */
  originalPrice?: string
}

/**
 * Builds the customer-facing price for a booking / history row.
 * Always uses the discounted total (`final_amount`, alias `total_amount`), never the
 * pre-discount unit `rate`; the strike-through original is only present when discounted.
 */
export function buildOrderPrice(booking: OrderPriceSource, fallbackLabel = 'To be determined'): OrderPrice {
  const legacyTotal = amountToNumber(booking.rate) * amountToNumber(booking.quantity)
  // A present "0.00" is a real (fully discounted) total; only an absent value falls back to rate x quantity.
  const finalSource = hasAmount(booking.final_amount) ? booking.final_amount : hasAmount(booking.total_amount) ? booking.total_amount : null
  const hasFinal = finalSource !== null
  const finalAmount = hasFinal ? amountToNumber(finalSource) : legacyTotal
  const originalAmount = hasAmount(booking.original_amount) ? amountToNumber(booking.original_amount) : legacyTotal
  const hasDiscount = amountToNumber(booking.discount_amount) > 0

  return {
    finalAmount,
    originalAmount,
    hasDiscount,
    price: hasFinal || finalAmount > 0 ? formatMoney(finalAmount) : fallbackLabel,
    originalPrice: hasDiscount && originalAmount > 0 ? formatMoney(originalAmount) : undefined,
  }
}
