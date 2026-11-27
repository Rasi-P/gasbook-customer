import type { BookingRecord } from '../src/lib/auth'
export const confirmedBooking: BookingRecord = {
  id: 48, order_id: 'GB48', cylinder_type: 1, cylinder_type_name: '5kg', quantity: 2, rate: '660',
  status: 'pending', created_at: '2026-10-17T09:37:00Z', original_amount: '4620', discount_amount: '72',
  final_amount: '4548', payment_method: 'COD', order_items: [
    { id: 1, name: '5kg cylinder', type: 'cylinder', quantity: 2, rate: '660', total_amount: '1248', rate_type: 'new', deposit_unit_amount: '300', refill_unit_amount: '360' },
    { id: 2, name: '[DEMO] LPG Gas Regulator with a long product name', type: 'accessory', quantity: 2, rate: '250', total_amount: '500' },
    { id: 3, name: '21kg cylinder', type: 'cylinder', quantity: 1, rate: '2800', total_amount: '2800', rate_type: 'new', deposit_unit_amount: '1200', refill_unit_amount: '1600' },
  ],
}
