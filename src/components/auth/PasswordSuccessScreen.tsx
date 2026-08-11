import { ShieldIcon } from '../common/Icons'
import { ScreenFrame } from '../common/ScreenFrame'

export function PasswordSuccessScreen({ onContinue }: { onContinue: () => void }) {
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
          onClick={onContinue}
        >
          CONTINUE
        </button>
      </div>
    </ScreenFrame>
  )
}
