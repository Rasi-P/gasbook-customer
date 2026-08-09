import { useState, useEffect } from 'react'
import splashBg from './assets/splash_bg.png'
import splashCylinder from './assets/splash_cylinder.png'
import sabcoLogo from './assets/sabco_logo.png'

type ScreenType = 'splash' | 'login' | 'change-password' | 'password-success' | 'home'

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (currentScreen === 'splash') {
      document.body.style.background = '#002d8b'
      const timer = setTimeout(() => {
        setCurrentScreen('login')
      }, 2500)
      return () => clearTimeout(timer)
    } else {
      document.body.style.background = '#eef2f6'
    }
  }, [currentScreen])

  const handleNext = () => {
    if (currentScreen === 'splash') {
      setCurrentScreen('login')
    }
  }

  return (
    <div className={`app-container ${currentScreen === 'splash' ? 'splash-active' : ''}`}>
      {/* Floating Developer selector at bottom-right (for testing different pages) */}
      <div 
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
          opacity: 0.15,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.15'}
      >
        <select 
          value={currentScreen} 
          onChange={(e) => setCurrentScreen(e.target.value as ScreenType)}
          style={{
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #334155',
            borderRadius: '20px',
            fontSize: '10px',
            padding: '4px 8px',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <option value="splash">Splash Screen</option>
          <option value="login">Login</option>
          <option value="change-password">Change Password</option>
          <option value="password-success">Success</option>
          <option value="home">Home Dashboard</option>
        </select>
      </div>

      <div className="app-screen">
        {currentScreen === 'splash' && (
          <div className="splash-screen" onClick={handleNext}>
            {/* Layer 1: Full-screen background */}
            <img src={splashBg} className="splash-bg-layer" alt="" />
            
            {/* Interactive area */}
            <div className="splash-screen-interactive-area" />
            
            {/* Branding Top */}
            <div className="splash-branding">
              <img src={sabcoLogo} className="brand-logo-img" alt="Sabco logo" />
            </div>

            {/* Layer 3: Central LPG Cylinder Hero */}
            <div className="splash-cylinder-layer">
              <img 
                src={splashCylinder} 
                className="cylinder-hero-img" 
                alt="Sabco LPG Cylinder" 
              />
            </div>

            {/* ContentLayer: Tagline & dots at bottom */}
            <div className="splash-content-layer">
              <div className="splash-tagline">
                <h2>Safe. Reliable. Always.</h2>
                <p>Your trusted gas partner<br />for every home.</p>
              </div>

              <div className="dots-indicator">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'login' && (
          <div className="login-screen">
            {/* Blue Brand Header */}
            <div className="login-header">
              <img src={sabcoLogo} className="login-brand-logo" alt="Sabco logo" />
            </div>
            
            {/* White Login Card */}
            <div className="login-card">
              <div className="login-card-header">
                <h2>Welcome Back 👋</h2>
                <p>Please login to continue</p>
              </div>
              
              <form className="login-form" onSubmit={(e) => { e.preventDefault(); setCurrentScreen('change-password'); }}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-wrapper">
                    <svg className="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input 
                      type="text" 
                      id="username" 
                      placeholder="Username" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <svg className="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="password" 
                      placeholder="Password" 
                      required 
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="form-actions">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" className="forgot-link">Forgot Password?</a>
                </div>
                
                <button type="submit" className="btn-primary">
                  LOGIN
                </button>
              </form>
              
              <div className="login-footer">
                <p>Need Help?</p>
                <a href="#contact" className="contact-link">Distributor Contact</a>
              </div>
            </div>
          </div>
        )}

        {currentScreen !== 'splash' && currentScreen !== 'login' && (
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%', 
              padding: '24px', 
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              zIndex: 10
            }}
          >
            <h2 style={{ fontSize: '20px', marginBottom: '12px', color: '#0f172a' }}>
              {currentScreen.replace('-', ' ').toUpperCase()}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              This screen will be built in the next step.
            </p>
            <button 
              onClick={() => setCurrentScreen('splash')}
              style={{
                background: 'var(--primary-blue)',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back to Splash
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
