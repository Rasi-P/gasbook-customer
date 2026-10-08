interface PricingErrorNoticeProps {
  message: string
  onRetry: () => void
  /** Desktop surfaces use slightly tighter typography. */
  compact?: boolean
}

/** Inline "could not calculate prices" notice with a Retry action (cart + checkout, mobile and desktop). */
export function PricingErrorNotice({ message, onRetry, compact = false }: PricingErrorNoticeProps) {
  return (
    <div
      role="alert"
      style={{
        background: '#FEF2F2',
        border: '1px solid #FCA5A5',
        color: '#DC2626',
        padding: compact ? '10px 12px' : '12px',
        borderRadius: compact ? '10px' : '8px',
        fontSize: compact ? '13px' : '0.9rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '12px',
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        style={{
          background: '#DC2626',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          padding: compact ? '6px 12px' : '8px 14px',
          fontSize: compact ? '12.5px' : '0.85rem',
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Retry
      </button>
    </div>
  )
}
