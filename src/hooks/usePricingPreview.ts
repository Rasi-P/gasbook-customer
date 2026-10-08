import { useCallback, useEffect, useState } from 'react'
import { getApiErrorDetails, previewBookings, type BookingPreviewResponse } from '../lib/auth'
import { buildBookingPreviewPayload, createEmptyPreview, formatMoney } from '../lib/pricing'
import type { CartItem } from '../types'

export const PRICING_CALCULATING_LABEL = 'Calculating…'
export const PRICING_UNAVAILABLE_LABEL = '—'
export const PRICING_ERROR_FALLBACK = 'Unable to calculate prices right now.'

export interface PricingPreviewState {
  /** Server-priced preview, or null while loading / after a failure. Empty-cart preview is all zeros. */
  preview: BookingPreviewResponse | null
  isLoading: boolean
  error: string | null
  /** True only once a preview request has succeeded for the current cart (or the cart is empty). */
  isReady: boolean
  reload: () => void
  /** Formats a preview amount, or a loading / unavailable placeholder. Never falls back to ₹0. */
  displayAmount: (value: string | number | null | undefined) => string
}

/**
 * Shared pricing preview for cart + checkout (mobile and desktop).
 * On failure the preview is cleared (never substituted with zeros) and `error` is set.
 */
export function usePricingPreview(cartItems: CartItem[]): PricingPreviewState {
  const [preview, setPreview] = useState<BookingPreviewResponse | null>(() =>
    cartItems.length === 0 ? createEmptyPreview() : null,
  )
  const [isLoading, setIsLoading] = useState(cartItems.length > 0)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let ignore = false

    if (cartItems.length === 0) {
      setPreview(createEmptyPreview())
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    previewBookings(buildBookingPreviewPayload(cartItems))
      .then((data) => {
        if (!ignore) {
          setPreview(data)
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setPreview(null)
          setError(getApiErrorDetails(err, PRICING_ERROR_FALLBACK).message)
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [cartItems, reloadToken])

  const reload = useCallback(() => setReloadToken((count) => count + 1), [])

  const isReady = !isLoading && !error && preview !== null

  const displayAmount = useCallback(
    (value: string | number | null | undefined) => {
      if (isLoading) {
        return PRICING_CALCULATING_LABEL
      }
      if (error || preview === null || value === null || value === undefined) {
        return PRICING_UNAVAILABLE_LABEL
      }
      return formatMoney(value)
    },
    [isLoading, error, preview],
  )

  return { preview, isLoading, error, isReady, reload, displayAmount }
}
