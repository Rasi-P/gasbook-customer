import { useState, useEffect } from 'react'
import { fetchBookingById } from '../../lib/auth'

interface TrackOrderViewProps {
  bookingId: number
  onBack: () => void
}

export function TrackOrderView({ bookingId, onBack }: TrackOrderViewProps) {
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
        setError("Order not found.")
      } else {
        setError("Unable to load order details.")
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
          subtitle: bookingData?.created_at ? new Date(bookingData.created_at).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Order successfully placed.'
        },
        { 
          key: 'terminated', 
          title: code === 'rejected' ? 'Rejected' : 'Cancelled', 
          isDone: true, 
          isCurrent: true,
          subtitle: bookingData?.rejection_reason || 'Order was cancelled.'
        }
      ]
    }

    const steps = [
      { key: 'placed', title: 'Order Placed', 
        subtitle: bookingData?.created_at ? new Date(bookingData.created_at).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Your order has been placed successfully.' },
      { key: 'confirmed', title: 'Order Confirmed', subtitle: 'Pending' },
      { key: 'out_for_delivery', title: 'Out for Delivery', subtitle: 'Pending' },
      { key: 'delivered', title: 'Delivered', subtitle: 'Pending' },
    ]

    let currentIndex = 0
    if (code === 'pending') currentIndex = 0
    else if (code === 'approved') currentIndex = 1
    else if (code === 'accepted' || code === 'out_for_delivery') currentIndex = 2
    else if (code === 'delivered') currentIndex = 3

    if (currentIndex >= 1) steps[1].subtitle = bookingData?.approved_at ? new Date(bookingData.approved_at).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Your order is confirmed.'
    if (currentIndex >= 2) steps[2].subtitle = 'Your order is out for delivery.'
    if (currentIndex >= 3) steps[3].subtitle = bookingData?.delivered_at ? new Date(bookingData.delivered_at).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Delivered successfully.'

    return steps.map((step, idx) => ({
      ...step,
      isDone: idx <= currentIndex,
      isCurrent: idx === currentIndex,
    }))
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed'
      case 'approved': return 'Order Confirmed'
      case 'accepted': return 'Accepted'
      case 'out_for_delivery': return 'Out for Delivery'
      case 'delivered': return 'Delivered'
      case 'rejected': return 'Rejected'
      case 'cancelled': return 'Cancelled'
      default: return 'Processing'
    }
  }

  const isTerminalState = booking?.status === 'delivered' || booking?.status === 'rejected' || booking?.status === 'cancelled'

  return (
    <div className="track-order-page" style={{ padding: '20px', minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 8px 8px 0', color: '#132B4F' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '1.25rem', color: '#132B4F', paddingRight: '32px' }}>Track Order</h1>
      </div>

      {loading ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b' }}>Loading tracking details...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2 className="empty-title" style={{ color: '#ef4444' }}>{error}</h2>
          <button className="empty-explore-btn" onClick={() => void loadBooking()} style={{ marginTop: '16px' }}>
            <span>Try Again</span>
          </button>
        </div>
      ) : booking ? (
        <div style={{ paddingBottom: '80px' }}>
          {/* Order Summary Card */}
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Order ID</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>#GB{booking.id}</div>
              </div>
              <div style={{ 
                background: booking.status === 'delivered' ? '#DCFCE7' : (booking.status === 'rejected' || booking.status === 'cancelled') ? '#FEE2E2' : '#E0F2FE', 
                color: booking.status === 'delivered' ? '#166534' : (booking.status === 'rejected' || booking.status === 'cancelled') ? '#991B1B' : '#0369A1', 
                padding: '6px 12px', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                fontWeight: 600 
              }}>
                {getStatusLabel(booking.status)}
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #F1F5F9', margin: '16px 0' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>Cylinder</div>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem' }}>{booking.cylinder_type_name || 'Gas Cylinder'}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>Quantity</div>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem' }}>{booking.quantity || 1}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>Total Amount</div>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem' }}>₹{booking.total_amount || 0}</div>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div style={{ background: '#FFF', padding: '24px 20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '24px' }}>
            <div className="tracking-timeline-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {getTimelineSteps(booking.status, booking).map((step, idx, arr) => (
                <div key={step.key} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Line segment connecting dots */}
                  {idx < arr.length - 1 && (
                    <div style={{ 
                      position: 'absolute', 
                      left: '19px', 
                      top: '40px', 
                      bottom: '-32px', 
                      width: '2px', 
                      background: step.isDone && arr[idx + 1]?.isDone ? '#22C55E' : '#E2E8F0',
                      zIndex: 1
                    }}></div>
                  )}
                  
                  {/* Icon/Dot */}
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: step.isDone ? '#22C55E' : '#F1F5F9',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    zIndex: 2,
                    border: step.isDone ? 'none' : '1px solid #E2E8F0'
                  }}>
                    {step.isDone ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E1' }}></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600, color: step.isDone ? '#1E293B' : '#64748B' }}>
                      {step.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: '1.4' }}>
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Delivery / Info Card */}
          {!isTerminalState && (
            <div style={{ background: '#EFF6FF', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: '#2563EB', marginTop: '2px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <div style={{ color: '#1D4ED8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Estimated Delivery</div>
                {booking.status === 'pending' ? (
                  <>
                    <div style={{ color: '#1E3A8A', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Pending Confirmation</div>
                    <div style={{ color: '#1E3A8A', fontSize: '0.9rem' }}>We'll provide an estimated delivery time once your order is confirmed.</div>
                  </>
                ) : (
                  <>
                    <div style={{ color: '#1E3A8A', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Coming soon</div>
                    <div style={{ color: '#1E3A8A', fontSize: '0.9rem' }}>We'll notify you when your order is on the way.</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
