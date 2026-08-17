import { useState, useEffect } from 'react'
import { type CustomerProfile } from '../../lib/auth'
import type { ActiveTab, CartItem, OrderItem, ProfileUser } from '../../types'
import { BottomNavigation } from '../layout/BottomNavigation'
import { CartView } from './CartView'
import { CheckoutView } from './CheckoutView'
import { ExploreView } from './ExploreView'
import { HomeView } from './HomeView'
import { OrdersView } from './OrdersView'
import { OrderSuccessView } from './OrderSuccessView'
import { ProfileView } from './ProfileView'
import { TrackingModal } from './TrackingModal'
import { fetchPaginatedBookings } from '../../lib/api-queries'

function formatMemberSince(dateValue: string | undefined) {
  if (!dateValue) {
    return 'Not available'
  }

  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) {
    return 'Not available'
  }

  return parsed.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  })
}

interface HomeScreenProps {
  onLogout?: () => void
  customerProfile: CustomerProfile | null
  onProfileUpdated?: () => void
}

export function HomeScreen({ onLogout, customerProfile, onProfileUpdated }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [lastCreatedOrderId, setLastCreatedOrderId] = useState<number | null>(null)
  const [realOrders, setRealOrders] = useState<OrderItem[]>([])
  const [trackingBookingId, setTrackingBookingId] = useState<number | null>(null)

  const fetchActiveOrder = async () => {
    try {
      // Fetch just the ongoing orders for the Home active order card
      const response = await fetchPaginatedBookings({ status: 'pending,approved,accepted,out_for_delivery', page: 1 })
      const items = response.results
      const mapped: OrderItem[] = items.map((b: any) => {
        let statusLabel = 'Order Placed'
        let statusKind: 'ongoing' | 'completed' | 'cancelled' = 'ongoing'
        let etaOrDate = 'Order Placed — Awaiting staff assignment'

        if (b.status === 'approved') {
          statusLabel = 'Order Confirmed'
          statusKind = 'ongoing'
          etaOrDate = 'Order confirmed — awaiting dispatch'
        } else if (b.status === 'accepted' || b.status === 'out_for_delivery') {
          statusLabel = 'Out for Delivery'
          statusKind = 'ongoing'
          etaOrDate = `Out for delivery with ${b.assigned_staff_name || 'Delivery Staff'}`
        } else if (b.status === 'delivered') {
          statusLabel = 'Delivered'
          statusKind = 'completed'
          etaOrDate = `Delivered on ${new Date(b.delivered_at || b.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
        } else if (b.status === 'cancelled' || b.status === 'rejected') {
          statusLabel = b.status === 'rejected' ? 'Rejected' : 'Cancelled'
          statusKind = 'cancelled'
          if (b.status === 'rejected') {
            etaOrDate = b.rejection_reason ? `Rejected: ${b.rejection_reason}` : 'Order rejected by administration'
          } else {
            etaOrDate = 'Order cancelled'
          }
        }

        const rawName = b.cylinder_type_name || 'Domestic LPG'
        let displayTitle = rawName
        let weightStr = '14.2 KG'
        
        const kgMatch = rawName.match(/^(\d+(?:\.\d+)?)\s*kg/i)
        if (kgMatch) {
          weightStr = `${kgMatch[1]} KG`
          displayTitle = 'Gas Cylinder'
        } else {
          const anyKg = rawName.match(/(\d+(?:\.\d+)?)\s*kg/i)
          if (anyKg) {
            weightStr = `${anyKg[1]} KG`
          }
        }

        return {
          id: `ord-${b.id}`,
          orderNumber: `Order #GB${b.id}`,
          date: b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
          productName: displayTitle,
          weight: weightStr,
          price: `₹${(floatRate(b) * b.quantity).toLocaleString('en-IN')}`,
          status: statusKind,
          statusCode: b.status,
          statusLabel: statusLabel,
          etaOrDate: etaOrDate,
          actionLabel: (b.status === 'rejected' || b.status === 'cancelled') ? 'View Details' : (b.status === 'delivered' ? 'Order Again' : 'Track Order'),
          rawBooking: b,
          rejectionReason: b.rejection_reason,
        }
      })
      setRealOrders(mapped)
    } catch (err) {
      console.error(err)
    }
  }

  function floatRate(b: any) {
    return parseFloat(b.rate || '0')
  }

  useEffect(() => {
    void fetchActiveOrder()
  }, [activeTab])

  // Safety guard: if cart is empty but we are on checkout, redirect to explore
  useEffect(() => {
    if (activeTab === 'checkout' && cartItems.length === 0) {
      setActiveTab('explore')
    }
  }, [activeTab, cartItems])

  const profileUser: ProfileUser = {
    profileId: customerProfile?.id,
    name: customerProfile?.name?.trim() || customerProfile?.full_name?.trim() || '',
    email: customerProfile?.email?.trim() || '',
    phone: customerProfile?.phone?.trim() || '',
    address: customerProfile?.address?.trim() || '',
    memberSince: formatMemberSince(customerProfile?.created_at),
  }

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter((item): item is CartItem => item !== null)
    )
  }

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleBook = (productName: string, price?: number, cylinderTypeId?: number) => {
    // Overwrite the cart with the single newly selected item to support the linear flow
    setCartItems([
      {
        id: `cart-${Date.now()}`,
        cylinderTypeId: cylinderTypeId,
        name: productName,
        variant: productName.includes('KG') ? productName : `${productName}`,
        unitPrice: price || 0,
        quantity: 1,
        type: 'cylinder',
      },
    ])
    // Go straight to Checkout (Review Your Order) instead of Cart
    setActiveTab('checkout')
  }

  // Removed old handleOrderAgain, OrdersView will call handleBook directly

  const handleNavigateToCart = () => {
    // Actually, "Cart" is deprecated in this flow. We'll map this back to home if called
    setActiveTab('home')
  }

  const handleOrderCreated = (orderId: number) => {
    setCartItems([]) // Clear cart only after checkout order creation succeeds
    setLastCreatedOrderId(orderId)
    setActiveTab('order-success')
    void fetchActiveOrder()
  }

  return (
    <div className="home-root">
      <div className="home-reference-frame">
        {/* Render Tab Content based on activeTab */}
        {activeTab === 'explore' && (
          <ExploreView
            cartCount={cartCount}
            onBook={handleBook}
            onNavigateToCart={handleNavigateToCart}
          />
        )}
        {activeTab === 'home' && (
          <HomeView
            onNavigateToExplore={() => setActiveTab('explore')}
            customerProfile={customerProfile}
            latestActiveOrder={realOrders[0]}
            onViewOrders={() => setActiveTab('orders')}
            onTrackOrder={(id: number) => setTrackingBookingId(id)}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersView
            onNavigateToExplore={() => setActiveTab('explore')}
            onTrackOrder={(id: number) => setTrackingBookingId(id)}
            onOrderAgain={handleBook}
          />
        )}
        {activeTab === 'cart' && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onNavigateToExplore={() => setActiveTab('explore')}
            onProceedToCheckout={() => setActiveTab('checkout')}
            customerProfile={customerProfile}
          />
        )}
        {activeTab === 'checkout' && (
          <CheckoutView
            cartItems={cartItems}
            customerProfile={customerProfile}
            onBackToCart={() => setActiveTab('explore')}
            onOrderCreated={handleOrderCreated}
          />
        )}
        {activeTab === 'order-success' && (
          <OrderSuccessView
            orderId={lastCreatedOrderId || 0}
            onViewOrders={() => setActiveTab('orders')}
            onBackToHome={() => setActiveTab('home')}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView
            user={profileUser}
            onProfileUpdated={onProfileUpdated}
            onLogout={() => {
              if (onLogout) {
                onLogout()
              } else {
                alert('Logging out...')
              }
            }}
          />
        )}

        {/* Bottom Navigation */}
        {activeTab !== 'checkout' && activeTab !== 'order-success' && activeTab !== 'cart' && (
          <BottomNavigation
            activeTab={activeTab === 'explore' ? 'home' : activeTab} // Hide explore as a tab visually if needed, but it's Book Cylinder now
            cartCount={0}
            setActiveTab={setActiveTab}
          />
        )}
        
        {/* Global Tracking Modal */}
        {trackingBookingId !== null && (
          <TrackingModal bookingId={trackingBookingId} onClose={() => setTrackingBookingId(null)} />
        )}
      </div>
    </div>
  )
}
