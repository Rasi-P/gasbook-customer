import splashBg from '../../assets/splash_bg.png'
import splashCylinder from '../../assets/splash_cylinder.png'
import sabcoLogo from '../../assets/sabco_logo.png'

export function SplashScreen({ onSplashClick }: { onSplashClick: () => void }) {
  return (
    <div className="app-container">
      <div className="app-screen">
        <div className="splash-screen" onClick={onSplashClick}>
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
