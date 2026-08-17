import { useState, useEffect } from 'react'
import type { ProfileUser } from '../../types'
import { updateCustomerProfile, getApiErrorDetails } from '../../lib/auth'

interface EditProfileModalProps {
  user: ProfileUser
  onClose: () => void
  onSuccess: () => void
}

export function EditProfileModal({ user, onClose, onSuccess }: EditProfileModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formValues, setFormValues] = useState({
    name: user.name === 'Customer' ? '' : user.name,
    phone: user.phone === 'Not available' ? '' : user.phone,
    email: user.email === 'Not available' ? '' : user.email,
    address: user.address === 'Not available' ? '' : user.address,
  })

  // Sync form values when user prop updates
  useEffect(() => {
    setFormValues({
      name: user.name === 'Customer' ? '' : user.name,
      phone: user.phone === 'Not available' ? '' : user.phone,
      email: user.email === 'Not available' ? '' : user.email,
      address: user.address === 'Not available' ? '' : user.address,
    })
  }, [user])

  const handleClose = () => {
    if (isSaving) return
    onClose()
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!formValues.name.trim()) {
      setErrorMessage('Full name is required.')
      return
    }

    if (formValues.phone.trim() && !/^\d+$/.test(formValues.phone.trim())) {
      setErrorMessage('Phone number must contain only numbers.')
      return
    }

    setIsSaving(true)

    try {
      if (user.profileId) {
        await updateCustomerProfile(user.profileId, {
          name: formValues.name.trim(),
          phone: formValues.phone.trim(),
          email: formValues.email.trim(),
          address: formValues.address.trim(),
        })
      }
      onSuccess()
    } catch (err: unknown) {
      const details = getApiErrorDetails(err, 'Failed to update profile. Please try again.')
      setErrorMessage(details.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="edit-profile-modal-overlay" onClick={handleClose}>
      <div className="edit-profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <div className="edit-modal-title-wrap">
            <div className="edit-modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h3 className="edit-modal-title">Edit Profile</h3>
              <p className="edit-modal-subtitle">Update your personal account details</p>
            </div>
          </div>
          <button type="button" className="edit-modal-close" onClick={handleClose}>×</button>
        </div>

        {errorMessage && (
          <div className="edit-modal-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="edit-modal-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="edit-name" className="form-label">Full Name *</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="edit-name"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="edit-phone" className="form-label">Phone Number</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <input
                id="edit-phone"
                type="tel"
                className="form-input"
                placeholder="Enter mobile number"
                value={formValues.phone}
                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="edit-email" className="form-label">Email Address</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="edit-email"
                type="email"
                className="form-input"
                placeholder="Enter email address"
                value={formValues.email}
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
              />
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="edit-address" className="form-label">Address</label>
            <div className="input-with-icon align-top">
              <svg className="input-icon icon-top" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <textarea
                id="edit-address"
                className="form-textarea"
                rows={3}
                placeholder="Enter full delivery address"
                value={formValues.address}
                onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
              />
            </div>
          </div>

          <div className="edit-modal-actions">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn-save"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-small" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
