import { useEffect, useState } from 'react'
import { fetchBookingById, type BookingRecord } from '../../lib/auth'
import { formatDateTime } from '../../lib/dateTime'
import { buildOrderPrice, formatMoney } from '../../lib/pricing'
import { getOrderStatusMeta } from '../../lib/orderStatus'
import { OrderItemList } from './OrderItemList'
import { PaymentSummary } from './PaymentSummary'
import { ReceiptActions } from '../receipt/ReceiptActions'
import '../../styles/order-tracking.css'

type TrackingBooking = BookingRecord & { delivery_address?: string; rejected_at?: string | null }
export interface OrderTrackingProps { bookingId: number; onBack: () => void }

export function TrackingProgress({ booking }: { booking: TrackingBooking }) {
  const meta = getOrderStatusMeta(booking.status, booking)
  const cancelled = meta.kind === 'cancelled'
  const steps = cancelled ? [
    { title: 'Order Placed', text: formatDateTime(booking.created_at), done: true },
    { title: booking.status === 'rejected' ? 'Order Rejected' : 'Cancelled', text: `${booking.rejection_reason || 'Order was cancelled.'} · ${formatDateTime(booking.rejected_at)}`, done: true },
  ] : [
    { title: 'Order Placed', text: formatDateTime(booking.created_at), done: true },
    { title: 'Order Confirmed', text: booking.status === 'accepted' || booking.needs_reassignment ? meta.description : meta.timelineIndex >= 1 ? formatDateTime(booking.approved_at) : 'Awaiting confirmation.', done: meta.timelineIndex >= 1 },
    { title: 'Out for Delivery', text: meta.timelineIndex >= 2 ? 'Your order has been dispatched.' : 'Awaiting dispatch.', done: meta.timelineIndex >= 2 },
    { title: 'Delivered', text: meta.timelineIndex >= 3 ? formatDateTime(booking.delivered_at) : 'Awaiting delivery.', done: meta.timelineIndex >= 3 },
  ]
  return <section className="order-tracking__card order-tracking__progress" aria-label="Delivery progress">
    <h2>Delivery progress</h2>
    <ol className={cancelled ? 'order-tracking__timeline order-tracking__timeline--cancelled' : 'order-tracking__timeline'}>
      {steps.map((step, index) => <li key={step.title} className={step.done ? 'is-done' : ''} aria-current={index === (cancelled ? 1 : meta.timelineIndex) ? 'step' : undefined}>
        <span className="order-tracking__dot" aria-hidden="true">{step.done ? '✓' : index + 1}</span>
        <div><h3>{step.title}</h3><p>{step.text}</p></div>
      </li>)}
    </ol>
  </section>
}

export function OrderTracking({ bookingId, onBack }: OrderTrackingProps) {
  const [booking, setBooking] = useState<TrackingBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchBookingById(bookingId).then(data => { if (!cancelled) setBooking(data) }).catch((err: unknown) => {
      if (!cancelled) setError(err && typeof err === 'object' && 'status' in err && err.status === 404 ? 'Order not found.' : 'Unable to load tracking details.')
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [bookingId, retry])
  const meta = getOrderStatusMeta(booking?.status, booking)
  const pricing = booking ? buildOrderPrice(booking, '—') : null
  return <div className="order-tracking">
    <header className="order-tracking__header"><button type="button" onClick={onBack}><span aria-hidden="true">←</span> Back</button><h1>Delivery tracking</h1></header>
    {loading ? <div className="order-tracking__card order-tracking__notice" role="status">Loading tracking details…</div> : error ?
      <div className="order-tracking__card order-tracking__notice" role="alert"><p>{error}</p><button type="button" onClick={() => setRetry(value => value + 1)}>Retry</button></div> : booking && <>
      <section className="order-tracking__identity" aria-label="Booking details">
        <div><span>Booking number</span><h2>#{booking.order_id}</h2><p>Booked {formatDateTime(booking.created_at)}</p></div>
        <strong className={`order-tracking__status order-tracking__status--${meta.kind}`}>{booking.status === 'rejected' ? 'Order Rejected' : meta.label}</strong>
      </section>
      <div className="order-tracking__grid">
        <section className="order-tracking__card order-tracking__items" aria-label="Order items and payment">
          <h2>Your items</h2>
          <OrderItemList order={booking} />
          <div className="order-tracking__totals">
            {pricing?.hasDiscount && <><div><span>Subtotal</span><strong>{formatMoney(pricing.originalAmount)}</strong></div><div className="order-tracking__discount"><span>Discount</span><strong>−{formatMoney(booking.discount_amount)}</strong></div></>}
            <div className="order-tracking__total"><strong>Order total</strong><strong>{pricing?.price}</strong></div>
          </div>
          <PaymentSummary value={booking.payment_summary} />
          <ReceiptActions order={booking} showDownload={false} />
        </section>
        <TrackingProgress booking={booking} />
        <section className="order-tracking__card order-tracking__delivery" aria-label="Delivery details">
          <h2>Delivery details</h2>
          <div className="order-tracking__address"><h3>Delivery address</h3><p>{booking.delivery_address || 'Address unavailable'}</p></div>
          <div className="order-tracking__partner"><div><h3>Delivery partner</h3><p>{booking.assigned_staff_name || (meta.kind === 'cancelled' ? 'No delivery partner assigned' : booking.needs_reassignment ? 'Reassignment in progress' : 'Assignment pending')}</p></div>
            {booking.assigned_staff_name && booking.assigned_staff_phone && <a href={`tel:${booking.assigned_staff_phone}`}>Call</a>}
          </div>
          {!meta.isTerminal && <p className="order-tracking__info">{booking.status === 'pending' ? "We’ll update you once your order is confirmed." : "We’ll notify you as your delivery progresses."}</p>}
        </section>
      </div>
    </>}
  </div>
}
