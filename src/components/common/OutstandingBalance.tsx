import { useEffect, useState } from 'react'
import { request } from '../../lib/auth'
import '../../styles/outstandingBalance.css'

export function parseOutstanding(value: unknown): number | null {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') return null
  const amount = Number(value)
  return Number.isFinite(amount) ? Math.max(0, amount) : null
}

export function OutstandingBalanceSummary({ amount, onRetry }: { amount: number | null | undefined; onRetry: () => void }) {
  return <section className="outstanding-balance" aria-label="Total outstanding" aria-busy={amount === undefined} title="Your full account balance, including earlier dues and credits.">
    <span>Outstanding</span>
    {amount === undefined ? <span role="status">Loading balance…</span> : amount === null ?
      <div className="outstanding-balance__error"><span role="status">Balance unavailable</span><button type="button" onClick={onRetry}>Retry</button></div> :
      <strong>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>}
  </section>
}

export function OutstandingBalance() {
  const [amount, setAmount] = useState<number | null | undefined>(undefined)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let version = 0
    const refresh = async () => {
      const current = ++version
      setAmount(undefined)
      try {
        // This endpoint is scoped to the authenticated customer, independent of history pagination.
        const profile = await request<{ pending_amount?: string }>('/customers/me/', { method: 'GET' })
        if (current === version) setAmount(parseOutstanding(profile.pending_amount))
      } catch { if (current === version) setAmount(null) }
    }
    void refresh()
    window.addEventListener('focus', refresh)
    return () => { version++; window.removeEventListener('focus', refresh) }
  }, [retry])
  return <OutstandingBalanceSummary amount={amount} onRetry={() => setRetry(value => value + 1)} />
}
