import type { ReactNode } from 'react'
import type { ScreenType } from '../../types'

export function ScreenFrame({
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
