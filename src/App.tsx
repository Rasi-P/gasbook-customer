import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import homeUiReference from './assets/home_ui_reference.png'
import sabcoLogo from './assets/sabco_logo.png'
import splashBg from './assets/splash_bg.png'
import splashCylinder from './assets/splash_cylinder.png'
import {
  changePassword,
  getApiErrorDetails,
  getCurrentUser,
  hasStoredSession,
  login,
  logout,
  type CurrentUser,
} from './lib/auth'

type ScreenType = 'splash' | 'login' | 'change-password' | 'password-success' | 'home'
type NextScreen = Exclude<ScreenType, 'splash'>

type PasswordFieldErrors = {
  current_password?: string
  new_password?: string
  confirm_new_password?: string
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 3l18 18m-9.57-3C6.98 18 4 12 4 12a14.6 14.6 0 0 1 3.27-4.19M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88M14.12 14.12 9.88 9.88m4.45-4.1C18.44 7.1 20 12 20 12s-1.54 4.9-5.67 6.22M12 6c-1.05 0-2.04.2-2.95.56"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7fb1ff" />
          <stop offset="100%" stopColor="#1e5eff" />
        </linearGradient>
      </defs>
      <path
        d="M60 10c11 9 25 14 38 15v28c0 26-16 42-38 57C38 95 22 79 22 53V25c13-1 27-6 38-15Z"
        fill="url(#shieldGradient)"
      />
      <path
        d="M60 22c8 6 17 10 28 12v19c0 18-10 29-28 42-18-13-28-24-28-42V34c11-2 20-6 28-12Z"
        fill="#2d6cff"
        opacity="0.34"
      />
      <path
        d="m48.5 60.5 8 8 17-20"
        fill="none"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function LegacyPasswordInput({
  id,
  value,
  placeholder,
  visible,
  onChange,
  onToggle,
  autoComplete,
}: {
  id: string
  value: string
  placeholder: string
  visible: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onToggle: () => void
  autoComplete?: string
}) {
  return (
    <div className="input-wrapper">
      <LockIcon />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={onToggle}
        aria-label={visible ? `Hide ${placeholder}` : `Show ${placeholder}`}
      >
        <EyeIcon open={!visible} />
      </button>
    </div>
  )
}

function ScreenFrame({
  children,
  screen,
}: {
  children: ReactNode
  screen: Exclude<ScreenType, 'splash' | 'login' | 'change-password'>
}) {
  return (
    <div className={`app-root app-root--auth app-root--${screen}`}>
      <div className="phone-shell">
        <div className="phone-screen auth-screen">{children}</div>
      </div>
    </div>
  )
}

function HomeScreen() {
  return (
    <div className="home-root">
      <div className="home-reference-frame">
        <img src={homeUiReference} alt="GasBook home screen reference" className="home-reference-image" />
      </div>
    </div>
  )
}

function resolvePostLoginScreen(user: CurrentUser | null, mustChangePassword: boolean): NextScreen {
  if (user?.must_change_password || mustChangePassword) {
    return 'change-password'
  }

  return 'home'
}

function buildFallbackUser(username: string, userId: number | undefined, mustChangePassword: boolean): CurrentUser {
  return {
    id: userId ?? 0,
    username,
    name: username,
    role: 'customer',
    redirect: null,
    must_change_password: mustChangePassword,
    vehicle_location_name: null,
  }
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash')
  const [postSplashScreen, setPostSplashScreen] = useState<NextScreen>('login')
  const [isSplashReady, setIsSplashReady] = useState(false)
  const [isBootstrapComplete, setIsBootstrapComplete] = useState(false)
  const [authUser, setAuthUser] = useState<CurrentUser | null>(null)

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    rememberMe: false,
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [loginError, setLoginError] = useState<string | null>(null)
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<PasswordFieldErrors>({})
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsSplashReady(true)
    }, 2300)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let isCancelled = false

    const bootstrapSession = async () => {
      let nextScreen: NextScreen = 'login'
      let restoredUser: CurrentUser | null = null
      let restoreError: string | null = null

      if (hasStoredSession()) {
        try {
          restoredUser = await getCurrentUser()
          nextScreen = resolvePostLoginScreen(restoredUser, restoredUser.must_change_password)
        } catch (error) {
          const details = getApiErrorDetails(error, 'Unable to restore your session. Please sign in again.')
          await logout()
          restoreError =
            details.status === 401
              ? 'Your session expired. Please sign in again.'
              : details.message || 'Unable to restore your session. Please sign in again.'
        }
      }

      if (isCancelled) {
        return
      }

      setAuthUser(restoredUser)
      setPostSplashScreen(nextScreen)
      setLoginError(restoreError)
      setIsBootstrapComplete(true)
    }

    void bootstrapSession()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (currentScreen === 'splash' && isSplashReady && isBootstrapComplete) {
      setCurrentScreen(postSplashScreen)
    }
  }, [currentScreen, isBootstrapComplete, isSplashReady, postSplashScreen])

  useEffect(() => {
    const requiresAuth =
      currentScreen === 'change-password' || currentScreen === 'password-success' || currentScreen === 'home'

    if (!requiresAuth || hasStoredSession()) {
      return
    }

    setAuthUser(null)
    setCurrentScreen('login')
    setLoginError('Please sign in to continue.')
  }, [currentScreen])

  const displayName = authUser?.name?.trim() || authUser?.username || loginForm.username.trim() || 'Customer'

  const updateLoginField = (field: 'username' | 'password') => (event: ChangeEvent<HTMLInputElement>) => {
    setLoginForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const updatePasswordField =
    (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => (event: ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
      setPasswordFieldErrors((current) => ({
        ...current,
        [field === 'currentPassword'
          ? 'current_password'
          : field === 'newPassword'
            ? 'new_password'
            : 'confirm_new_password']: undefined,
      }))
      setChangePasswordError(null)
    }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const username = loginForm.username.trim()
    if (!username || !loginForm.password) {
      setLoginError('Username and password are required.')
      return
    }

    setIsLoginSubmitting(true)
    setLoginError(null)

    try {
      const tokenResponse = await login(username, loginForm.password, loginForm.rememberMe)

      let user: CurrentUser

      try {
        user = await getCurrentUser()
      } catch (error) {
        const details = getApiErrorDetails(error, 'Unable to load your account details.')
        if (details.status === 401) {
          throw error
        }
        user = buildFallbackUser(username, tokenResponse.user_id, tokenResponse.must_change_password)
      }

      setAuthUser(user)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordFieldErrors({})
      setChangePasswordError(null)
      setLoginForm((current) => ({
        ...current,
        password: '',
      }))
      setCurrentScreen(resolvePostLoginScreen(user, tokenResponse.must_change_password))
    } catch (error) {
      const details = getApiErrorDetails(error, 'Unable to sign in. Please try again.')
      await logout()
      setAuthUser(null)
      setLoginError(details.message)
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsPasswordSubmitting(true)
    setChangePasswordError(null)
    setPasswordFieldErrors({})

    try {
      await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_new_password: passwordForm.confirmPassword,
      })

      let nextUser: CurrentUser | null = authUser
        ? { ...authUser, must_change_password: false }
        : buildFallbackUser(loginForm.username.trim() || 'customer', undefined, false)

      try {
        nextUser = await getCurrentUser()
      } catch (error) {
        const details = getApiErrorDetails(error, 'Password changed, but account details could not be refreshed.')
        if (details.status === 401) {
          throw error
        }
      }

      setAuthUser(nextUser)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setCurrentScreen('password-success')
    } catch (error) {
      const details = getApiErrorDetails(error, 'Unable to change password. Please try again.')

      if (details.status === 401) {
        await logout()
        setAuthUser(null)
        setCurrentScreen('login')
        setLoginError('Your session expired. Please sign in again.')
      } else {
        setPasswordFieldErrors({
          current_password: details.fieldErrors.current_password,
          new_password: details.fieldErrors.new_password,
          confirm_new_password: details.fieldErrors.confirm_new_password,
        })
        setChangePasswordError(details.message)
      }
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  if (currentScreen === 'splash') {
    return (
      <div className="app-container">
        <div className="app-screen">
          <div className="splash-screen" onClick={() => setIsSplashReady(true)}>
            <img src={splashBg} className="splash-bg-layer" alt="" />
            <div className="splash-screen-interactive-area" />

            <div className="splash-branding">
              <img src={sabcoLogo} className="brand-logo-img" alt="Sabco logo" />
            </div>

            <div className="splash-cylinder-layer">
              <img src={splashCylinder} className="cylinder-hero-img" alt="Sabco LPG Cylinder" />
            </div>

            <div className="splash-content-layer">
              <div className="splash-tagline">
                <h2>Safe. Reliable. Always.</h2>
                <p>
                  Your trusted gas partner
                  <br />
                  for every home.
                </p>
              </div>

              <div className="dots-indicator">
                <span className="dot active" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === 'login') {
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

  if (currentScreen === 'change-password') {
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

  if (currentScreen === 'password-success') {
    return (
      <ScreenFrame screen="password-success">
        <div className="screen-body screen-body--success">
          <div className="success-art">
            <span className="success-ring success-ring--outer" />
            <span className="success-ring success-ring--inner" />
            <span className="spark spark--top" />
            <span className="spark spark--right" />
            <span className="spark spark--bottom" />
            <span className="spark spark--left" />
            <div className="shield-badge">
              <ShieldIcon />
            </div>
          </div>

          <header className="success-copy">
            <h2>Password Updated Successfully</h2>
            <p>Your password has been changed successfully</p>
          </header>

          <button
            type="button"
            className="primary-button"
            onClick={() => setCurrentScreen(hasStoredSession() ? 'home' : 'login')}
          >
            CONTINUE
          </button>
        </div>
      </ScreenFrame>
    )
  }

  return <HomeScreen />
}

export default App
