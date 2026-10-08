import { describe, expect, it } from 'bun:test'
import {
  ACTIVE_STATUS_FILTER,
  BOOKING_STATUSES,
  CANCELLED_STATUS_FILTER,
  COMPLETED_STATUS_FILTER,
  getOrderStatusMeta,
  isBookingStatus,
} from '../src/lib/orderStatus'

describe('getOrderStatusMeta (P2-19)', () => {
  it('maps pending to "Order Placed" awaiting confirmation', () => {
    const meta = getOrderStatusMeta('pending')
    expect(meta.label).toBe('Order Placed')
    expect(meta.kind).toBe('ongoing')
    expect(meta.description).toBe('Awaiting confirmation')
    expect(meta.timelineIndex).toBe(0)
    expect(meta.progressPercent).toBe(0)
    expect(meta.isTerminal).toBe(false)
  })

  it('explains a staff decline as reassignment, never as a rejection', () => {
    const meta = getOrderStatusMeta('pending', { needs_reassignment: true })
    expect(meta.label).toBe('Order Placed')
    expect(meta.description).toBe('Reassigning your delivery partner')
    expect(meta.description.toLowerCase()).not.toContain('reject')
  })

  it('maps approved to "Order Confirmed" on timeline step 1', () => {
    const meta = getOrderStatusMeta('approved')
    expect(meta.label).toBe('Order Confirmed')
    expect(meta.timelineIndex).toBe(1)
    expect(meta.progressPercent).toBe(33)
  })

  it('maps accepted to the partner-accepted label on step 1, NOT out for delivery', () => {
    const meta = getOrderStatusMeta('accepted', { assigned_staff_name: 'Ravi' })
    expect(meta.label).toBe('Accepted by delivery partner')
    expect(meta.description).toBe('Accepted by Ravi — preparing for dispatch')
    expect(meta.timelineIndex).toBe(1)
    expect(meta.progressPercent).toBe(33)
    expect(meta.label).not.toContain('Out for Delivery')
  })

  it('maps out_for_delivery to step 2 with the partner name', () => {
    const meta = getOrderStatusMeta('out_for_delivery', { assigned_staff_name: 'Ravi' })
    expect(meta.label).toBe('Out for Delivery')
    expect(meta.description).toBe('Out for delivery with Ravi')
    expect(meta.timelineIndex).toBe(2)
    expect(meta.progressPercent).toBe(66)
  })

  it('falls back to a generic partner name', () => {
    expect(getOrderStatusMeta('out_for_delivery').description).toBe('Out for delivery with your delivery partner')
  })

  it('maps delivered to a completed terminal state', () => {
    const meta = getOrderStatusMeta('delivered', { delivered_at: '2026-10-05T10:00:00Z' })
    expect(meta.label).toBe('Delivered')
    expect(meta.kind).toBe('completed')
    expect(meta.timelineIndex).toBe(3)
    expect(meta.progressPercent).toBe(100)
    expect(meta.isTerminal).toBe(true)
    expect(meta.description.startsWith('Delivered on ')).toBe(true)
  })

  it('maps rejected with and without a reason', () => {
    expect(getOrderStatusMeta('rejected', { rejection_reason: 'Out of stock' }).description).toBe('Reason: Out of stock')
    const noReason = getOrderStatusMeta('rejected')
    expect(noReason.label).toBe('Rejected')
    expect(noReason.kind).toBe('cancelled')
    expect(noReason.description).toBe('Order could not be fulfilled')
    expect(noReason.isTerminal).toBe(true)
  })

  it('maps cancelled to a terminal cancelled state', () => {
    const meta = getOrderStatusMeta('cancelled')
    expect(meta.label).toBe('Cancelled')
    expect(meta.kind).toBe('cancelled')
    expect(meta.isTerminal).toBe(true)
  })

  it('never crashes on unknown / missing statuses', () => {
    for (const value of ['something_new', '', undefined, null]) {
      const meta = getOrderStatusMeta(value as string | null | undefined)
      expect(meta.label).toBe('Processing')
      expect(meta.kind).toBe('ongoing')
      expect(meta.isKnown).toBe(false)
      expect(meta.timelineIndex).toBe(0)
    }
  })

  it('exposes shared filter constants matching the backend status set', () => {
    expect(ACTIVE_STATUS_FILTER).toBe('pending,approved,accepted,out_for_delivery')
    expect(COMPLETED_STATUS_FILTER).toBe('delivered')
    expect(CANCELLED_STATUS_FILTER).toBe('cancelled,rejected')
    const allFiltered = [ACTIVE_STATUS_FILTER, COMPLETED_STATUS_FILTER, CANCELLED_STATUS_FILTER].join(',').split(',').sort()
    expect(allFiltered).toEqual([...BOOKING_STATUSES].sort())
    expect(isBookingStatus('accepted')).toBe(true)
    expect(isBookingStatus('nope')).toBe(false)
  })
})
