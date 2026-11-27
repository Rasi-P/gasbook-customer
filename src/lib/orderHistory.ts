import type { OrderItem } from '../types'
import { formatDateTime } from './dateTime'
import { getCylinderDisplay } from './formatters'
import { getOrderStatusMeta } from './orderStatus'
import { buildOrderPrice } from './pricing'

export function mapHistoryOrder(b: any): OrderItem {
  const isDirectSale = b.history_source === 'sale'
  // A direct sale the shop cancelled comes back with status "cancelled".
  const isCancelledSale = isDirectSale && b.status === 'cancelled'
  const meta = getOrderStatusMeta(b.status, b)
  const statusLabel = isCancelledSale ? 'Cancelled' : isDirectSale ? 'Sale Completed' : meta.label
  const statusKind: 'ongoing' | 'completed' | 'cancelled' = isCancelledSale ? 'cancelled' : isDirectSale ? 'completed' : meta.kind
  const etaOrDate = isDirectSale
    ? b.detail_message || (isCancelledSale ? 'Direct sale cancelled' : 'Direct sale completed')
    : meta.description
  const pricing = buildOrderPrice(b)

  const display =
    b.display_name && b.display_badge
      ? { title: b.display_name, badge: b.display_badge }
      : getCylinderDisplay(b.cylinder_type_name, b.cylinder_type_weight)

  return {
    id: `${b.history_source || 'booking'}-${b.id}`,
    orderNumber: b.display_reference || `Order #${b.order_id}`,
    date: `${isDirectSale ? 'Recorded' : 'Booked'} ${formatDateTime(b.created_at)}`,
    productName: display.title,
    weight: display.badge,
    price: pricing.price,
    originalPrice: pricing.originalPrice,
    status: statusKind,
    statusCode: b.status,
    statusLabel,
    actionLabel: isDirectSale ? 'Order Again' : 'Track Order',
    etaOrDate,
    rawBooking: b,
    rejectionReason: b.rejection_reason,
  }
}
