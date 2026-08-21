import splashBgMobile from '../../assets/splash_bg_mobile.png'
import sabcoLogoBlue from '../../assets/sabco_logo_blue.svg'

export function SplashScreen({ onSplashClick }: { onSplashClick: () => void }) {
  return (
    <div className="app-container splash-screen-root">
      <div className="app-screen">
        <div className="splash-screen-container" onClick={onSplashClick} role="presentation">
          {/* SEAMLESS FULL-BLEED BACKGROUND SCENE (TRUCK + CYLINDERS + ROAD + SKYLINE + CLOUDS) */}
          <img
            src={splashBgMobile}
            className="splash-full-bleed-scene"
            alt=""
            aria-hidden="true"
          />

          {/* TOP BRAND & MESSAGE OVERLAY */}
          <div className="splash-brand-overlay">
            <div className="splash-logo-wrap">
              <img
                src={sabcoLogoBlue}
                className="splash-sabco-logo"
                alt="Sabco Gas Cylinders"
              />
            </div>

            <h1 className="splash-tagline-text">Safe. Reliable. Always.</h1>

            {/* MINIMAL ANIMATED LOADING BAR */}
            <div className="splash-loading-track" aria-hidden="true">
              <div className="splash-loading-bar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
