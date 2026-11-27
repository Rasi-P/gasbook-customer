import { describe, expect, it } from 'bun:test'
import { buildOrderPrice, createEmptyPreview, formatMoney } from '../src/lib/pricing'

describe('buildOrderPrice (P2-11)', () => {
  it('uses final_amount (not the unit rate) and strikes through the original when discounted', () => {
    const price = buildOrderPrice({
      rate: '1650.00',
      quantity: 2,
      original_amount: '3300.00',
      discount_amount: '330.00',
      final_amount: '2970.00',
      total_amount: '2970.00',
    })
    expect(price.price).toBe(formatMoney(2970))
    expect(price.originalPrice).toBe(formatMoney(3300))
    expect(price.hasDiscount).toBe(true)
    expect(price.price).not.toBe(formatMoney(1650))
  })

  it('omits the strike-through when there is no discount', () => {
    const price = buildOrderPrice({ rate: '1650.00', quantity: 2, original_amount: '3300.00', discount_amount: '0.00', final_amount: '3300.00' })
    expect(price.price).toBe(formatMoney(3300))
    expect(price.originalPrice).toBeUndefined()
    expect(price.hasDiscount).toBe(false)
  })

  it('falls back to total_amount, then rate x quantity for legacy rows', () => {
    expect(buildOrderPrice({ total_amount: '500.00' }).price).toBe(formatMoney(500))
    expect(buildOrderPrice({ rate: '100', quantity: 3 }).price).toBe(formatMoney(300))
  })

  it('treats a present 0.00 final_amount as a real (fully discounted) total, not as unknown', () => {
    const price = buildOrderPrice({
      rate: '1650.00',
      quantity: 2,
      original_amount: '3300.00',
      discount_amount: '3300.00',
      final_amount: '0.00',
      total_amount: '0.00',
    })
    expect(price.finalAmount).toBe(0)
    expect(price.price).toBe(formatMoney(0))
    expect(price.price).not.toBe(formatMoney(3300))
    expect(price.originalPrice).toBe(formatMoney(3300))
    expect(price.hasDiscount).toBe(true)
    // Absent (null / empty) still falls back to rate x quantity.
    expect(buildOrderPrice({ rate: '100', quantity: 3, final_amount: null, total_amount: '' }).price).toBe(formatMoney(300))
  })

  it('shows a fallback label instead of ₹0 when nothing is known', () => {
    expect(buildOrderPrice({}).price).toBe('To be determined')
    expect(buildOrderPrice({}, '—').price).toBe('—')
  })
})

describe('createEmptyPreview', () => {
  it('is only used for an empty cart and carries zero totals', () => {
    const preview = createEmptyPreview()
    expect(preview.items).toEqual([])
    expect(preview.summary.final_amount).toBe('0')
  })
})
