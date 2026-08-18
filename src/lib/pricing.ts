import type { CartItem } from '../types'

export function calculateCartPricing(cartItems: CartItem[]) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
  const deliveryFee = cartItems.length > 0 ? 40 : 0
  const total = subtotal + deliveryFee
  
  return {
    subtotal,
    deliveryFee,
    total
  }
}
