export type ScreenType = 'splash' | 'login' | 'change-password' | 'password-success' | 'home'
export type NextScreen = Exclude<ScreenType, 'splash'>

export type PasswordFieldErrors = {
  current_password?: string
  new_password?: string
  confirm_new_password?: string
}

export interface OrderItem {
  id: string
  orderNumber: string
  date: string
  productName: string
  weight: string
  price: string
  originalPrice?: string
  status: 'ongoing' | 'completed' | 'cancelled'
  statusCode?: 'pending' | 'approved' | 'accepted' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rejected'
  statusLabel: string
  etaOrDate: string
  actionLabel: string
  rawBooking?: any
  rejectionReason?: string
}

export interface CartItem {
  id: string
  cylinderTypeId?: number
  name: string
  variant: string
  unitPrice: number
  displayPrice?: number
  quantity: number
  type: 'cylinder' | 'accessory'
}

export interface ProfileUser {
  profileId?: number
  name: string
  email: string
  phone: string
  address: string
  memberSince: string
}

export type ActiveTab = 'home' | 'explore' | 'orders' | 'cart' | 'checkout' | 'order-success' | 'profile' | 'track-order'
