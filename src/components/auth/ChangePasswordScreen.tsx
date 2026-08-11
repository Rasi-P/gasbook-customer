import type { ChangeEvent, FormEvent } from 'react'
import sabcoLogo from '../../assets/sabco_logo.png'
import type { PasswordFieldErrors } from '../../types'
import { LegacyPasswordInput } from '../common/LegacyPasswordInput'

interface ChangePasswordScreenProps {
  displayName: string
  passwordForm: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
  showCurrentPassword: boolean
  showNewPassword: boolean
  showConfirmPassword: boolean
  passwordFieldErrors: PasswordFieldErrors
  changePasswordError: string | null
  isPasswordSubmitting: boolean
  updatePasswordField: (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => (event: ChangeEvent<HTMLInputElement>) => void
  setShowCurrentPassword: (value: boolean | ((prev: boolean) => boolean)) => void
  setShowNewPassword: (value: boolean | ((prev: boolean) => boolean)) => void
  setShowConfirmPassword: (value: boolean | ((prev: boolean) => boolean)) => void
  handlePasswordSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

export function ChangePasswordScreen({
  displayName,
  passwordForm,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  passwordFieldErrors,
  changePasswordError,
  isPasswordSubmitting,
  updatePasswordField,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  handlePasswordSubmit,
}: ChangePasswordScreenProps) {
  return (
    <div className="legacy-auth-shell">
      <div className="login-screen">
        <div className="login-header">
          <img src={sabcoLogo} className="login-brand-logo" alt="Sabco logo" />
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome {displayName} 👋</h2>
            <p>Please change your password to continue</p>
          </div>

          <form className="login-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <LegacyPasswordInput
                id="current-password"
                value={passwordForm.currentPassword}
                placeholder="Current Password"
                visible={showCurrentPassword}
                onChange={updatePasswordField('currentPassword')}
                onToggle={() => setShowCurrentPassword((value) => !value)}
                autoComplete="current-password"
              />
              {passwordFieldErrors.current_password ? (
                <p className="field-feedback">{passwordFieldErrors.current_password}</p>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <LegacyPasswordInput
                id="new-password"
                value={passwordForm.newPassword}
                placeholder="New Password"
                visible={showNewPassword}
                onChange={updatePasswordField('newPassword')}
                onToggle={() => setShowNewPassword((value) => !value)}
                autoComplete="new-password"
              />
              {passwordFieldErrors.new_password ? <p className="field-feedback">{passwordFieldErrors.new_password}</p> : null}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <LegacyPasswordInput
                id="confirm-password"
                value={passwordForm.confirmPassword}
                placeholder="Confirm Password"
                visible={showConfirmPassword}
                onChange={updatePasswordField('confirmPassword')}
                onToggle={() => setShowConfirmPassword((value) => !value)}
                autoComplete="new-password"
              />
              {passwordFieldErrors.confirm_new_password ? (
                <p className="field-feedback">{passwordFieldErrors.confirm_new_password}</p>
              ) : null}
            </div>

            <ul className="password-hints">
              <li>At least 8 characters</li>
              <li>Include number &amp; symbol</li>
            </ul>

            {changePasswordError ? <p className="form-feedback form-feedback--error">{changePasswordError}</p> : null}

            <button type="submit" className="btn-primary" disabled={isPasswordSubmitting}>
              {isPasswordSubmitting ? 'SAVING...' : 'SAVE PASSWORD'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
