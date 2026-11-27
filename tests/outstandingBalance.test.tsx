import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { OutstandingBalanceSummary, parseOutstanding } from '../src/components/common/OutstandingBalance'
import { PaymentSummary, type PaymentFacts } from '../src/components/common/PaymentSummary'

test('uses the account amount and treats net credit as no debt, without inventing missing balances', () => {
  expect(parseOutstanding('1720.50')).toBe(1720.5)
  expect(parseOutstanding('-500.00')).toBe(0)
  expect(parseOutstanding('0.00')).toBe(0)
  for (const value of [undefined, null, '', ' ', 'invalid', Infinity]) expect(parseOutstanding(value)).toBeNull()
})
test('clearly distinguishes outstanding, settled, loading and unavailable summary states', () => {
  const render = (amount: number | null | undefined) => renderToStaticMarkup(<OutstandingBalanceSummary amount={amount} onRetry={() => {}} />)
  expect(render(1720.5)).toContain('₹1,720.50')
  expect(render(1720.5)).not.toContain('outstanding-balance--due')
  expect(render(1720.5)).not.toContain('<h2>')
  expect(render(0)).toContain('₹0.00')
  expect(render(0)).not.toContain('outstanding-balance--due')
  expect(render(undefined)).toContain('Loading balance')
  expect(render(undefined)).not.toContain('₹0')
  expect(render(null)).toContain('Balance unavailable')
  expect(render(null)).toContain('Retry')
  expect(render(null)).not.toContain('₹0')
})
test('highlights only unpaid active transactions in red, including partial payments', () => {
  const facts: PaymentFacts = { sale_id: 1, status: 'PARTIAL', total_amount: '820', paid_amount: '100', balance_due: '720', payments: [] }
  const render = (value: PaymentFacts) => renderToStaticMarkup(<PaymentSummary value={value} />)
  expect(render(facts)).toContain('payment-summary--due')
  expect(render(facts)).toContain('₹720.00 outstanding')
  expect(render({ ...facts, status: 'CANCELLED' })).not.toContain('payment-summary--due')
  expect(render({ ...facts, status: 'PAID', balance_due: '0' })).not.toContain('payment-summary--due')
})
