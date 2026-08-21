import { useState, useEffect } from 'react'
import { fetchBookingById } from '../../lib/auth'
import { getCylinderDisplay, getCylinderImage } from '../../lib/formatters'

interface DesktopTrackOrderViewProps {
  bookingId: number
  onBack: () => void
}

export function DesktopTrackOrderView({ bookingId, onBack }: DesktopTrackOrderViewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState<any>(null)

  const loadBooking = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchBookingById(bookingId)
      setBooking(data)
    } catch (err: any) {
      if (err.status === 404) {
        setError('Order not found.')
      } else {
        setError('Unable to load tracking details.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bookingId) {
      void loadBooking()
    }
  }, [bookingId])

  const getTimelineSteps = (code: string | undefined, bookingData: any) => {
    if (code === 'cancelled' || code === 'rejected') {
      return [
        {
          key: 'placed',
          title: 'Order Placed',
          isDone: true,
          isCurrent: false,
          subtitle: bookingData?.created_at
            ? new Date(bookingData.created_at).toLocaleString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Order received',
        },
        {
          key: 'terminated',
          title: code === 'rejected' ? 'Order Rejected' : 'Cancelled',
          isDone: true,
          isCurrent: true,
          subtitle: bookingData?.rejection_reason || 'Order was cancelled.',
        },
      ]
    }

    const steps = [
      {
        key: 'placed',
        title: 'Order Placed',
        subtitle: bookingData?.created_at
          ? new Date(bookingData.created_at).toLocaleString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Your order has been recorded in the system.',
      },
      {
        key: 'confirmed',
        title: 'Order Confirmed',
        subtitle: bookingData?.approved_at
          ? new Date(bookingData.approved_at).toLocaleString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Awaiting distributor confirmation.',
      },
      {
        key: 'out_for_delivery',
        title: 'Out for Delivery',
        subtitle: 'Cylinder is dispatched with your delivery partner.',
      },
      {
        key: 'delivered',
        title: 'Delivered',
        subtitle: bookingData?.delivered_at
          ? new Date(bookingData.delivered_at).toLocaleString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Handover complete at your address.',
      },
    ]

    let currentIndex = 0
    if (code === 'pending') currentIndex = 0
    else if (code === 'approved') currentIndex = 1
    else if (code === 'accepted' || code === 'out_for_delivery') currentIndex = 2
    else if (code === 'delivered') currentIndex = 3

    return steps.map((step, idx) => ({
      ...step,
      isDone: idx <= currentIndex,
      isCurrent: idx === currentIndex,
    }))
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Placed'
      case 'approved':
        return 'Order Confirmed'
      case 'accepted':
      case 'out_for_delivery':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      case 'rejected':
        return 'Order Rejected'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Processing'
    }
  }

  return (
    <div className="desktop-container">
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <button
          onClick={onBack}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '8px 16px',
            color: '#1052be',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back</span>
        </button>

        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>
          Live Delivery Tracking
        </h2>

        <div style={{ width: '80px' }} />
      </div>

      {loading ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#1052be', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', fontSize: '15px' }}>Loading live tracking details...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '24px', border: '1px solid #fee2e2' }}>
          <h3 style={{ color: '#dc2626', margin: '0 0 8px' }}>{error}</h3>
          <button
            onClick={() => void loadBooking()}
            style={{ marginTop: '16px', background: '#1052be', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      ) : booking ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Left Column: Order Summary & Delivery Partner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Order Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Booking Identification
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>
                    #{booking.order_id}
                  </h3>
                </div>
                <span
                  style={{
                    background:
                      booking.status === 'delivered'
                        ? '#dcfce7'
                        : booking.status === 'rejected' || booking.status === 'cancelled'
                        ? '#fee2e2'
                        : '#eff6ff',
                    color:
                      booking.status === 'delivered'
                        ? '#166534'
                        : booking.status === 'rejected' || booking.status === 'cancelled'
                        ? '#991b1b'
                        : '#1052be',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              {/* Product Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', background: '#f8fafc', padding: '18px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
                <img src={getCylinderImage(booking.cylinder_type_name, booking.cylinder_type_weight)} alt="" style={{ height: '64px', objectFit: 'contain' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '2px' }}>
                    {getCylinderDisplay(booking.cylinder_type_name, booking.cylinder_type_weight).title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Size: {getCylinderDisplay(booking.cylinder_type_name, booking.cylinder_type_weight).badge} • Quantity: {booking.quantity || 1}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Total Amount</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                    ₹{booking.total_amount || 0}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5 }}>
                <strong style={{ color: '#1e293b', display: 'block', marginBottom: '4px' }}>Delivery Destination:</strong>
                {booking.delivery_address || 'Registered Customer Address'}
              </div>
            </div>

            {/* Delivery Partner Partner Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
              <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                Assigned Delivery Partner
              </h4>

              {booking.assigned_staff_name ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', padding: '16px', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      👤
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>
                        {booking.assigned_staff_name}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                        Certified GasBook Delivery Executive
                      </div>
                    </div>
                  </div>

                  {booking.assigned_staff_phone && (
                    <a
                      href={`tel:${booking.assigned_staff_phone}`}
                      style={{
                        background: '#1052be',
                        color: '#ffffff',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>📞 Call</span>
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', color: '#64748b', fontSize: '13.5px' }}>
                  Staff assignment pending. A delivery partner will be designated once dispatch begins.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Milestone Timeline */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px' }}>
            <h4 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>
              Dispatch &amp; Handover Progress
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative' }}>
              {getTimelineSteps(booking.status, booking).map((step, idx, arr) => (
                <div key={step.key} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Connecting Line */}
                  {idx < arr.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '19px',
                        top: '40px',
                        bottom: '-28px',
                        width: '2px',
                        background: step.isDone && arr[idx + 1]?.isDone ? '#22c55e' : '#e2e8f0',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Icon/Dot */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: step.isDone ? '#22c55e' : '#f8fafc',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      border: step.isDone ? 'none' : '2px solid #cbd5e1',
                      boxShadow: step.isDone ? '0 4px 10px rgba(34, 197, 94, 0.3)' : 'none',
                    }}
                  >
                    {step.isDone ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: step.isDone ? '#1e293b' : '#64748b' }}>
                      {step.title}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
