import type { ChangeEvent, FormEvent } from 'react'
import sabcoLogo from '../../assets/sabco_logo.png'
import { UserIcon } from '../common/Icons'
import { LegacyPasswordInput } from '../common/LegacyPasswordInput'

interface LoginScreenProps {
  loginForm: {
    username: string
    password: string
    rememberMe: boolean
  }
  showLoginPassword: boolean
  isLoginSubmitting: boolean
  loginError: string | null
  updateLoginField: (field: 'username' | 'password') => (event: ChangeEvent<HTMLInputElement>) => void
  setShowLoginPassword: (value: boolean | ((prev: boolean) => boolean)) => void
  setLoginForm: React.Dispatch<React.SetStateAction<{ username: string; password: string; rememberMe: boolean }>>
  handleLoginSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

export function LoginScreen({
  loginForm,
  showLoginPassword,
  isLoginSubmitting,
  loginError,
  updateLoginField,
  setShowLoginPassword,
  setLoginForm,
  handleLoginSubmit,
}: LoginScreenProps) {
  return (
    <div className="legacy-auth-shell">
      <div className="login-screen">
        <div className="login-header">
          <img src={sabcoLogo} className="login-brand-logo" alt="Sabco logo" />
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome Back 👋</h2>
            <p>Please login to continue</p>
          </div>

          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <UserIcon />
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={updateLoginField('username')}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <LegacyPasswordInput
                id="login-password"
                value={loginForm.password}
                placeholder="Password"
                visible={showLoginPassword}
                onChange={updateLoginField('password')}
                onToggle={() => setShowLoginPassword((value) => !value)}
                autoComplete="current-password"
              />
            </div>

            <div className="form-actions">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={loginForm.rememberMe}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      rememberMe: event.target.checked,
                    }))
                  }
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-link">
                Forgot Password?
              </button>
            </div>

            {loginError ? <p className="form-feedback form-feedback--error">{loginError}</p> : null}

            <button type="submit" className="btn-primary" disabled={isLoginSubmitting}>
              {isLoginSubmitting ? 'SIGNING IN...' : 'LOGIN'}
            </button>
          </form>

          <div className="login-footer">
            <p>Need Help?</p>
            <button type="button" className="contact-link">
              Distributor Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
