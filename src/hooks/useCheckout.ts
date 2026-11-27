import { useSyncExternalStore } from 'react'
import { checkoutState, subscribeCheckout } from '../lib/checkoutIntent'

/** Shared by the simultaneously mounted mobile and desktop checkout screens. */
export function useCheckout(customerId: number) {
  return useSyncExternalStore(subscribeCheckout, () => checkoutState(customerId), () => 'idle' as const)
}
