import { formatDateTime } from '../../lib/dateTime'
export type PaymentFacts = {
  sale_id: number; total_amount: string; paid_amount: string; balance_due: string; status: string
  payments: { id: number; amount: string; mode: string; created_at: string; kind: string }[]
}
const money = (value: string) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const labels: Record<string, string> = { cash: 'Cash', gpay: 'UPI / GPay', bank: 'Bank Transfer', payment: 'Payment', refund: 'Refund', credit: 'Customer credit', credit_reversal: 'Transferred to credit' }
export function PaymentSummary({ value }: { value?: PaymentFacts | null }) {
  if (!value) return null
  return <details className="history-card-details" aria-label="Payment details">
    <summary>Payments · {value.status === 'CANCELLED' ? 'Cancelled' : Number(value.balance_due) > 0 ? `${money(value.balance_due)} outstanding` : 'Paid'}</summary>
    <div className="booking-item-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>{value.status === 'CANCELLED' ? 'Originally paid' : 'Amount paid'}</span><strong>{money(value.paid_amount)}</strong></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Outstanding balance</span><strong>{money(value.balance_due)}</strong></div>
      {value.payments.length ? value.payments.map(payment => <section key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span>{labels[payment.mode] || payment.mode} · {labels[payment.kind] || payment.kind}<br /><small>{formatDateTime(payment.created_at)}</small></span><strong style={{ whiteSpace: 'nowrap' }}>{money(payment.amount)}</strong>
      </section>) : <p>No payments recorded.</p>}
    </div>
  </details>
}
