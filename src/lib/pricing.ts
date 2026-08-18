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
