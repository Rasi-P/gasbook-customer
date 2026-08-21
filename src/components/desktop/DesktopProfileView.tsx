import { useState } from 'react'
import type { ProfileUser } from '../../types'
import { EditProfileModal } from '../common/EditProfileModal'

interface DesktopProfileViewProps {
  user?: ProfileUser
  onProfileUpdated?: () => void
  onLogout: () => void
}

export function DesktopProfileView({
  user = {
    name: 'Customer',
    email: 'Not available',
    phone: 'Not available',
    address: 'Not available',
    memberSince: 'May 2025',
  },
  onProfileUpdated,
  onLogout,
}: DesktopProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'C'

  const handleSaveSuccess = () => {
    setSuccessMessage('Profile updated successfully!')
    setIsEditing(false)
    if (onProfileUpdated) {
      onProfileUpdated()
    }
  }

  return (
    <div className="desktop-container" style={{ maxWidth: '960px' }}>
      {/* Toast Notification */}
      {successMessage && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '14px 20px',
            borderRadius: '14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(22, 101, 52, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Profile Hero Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d3b8f 0%, #1052be 100%)',
          borderRadius: '24px',
          padding: '36px 40px',
          color: '#ffffff',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 30px rgba(16, 82, 190, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#1052be',
              fontSize: '28px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            }}
          >
            {initials}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>
              {user.name}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Member Since: {user.memberSince}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          style={{
            background: '#ffffff',
            color: '#1052be',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>Edit Profile</span>
        </button>
      </div>

      {/* 2. Account Details Grid */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          marginBottom: '28px',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
        }}
      >
        <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
          Personal &amp; Delivery Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Full Name */}
          <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Full Name
            </span>
            <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
              {user.name}
            </div>
          </div>

          {/* Phone */}
          <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phone Number
            </span>
            <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
              {user.phone || 'Not provided'}
            </div>
          </div>

          {/* Email */}
          <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </span>
            <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
              {user.email || 'Not provided'}
            </div>
          </div>

          {/* Member Since */}
          <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Account Created
            </span>
            <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
              {user.memberSince}
            </div>
          </div>

          {/* Full Address Span 2 */}
          <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '18px 20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Primary Delivery Address
            </span>
            <div style={{ fontSize: '15px', color: '#1e293b', marginTop: '4px', lineHeight: 1.5 }}>
              {user.address || 'No address specified'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Account Actions */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px 32px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
            Account Session
          </h4>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Safely sign out from this browser session.
          </p>
        </div>

        <button
          onClick={onLogout}
          style={{
            background: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: '12px',
            padding: '11px 22px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  )
}
