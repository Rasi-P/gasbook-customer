import { useState, useEffect } from 'react'
import { fetchBookingById } from '../../lib/auth'

interface TrackingModalProps {
  bookingId: number
  onClose: () => void
}

export function TrackingModal({ bookingId, onClose }: TrackingModalProps) {
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

  const getTimelineSteps = (code: string | undefined) => {
    if (code === 'cancelled' || code === 'rejected') {
      return [
        { key: 'placed', title: 'Order Placed', isDone: true, isCurrent: false },
        { key: 'terminated', title: code === 'rejected' ? 'Rejected' : 'Cancelled', isDone: true, isCurrent: true }
      ]
    }

    const steps = [
      { key: 'placed', title: 'Order Placed' },
      { key: 'confirmed', title: 'Order Confirmed' },
      { key: 'out_for_delivery', title: 'Out for Delivery' },
      { key: 'delivered', title: 'Delivered' },
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

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: '#FFF', width: '100%', maxWidth: '400px', maxHeight: '90vh', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#132B4F' }}>Live Tracking</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#132B4F' }}>✕</button>
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
          <>
            <div style={{ marginBottom: '20px', background: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Order ID</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{booking.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Cylinder</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{booking.cylinder_type_name || 'Gas Cylinder'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Quantity</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{booking.quantity || 1}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Total Amount</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{booking.total_amount || 0}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#1e293b' }}>Live Status</h3>
            <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div className={`status-pill ${booking.status === 'pending' ? 'pending' : 'ongoing'}`}>
                  <span>{getStatusLabel(booking.status)}</span>
                </div>
              </div>
              
              {booking.status === 'rejected' && booking.rejection_reason && (
                <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', color: '#991B1B', fontSize: '14px', marginBottom: '12px' }}>
                  <strong>Reason:</strong> {booking.rejection_reason}
                </div>
              )}
              
              <div className="timeline-container" style={{ marginTop: '0', padding: '0', background: 'transparent', boxShadow: 'none' }}>
                  {getTimelineSteps(booking.status).map((step, idx, arr) => (
                    <div key={step.key} className="timeline-step" style={{ minHeight: '40px' }}>
                      <div className="timeline-indicator">
                        <div className={`timeline-dot ${step.isDone ? 'active' : ''}`} />
                        <div className={`timeline-line ${step.isDone && arr[idx + 1]?.isDone ? 'active' : ''}`} />
                      </div>
                      <div className="timeline-content">
                        <h4 className={`timeline-title ${step.isDone ? 'active' : ''}`}>{step.title}</h4>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <button
              style={{ width: '100%', padding: '14px', background: '#F1F5F9', color: '#1e293b', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
              onClick={onClose}
            >
              Close
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
