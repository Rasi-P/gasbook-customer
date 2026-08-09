import { useState, useEffect } from 'react'
import splashBg from './assets/splash_bg.png'
import splashCylinder from './assets/splash_cylinder.png'
import sabcoLogo from './assets/sabco_logo.png'

type ScreenType = 'splash' | 'login' | 'change-password' | 'password-success' | 'home'

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash')

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

        {currentScreen !== 'splash' && (
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
