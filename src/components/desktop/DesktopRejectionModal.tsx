import { getCylinderImage } from '../../lib/formatters'

interface DesktopRejectionModalProps {
  order: any
  onClose: () => void
  onOrderAgain: (productName: string, price?: number, cylinderTypeId?: number) => void
}

export function DesktopRejectionModal({
  order,
  onClose,
  onOrderAgain,
}: DesktopRejectionModalProps) {
  if (!order) return null

  const rawBooking = order.rawBooking || {}
  const rejectionReason = rawBooking.rejection_reason || 'No specific reason provided.'
  const rejectedDate = rawBooking.rejected_at
    ? new Date(rawBooking.rejected_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : order.date

  const handleBookAgain = () => {
    if (!rawBooking.cylinder_type_id) {
      alert('This cylinder is currently unavailable.')
      return
    }
    onClose()
    onOrderAgain(
      order.productName,
      parseFloat(rawBooking.rate || '0'),
      rawBooking.cylinder_type_id
    )
  }

  return (
    <div className="desktop-modal-backdrop" onClick={onClose}>
      <div className="desktop-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                Rejection Details
              </h3>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{order.orderNumber}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Cylinder summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: '#f8fafc',
            padding: '14px 16px',
            borderRadius: '14px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          <img src={getCylinderImage(order.productName, order.weight)} alt="" style={{ height: '40px', objectFit: 'contain' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{order.productName}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{order.weight} • {order.price}</div>
          </div>
          <span
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Rejected
          </span>
        </div>

        {/* Reason Box */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #fed7aa',
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#ea580c',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px',
            }}
          >
            Reason for Rejection
          </div>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '14.5px',
              color: '#1e293b',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {rejectionReason}
          </p>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            Updated: {rejectedDate}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '13px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={handleBookAgain}
            style={{
              flex: 1.5,
              padding: '13px',
              background: '#1052be',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Book Again</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
