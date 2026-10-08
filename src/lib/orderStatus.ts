export const BOOKING_STATUSES = [
  'pending',
  'approved',
  'accepted',
  'out_for_delivery',
  'delivered',
  'rejected',
  'cancelled',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

/** Bookings the customer can still track. `accepted` stays here: the partner accepted but has not started. */
export const ACTIVE_STATUS_FILTER = 'pending,approved,accepted,out_for_delivery'
export const COMPLETED_STATUS_FILTER = 'delivered'
export const CANCELLED_STATUS_FILTER = 'cancelled,rejected'

export type OrderStatusKind = 'ongoing' | 'completed' | 'cancelled'

export interface OrderStatusMeta {
  /** Short badge text. */
  label: string
  kind: OrderStatusKind
  /** One-line explanation shown under the badge / on the active-order card. */
  description: string
  /** Index into the 4-step timeline: 0 placed, 1 confirmed, 2 out for delivery, 3 delivered. */
  timelineIndex: 0 | 1 | 2 | 3
  progressPercent: 0 | 33 | 66 | 100
  isTerminal: boolean
  /** False for a status value this app does not know (rendered as "Processing"). */
  isKnown: boolean
}

export interface OrderStatusSource {
  assigned_staff_name?: string | null
  rejection_reason?: string | null
  needs_reassignment?: boolean | null
  delivered_at?: string | null
  updated_at?: string | null
}

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string' && (BOOKING_STATUSES as readonly string[]).includes(value)
}

function formatDeliveredOn(booking?: OrderStatusSource | null) {
  const raw = booking?.delivered_at || booking?.updated_at
  if (!raw) {
    return 'Successfully delivered'
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return 'Successfully delivered'
  }
  return `Delivered on ${parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
}

/**
 * Single source of truth for how a Booking.status is presented to customers.
 * `accepted` means the delivery partner accepted the job; it is NOT out for delivery.
 */
export function getOrderStatusMeta(status: string | null | undefined, booking?: OrderStatusSource | null): OrderStatusMeta {
  const partner = booking?.assigned_staff_name?.trim() || 'your delivery partner'

  switch (status) {
    case 'pending':
      return {
        label: 'Order Placed',
        kind: 'ongoing',
        description: booking?.needs_reassignment ? 'Reassigning your delivery partner' : 'Awaiting confirmation',
        timelineIndex: 0,
        progressPercent: 0,
        isTerminal: false,
        isKnown: true,
      }
    case 'approved':
      return {
        label: 'Order Confirmed',
        kind: 'ongoing',
        description: 'Order confirmed — awaiting dispatch',
        timelineIndex: 1,
        progressPercent: 33,
        isTerminal: false,
        isKnown: true,
      }
    case 'accepted':
      return {
        label: 'Accepted by delivery partner',
        kind: 'ongoing',
        description: `Accepted by ${partner} — preparing for dispatch`,
        timelineIndex: 1,
        progressPercent: 33,
        isTerminal: false,
        isKnown: true,
      }
    case 'out_for_delivery':
      return {
        label: 'Out for Delivery',
        kind: 'ongoing',
        description: `Out for delivery with ${partner}`,
        timelineIndex: 2,
        progressPercent: 66,
        isTerminal: false,
        isKnown: true,
      }
    case 'delivered':
      return {
        label: 'Delivered',
        kind: 'completed',
        description: formatDeliveredOn(booking),
        timelineIndex: 3,
        progressPercent: 100,
        isTerminal: true,
        isKnown: true,
      }
    case 'rejected':
      return {
        label: 'Rejected',
        kind: 'cancelled',
        description: booking?.rejection_reason ? `Reason: ${booking.rejection_reason}` : 'Order could not be fulfilled',
        timelineIndex: 0,
        progressPercent: 0,
        isTerminal: true,
        isKnown: true,
      }
    case 'cancelled':
      return {
        label: 'Cancelled',
        kind: 'cancelled',
        description: 'Order was cancelled',
        timelineIndex: 0,
        progressPercent: 0,
        isTerminal: true,
        isKnown: true,
      }
    default:
      return {
        label: 'Processing',
        kind: 'ongoing',
        description: 'Your order is being processed',
        timelineIndex: 0,
        progressPercent: 0,
        isTerminal: false,
        isKnown: false,
      }
  }
}
