import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  ApiError,
  changePassword,
  getCustomerProfile,
  getApiErrorDetails,
  getCurrentUser,
  hasStoredSession,
  isCustomerUser,
  isPasswordChangeRequiredError,
  isRoleNotAllowedError,
  login,
  logout,
  setPasswordChangeRequiredHandler,
  type CustomerProfile,
  type CurrentUser,
} from './lib/auth'
import type { NextScreen, PasswordFieldErrors, ScreenType } from './types'
import { SplashScreen } from './components/auth/SplashScreen'
import { LoginScreen } from './components/auth/LoginScreen'
import { ForgotPasswordRequestScreen } from './components/auth/ForgotPasswordRequestScreen'
import { ChangePasswordScreen } from './components/auth/ChangePasswordScreen'
import { PasswordSuccessScreen } from './components/auth/PasswordSuccessScreen'
import { HomeScreen } from './components/views/HomeScreen'

function resolvePostLoginScreen(user: CurrentUser | null, mustChangePassword: boolean): NextScreen {
  if (user?.must_change_password || mustChangePassword) {
    return 'change-password'
  }

  return 'home'
}

const CUSTOMERS_ONLY_MESSAGE = 'This app is for customers only. Please use the management portal.'

function buildFallbackUser(
  username: string,
  userId: number | undefined,
  mustChangePassword: boolean,
  role: string | undefined = 'customer',
): CurrentUser {
  return {
    id: userId ?? 0,
    username,
    name: username,
    role: role || 'customer',
    redirect: null,
    must_change_password: mustChangePassword,
    vehicle_location_name: null,
  }
}

function customersOnlyError() {
  return new ApiError(CUSTOMERS_ONLY_MESSAGE, 403, { detail: CUSTOMERS_ONLY_MESSAGE, code: 'role_not_allowed' })
}

const PROFILE_MISSING_MESSAGE = 'No customer profile is linked to this account. Please contact support.'

/** `/customers/me/` answered 404 `customer_profile_missing`: the account cannot use the app, so block sign-in. */
function profileMissingError() {
  return new ApiError(PROFILE_MISSING_MESSAGE, 404, { detail: PROFILE_MISSING_MESSAGE, code: 'customer_profile_missing' })
}

function isDesktopView(): boolean {
  return typeof window !== 'undefined' && window.innerWidth >= 1024
}

const SUPPORT_CONTACT_NAME = (import.meta.env.VITE_SUPPORT_CONTACT_NAME || 'Admin').trim() || 'Admin'
const SUPPORT_WHATSAPP_NUMBER = (import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER || '').trim()

function sanitizePhoneNumber(value: string): string {
  return value.replace(/[^\d]/g, '')
}

function buildSupportWhatsappLink(username: string): string | null {
  const phone = sanitizePhoneNumber(SUPPORT_WHATSAPP_NUMBER)
  const cleanUsername = username.trim()

  if (!phone || !cleanUsername) {
    return null
  }

  const message =
    `Hello ${SUPPORT_CONTACT_NAME}, I forgot my GasBook customer password.` +
    ` Please send a temporary password for username: ${cleanUsername}.` +
    ` I will change it immediately after login.`

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    return isDesktopView() ? 'login' : 'splash'
  })
  const [postSplashScreen, setPostSplashScreen] = useState<NextScreen>('login')
  const [isSplashReady, setIsSplashReady] = useState(false)
  const [isBootstrapComplete, setIsBootstrapComplete] = useState(false)
  const [authUser, setAuthUser] = useState<CurrentUser | null>(null)
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)

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

  const supportWhatsappAvailable = Boolean(sanitizePhoneNumber(SUPPORT_WHATSAPP_NUMBER))
  const supportWhatsappLink = buildSupportWhatsappLink(loginForm.username)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsSplashReady(true)
    }, 2300)

    return () => window.clearTimeout(timer)
  }, [])

  // Any API call refused with 403 `password_change_required` moves the user to the change-password screen.
  useEffect(() => {
    setPasswordChangeRequiredHandler(() => {
      if (!hasStoredSession()) {
        return
      }
      setAuthUser((current) => (current ? { ...current, must_change_password: true } : current))
      setCurrentScreen((screen) => (screen === 'change-password' ? screen : 'change-password'))
    })

    return () => setPasswordChangeRequiredHandler(null)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024 && currentScreen === 'splash') {
        setCurrentScreen(postSplashScreen)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentScreen, postSplashScreen])

  useEffect(() => {
    let isCancelled = false

    const bootstrapSession = async () => {
      let nextScreen: NextScreen = 'login'
      let restoredUser: CurrentUser | null = null
      let restoredCustomerProfile: CustomerProfile | null = null
      let restoreError: string | null = null

      if (hasStoredSession()) {
        try {
          restoredUser = await getCurrentUser()
          if (!isCustomerUser(restoredUser)) {
            throw customersOnlyError()
          }

          // While a password change is pending every other endpoint answers 403; fetch the profile afterwards.
          if (!restoredUser.must_change_password) {
            try {
              restoredCustomerProfile = await getCustomerProfile(restoredUser.id)
            } catch (profileError) {
              if (isPasswordChangeRequiredError(profileError)) {
                restoredUser = { ...restoredUser, must_change_password: true }
              } else {
                throw profileError
              }
            }
            if (!restoredUser.must_change_password && restoredCustomerProfile === null) {
              throw profileMissingError()
            }
          }

          nextScreen = resolvePostLoginScreen(restoredUser, restoredUser.must_change_password)
        } catch (error) {
          const details = getApiErrorDetails(error, 'Unable to restore your session. Please sign in again.')
          await logout()
          restoredUser = null
          restoredCustomerProfile = null
          restoreError =
            details.status === 401
              ? 'Your session expired. Please sign in again.'
              : isRoleNotAllowedError(error)
                ? CUSTOMERS_ONLY_MESSAGE
                : details.message || 'Unable to restore your session. Please sign in again.'
        }
      }

      if (isCancelled) {
        return
      }

      setAuthUser(restoredUser)
      setCustomerProfile(restoredCustomerProfile)
      setPostSplashScreen(nextScreen)
      setLoginError(restoreError)
      setIsBootstrapComplete(true)

      // On desktop, navigate straight to authenticated screen or login
      if (isDesktopView()) {
        setCurrentScreen(nextScreen)
      }
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
    setCustomerProfile(null)
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
      let profile: CustomerProfile | null = null

      try {
        user = await getCurrentUser()
      } catch (error) {
        const details = getApiErrorDetails(error, 'Unable to load your account details.')
        if (details.status === 401 || isRoleNotAllowedError(error)) {
          throw error
        }
        user = buildFallbackUser(username, tokenResponse.user_id, tokenResponse.must_change_password, tokenResponse.role)
      }

      if (!isCustomerUser(user)) {
        throw customersOnlyError()
      }

      const mustChangePassword = Boolean(user.must_change_password || tokenResponse.must_change_password)

      // Skip the profile fetch while a password change is required: the backend answers 403 for it anyway.
      if (!mustChangePassword) {
        try {
          profile = await getCustomerProfile(user.id)
        } catch (error) {
          const details = getApiErrorDetails(error, 'Unable to load your account details.')
          if (details.status === 401 || isRoleNotAllowedError(error)) {
            throw error
          }
          if (isPasswordChangeRequiredError(error)) {
            user = { ...user, must_change_password: true }
          }
        }
        if (!user.must_change_password && profile === null) {
          throw profileMissingError()
        }
      }

      setAuthUser(user)
      setCustomerProfile(profile)
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
      const details = getApiErrorDetails(error, 'Invalid username or password.')
      await logout()
      setAuthUser(null)
      setCustomerProfile(null)
      // A 403 `role_not_allowed` carries the server's explanation in `detail`; show it verbatim.
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
      let nextCustomerProfile: CustomerProfile | null = customerProfile
      let profileConfirmedMissing = false

      try {
        nextUser = await getCurrentUser()
        nextCustomerProfile = await getCustomerProfile(nextUser.id)
        profileConfirmedMissing = nextCustomerProfile === null
      } catch (error) {
        const details = getApiErrorDetails(error, 'Password changed, but account details could not be refreshed.')
        if (details.status === 401) {
          throw error
        }
      }

      if (profileConfirmedMissing) {
        await logout()
        setAuthUser(null)
        setCustomerProfile(null)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setCurrentScreen('login')
        setLoginError(PROFILE_MISSING_MESSAGE)
        return
      }

      setAuthUser(nextUser)
      setCustomerProfile(nextCustomerProfile)
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
        setCustomerProfile(null)
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

  const handleOpenForgotPassword = () => {
    setLoginError(null)
    setCurrentScreen('forgot-password')
  }

  const handleOpenSupportWhatsapp = () => {
    if (!supportWhatsappLink) {
      return
    }

    window.location.assign(supportWhatsappLink)
  }

  const handleLogout = async () => {
    await logout()
    setAuthUser(null)
    setCustomerProfile(null)
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setCurrentScreen('login')
  }

  const handleProfileUpdated = async () => {
    if (!authUser) {
      return
    }
    try {
      const refreshed = await getCustomerProfile(authUser.id)
      setCustomerProfile(refreshed)
    } catch {
      // Ignore
    }
  }

  const homeUserId = authUser?.id || customerProfile?.user_id || 0

  if (currentScreen === 'splash') {
    if (isDesktopView()) {
      return (
        <LoginScreen
          loginForm={loginForm}
          showLoginPassword={showLoginPassword}
          isLoginSubmitting={isLoginSubmitting}
          loginError={loginError}
          updateLoginField={updateLoginField}
          setShowLoginPassword={setShowLoginPassword}
          setLoginForm={setLoginForm}
          handleLoginSubmit={handleLoginSubmit}
          onForgotPassword={handleOpenForgotPassword}
          onContactSupport={handleOpenForgotPassword}
        />
      )
    }
    return <SplashScreen onSplashClick={() => setIsSplashReady(true)} />
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        loginForm={loginForm}
        showLoginPassword={showLoginPassword}
        isLoginSubmitting={isLoginSubmitting}
        loginError={loginError}
        updateLoginField={updateLoginField}
        setShowLoginPassword={setShowLoginPassword}
        setLoginForm={setLoginForm}
        handleLoginSubmit={handleLoginSubmit}
        onForgotPassword={handleOpenForgotPassword}
        onContactSupport={handleOpenForgotPassword}
      />
    )
  }

  if (currentScreen === 'forgot-password') {
    return (
      <ForgotPasswordRequestScreen
        username={loginForm.username}
        supportContactName={SUPPORT_CONTACT_NAME}
        supportWhatsappLink={supportWhatsappLink}
        supportWhatsappAvailable={supportWhatsappAvailable}
        onUsernameChange={updateLoginField('username')}
        onBackToLogin={() => setCurrentScreen('login')}
        onOpenWhatsapp={handleOpenSupportWhatsapp}
      />
    )
  }

  if (currentScreen === 'change-password') {
    return (
      <ChangePasswordScreen
        displayName={displayName}
        passwordForm={passwordForm}
        showCurrentPassword={showCurrentPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        passwordFieldErrors={passwordFieldErrors}
        changePasswordError={changePasswordError}
        isPasswordSubmitting={isPasswordSubmitting}
        updatePasswordField={updatePasswordField}
        setShowCurrentPassword={setShowCurrentPassword}
        setShowNewPassword={setShowNewPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        handlePasswordSubmit={handlePasswordSubmit}
      />
    )
  }

  if (currentScreen === 'password-success') {
    return <PasswordSuccessScreen onContinue={() => setCurrentScreen(hasStoredSession() ? 'home' : 'login')} />
  }

  return (
    <HomeScreen
      key={homeUserId}
      userId={homeUserId}
      onLogout={handleLogout}
      customerProfile={customerProfile}
      onProfileUpdated={handleProfileUpdated}
    />
  )
}

export default App
