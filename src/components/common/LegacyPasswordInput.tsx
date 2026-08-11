import type { ChangeEvent } from 'react'
import { EyeIcon, LockIcon } from './Icons'

export function LegacyPasswordInput({
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
        aria-label={visible ? `Hide ${value}` : `Show ${value}`}
      >
        <EyeIcon open={!visible} />
      </button>
    </div>
  )
}
