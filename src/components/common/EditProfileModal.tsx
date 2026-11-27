import { useState, useEffect } from 'react'
import type { ProfileUser } from '../../types'
import { PROFILE_FIELD_LIMITS, updateCustomerProfile, getApiErrorDetails } from '../../lib/auth'

interface EditProfileModalProps {
  user: ProfileUser
  onClose: () => void
  onSuccess: () => void
}

type ProfileField = 'name' | 'phone' | 'email' | 'address'
type ProfileFieldErrors = Partial<Record<ProfileField, string>>

const PROFILE_FIELDS: readonly ProfileField[] = ['name', 'phone', 'email', 'address']

function isProfileField(value: string): value is ProfileField {
  return (PROFILE_FIELDS as readonly string[]).includes(value)
}

/** Client-side checks mirroring the backend limits (name ≤150, phone digits ≤20, email ≤254). */
function validateProfileForm(values: { name: string; phone: string; email: string }): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {}
  const name = values.name.trim()
  const phone = values.phone.trim()
  const email = values.email.trim()

  if (!name) {
    errors.name = 'Full name is required.'
  } else if (name.length > PROFILE_FIELD_LIMITS.name) {
    errors.name = `Full name must be ${PROFILE_FIELD_LIMITS.name} characters or fewer.`
  }

  if (phone && !/^\d+$/.test(phone)) {
    errors.phone = 'Phone number must contain only numbers.'
  } else if (phone.length > PROFILE_FIELD_LIMITS.phone) {
    errors.phone = `Phone number must be ${PROFILE_FIELD_LIMITS.phone} digits or fewer.`
  }

  if (email.length > PROFILE_FIELD_LIMITS.email) {
    errors.email = `Email must be ${PROFILE_FIELD_LIMITS.email} characters or fewer.`
  }

  return errors
}

export function EditProfileModal({ user, onClose, onSuccess }: EditProfileModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({})

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

  const updateField = (field: ProfileField, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const validationErrors = validateProfileForm(formValues)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      return
    }
    setFieldErrors({})

    setIsSaving(true)

    try {
      if (!user.profileId) {
        // Nothing to PATCH: do not pretend the save succeeded.
        setErrorMessage('No customer profile is linked to this account. Please contact support.')
        return
      }
      await updateCustomerProfile(user.profileId, {
        name: formValues.name.trim(),
        phone: formValues.phone.trim(),
        email: formValues.email.trim(),
        address: formValues.address.trim(),
      })
      onSuccess()
    } catch (err: unknown) {
      const details = getApiErrorDetails(err, 'Failed to update profile. Please try again.')

      // Per-field server errors ({"phone": ["..."]} and/or {"field": "phone", "detail": "..."}) go under the input;
      // the banner is reserved for errors that do not belong to a field.
      const serverFieldErrors: ProfileFieldErrors = {}
      for (const [key, message] of Object.entries(details.fieldErrors)) {
        if (isProfileField(key) && message) {
          serverFieldErrors[key] = message
        }
      }
      if (details.field && isProfileField(details.field) && !serverFieldErrors[details.field]) {
        serverFieldErrors[details.field] = details.message
      }

      setFieldErrors(serverFieldErrors)
      if (Object.keys(serverFieldErrors).length === 0) {
        setErrorMessage(details.message)
      }
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
                onChange={(e) => updateField('name', e.target.value)}
                maxLength={PROFILE_FIELD_LIMITS.name}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'edit-name-error' : undefined}
                required
              />
            </div>
            {fieldErrors.name && <p id="edit-name-error" className="field-feedback">{fieldErrors.name}</p>}
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
                onChange={(e) => updateField('phone', e.target.value)}
                maxLength={PROFILE_FIELD_LIMITS.phone}
                inputMode="numeric"
                pattern="[0-9]*"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? 'edit-phone-error' : undefined}
              />
            </div>
            {fieldErrors.phone && <p id="edit-phone-error" className="field-feedback">{fieldErrors.phone}</p>}
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
                onChange={(e) => updateField('email', e.target.value)}
                maxLength={PROFILE_FIELD_LIMITS.email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'edit-email-error' : undefined}
              />
            </div>
            {fieldErrors.email && <p id="edit-email-error" className="field-feedback">{fieldErrors.email}</p>}
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
                onChange={(e) => updateField('address', e.target.value)}
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={fieldErrors.address ? 'edit-address-error' : undefined}
              />
            </div>
            {fieldErrors.address && <p id="edit-address-error" className="field-feedback">{fieldErrors.address}</p>}
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
