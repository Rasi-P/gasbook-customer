import type { ReceiptData } from '../src/lib/receipt'

export const receiptFixture: ReceiptData = {
  number: 'SALE-32', source: 'sale', transaction_type: 'Direct Sale',
  business: { name: 'Sabco Gas' },
  customer: { name: 'Jéan Customer', address: '12 Long Street, Town', phone: '9000000000' },
  created_at: '2026-10-15T20:10:00Z', status: 'Completed', cancelled: false,
  cancelled_at: null, cancellation_reason: null,
  items: [{ description: '5kg Cylinder', quantity: 2, rate_type: 'new', unit_amount: '810.00',
    unit_label: 'Unit price', deposit_unit_amount: '450.00', refill_unit_amount: '360.00', total_amount: '1560.00' }],
  subtotal: '1620.00', discount_amount: '60.00', total_amount: '1560.00', paid_amount: '500.00', balance_due: '1060.00',
  payment_status: 'Partially paid', payment_method: 'GPay', refund_amount: null, refund_due: null,
  refunded_at: null, credit_amount: null, delivery_partner: null, completed_at: null,
}
