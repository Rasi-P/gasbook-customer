import { useState } from 'react'
import type { ProfileUser } from '../../types'
import { EditProfileModal } from '../common/EditProfileModal'

interface ProfileViewProps {
  user?: ProfileUser
  onProfileUpdated?: () => void
  onLogout: () => void
}

export function ProfileView({
  user = {
    name: 'Customer',
    email: 'Not available',
    phone: 'Not available',
    address: 'Not available',
    memberSince: 'May 2025',
  },
  onProfileUpdated,
  onLogout,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'C'

  const handleOpenEdit = () => {
    setSuccessMessage(null)
    setIsEditing(true)
  }

  const handleCloseEdit = () => {
    setIsEditing(false)
  }

  const handleSaveSuccess = () => {
    setSuccessMessage('Profile updated successfully!')
    setIsEditing(false)
    if (onProfileUpdated) {
      onProfileUpdated()
    }
  }



  return (
    <div className="profile-scroll-container">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="profile-toast-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMessage}</span>
          <button className="toast-dismiss-btn" onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      {/* 1. Profile Hero Card */}
      <div className="profile-hero-card">


        <div className="profile-hero-content">
          <div className="profile-avatar-circle">
            <span className="avatar-initials">{initials}</span>
          </div>
          <div className="profile-hero-text">
            <h1 className="profile-user-name">{user.name}</h1>
            <p className="profile-hero-subtitle">
              Manage your account and saved details.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Account Details Section */}
      <div className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-section-heading">Account Details</h2>
          <button 
            type="button" 
            className="profile-edit-btn" 
            onClick={handleOpenEdit}
            title="Edit profile details"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        </div>

        <div className="profile-card">
          {/* Row 1: Name */}
          <div className="profile-row-item">
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="profile-row-label">Full Name</span>
            </div>
            <span className="profile-row-val">{user.name}</span>
          </div>

          <div className="profile-row-divider" />

          {/* Row 2: Phone */}
          <div className="profile-row-item">
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span className="profile-row-label">Phone Number</span>
            </div>
            <span className="profile-row-val">{user.phone}</span>
          </div>

          <div className="profile-row-divider" />

          {/* Row 3: Email */}
          <div className="profile-row-item">
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <span className="profile-row-label">Email Address</span>
            </div>
            <span className="profile-row-val profile-email-val">{user.email}</span>
          </div>

          <div className="profile-row-divider" />

          {/* Row 4: Address */}
          <div className="profile-row-item">
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className="profile-row-label">Address</span>
            </div>
            <span className="profile-row-val profile-email-val">{user.address}</span>
          </div>

          <div className="profile-row-divider" />

          {/* Row 5: Member Since */}
          <div className="profile-row-item">
            <div className="profile-row-left">
              <div className="profile-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="profile-row-label">Member Since</span>
            </div>
            <span className="profile-row-val">{user.memberSince}</span>
          </div>
        </div>
      </div>

      {/* 3. Account Section */}
      <div className="profile-section">
        <h2 className="profile-section-heading">Account</h2>
        <div className="profile-card">
          {/* Logout */}

          {/* Row 2: Logout */}
          <button className="profile-action-row" onClick={onLogout}>
            <div className="profile-row-left">
              <div className="profile-icon-wrap" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <span className="profile-row-action-label" style={{ color: '#dc2626' }}>Logout</span>
            </div>
            <div className="profile-chevron" style={{ color: '#dc2626' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Edit Profile Modal Dialog */}
      {isEditing && (
        <EditProfileModal
          user={user}
          onClose={handleCloseEdit}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  )
}
