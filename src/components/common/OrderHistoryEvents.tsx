import { formatDateTime } from '../../lib/dateTime'

type HistoryEvents = {
  history_source?: string
  status?: string
  assigned_staff_name?: string | null
  delivered_at?: string | null
  rejected_at?: string | null
  cancelled_at?: string | null
  refunded_at?: string | null
}

export function OrderHistoryEvents({ order }: { order: HistoryEvents }) {
  const direct = order.history_source === 'sale'
  return <div className="order-event-times">
    <span>{direct ? 'Source' : 'Delivery partner'}: {direct ? 'Sabco Gas' : order.assigned_staff_name || 'Unassigned'}</span>
    {(order.status === 'cancelled' || order.status === 'rejected') && <span>
      {order.status === 'rejected' ? 'Rejected' : 'Cancelled'} {formatDateTime(direct ? order.cancelled_at : order.rejected_at)}
    </span>}
    {order.refunded_at && <span>Refunded {formatDateTime(order.refunded_at)}</span>}
  </div>
}
