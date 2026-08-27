import type { ChangeEvent } from 'react'
import sabcoLogo from '../../assets/sabco_logo.png'

interface ForgotPasswordRequestScreenProps {
  username: string
  supportContactName: string
  supportWhatsappLink: string | null
  supportWhatsappAvailable: boolean
  onUsernameChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBackToLogin: () => void
  onOpenWhatsapp: () => void
}

export function ForgotPasswordRequestScreen({
  username,
  supportContactName,
  supportWhatsappLink,
  supportWhatsappAvailable,
  onUsernameChange,
  onBackToLogin,
  onOpenWhatsapp,
}: ForgotPasswordRequestScreenProps) {
  const isRequestDisabled = !supportWhatsappLink

  return (
    <div className="legacy-auth-shell">
      <div className="login-screen">
        <div className="login-header">
          <img src={sabcoLogo} className="login-brand-logo" alt="Sabco logo" />
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Request Password Reset</h2>
            <p>Only admin can send a temporary password for your account.</p>
          </div>

          <div className="login-form">
            <div className="form-group">
              <label htmlFor="forgot-username">Username</label>
              <div className="input-wrapper input-wrapper--plain">
                <input
                  id="forgot-username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={onUsernameChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="request-note">
              <p className="request-note__title">Important</p>
              <p>
                Admin should send only a temporary password on WhatsApp. After you log in with that password, you must
                change it immediately.
              </p>
            </div>

            <div className="request-steps">
              <p>1. Confirm your username.</p>
              <p>2. Tap the WhatsApp button to request a temporary password from {supportContactName}.</p>
              <p>3. Log in with the temporary password.</p>
              <p>4. Change your password on the next screen.</p>
            </div>

            {!supportWhatsappAvailable ? (
              <p className="form-feedback form-feedback--error">
                Admin WhatsApp contact is not available right now. Please contact the distributor directly.
              </p>
            ) : null}

            <button type="button" className="btn-primary" disabled={isRequestDisabled} onClick={onOpenWhatsapp}>
              REQUEST ON WHATSAPP
            </button>

            <button type="button" className="btn-secondary" onClick={onBackToLogin}>
              BACK TO LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
