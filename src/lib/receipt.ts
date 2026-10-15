import { request } from './auth'

export type ReceiptSource = 'booking' | 'sale'
export interface ReceiptLine {
  description: string
  quantity: number
  rate_type: 'new' | 'refill' | null
  unit_amount: string | null
  unit_label: string
  deposit_unit_amount: string | null
  refill_unit_amount: string | null
  total_amount: string
}
export interface ReceiptData {
  number: string
  source: ReceiptSource
  transaction_type: 'Booking' | 'Direct Sale'
  business: { name: string; address?: string; phone?: string; email?: string; tax_id?: string }
  customer: { name: string; phone?: string | null; email?: string | null; address?: string | null }
  created_at: string | null
  status: string
  cancelled: boolean
  cancelled_at: string | null
  cancellation_reason: string | null
  items: ReceiptLine[]
  subtotal: string
  discount_amount: string
  total_amount: string
  paid_amount: string | null
  balance_due: string | null
  payment_status: string
  payment_method: string | null
  refund_amount: string | null
  refund_due: string | null
  refunded_at: string | null
  credit_amount: string | null
  delivery_partner: string | null
  completed_at: string | null
}

export function receiptTarget(order: { id: number; history_source?: string; source_id?: number }) {
  return { source: order.history_source === 'sale' ? 'sale' as const : 'booking' as const, id: order.source_id ?? order.id }
}

export function fetchReceipt(source: ReceiptSource, id: number, signal?: AbortSignal) {
  return request<ReceiptData>(`/receipts/${source}/${id}/`, { signal, cache: 'no-store' })
}

export function receiptFilename(number: string) {
  return `Sabco-Gas-Receipt-${number.replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`
}

export function downloadReceipt(blob: Blob, number: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = receiptFilename(number)
  document.body.append(link)
  link.click()
  link.remove()
  // Let the browser start the download before releasing its URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
