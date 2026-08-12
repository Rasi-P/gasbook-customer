import { useState, useEffect } from 'react'
import { fetchCustomerBookings, type CustomerProfile } from '../../lib/auth'
import type { ActiveTab, CartItem, OrderItem, ProfileUser } from '../../types'
import { BottomNavigation } from '../layout/BottomNavigation'
import { CartView } from './CartView'
import { CheckoutView } from './CheckoutView'
import { ExploreView } from './ExploreView'
import { HomeView } from './HomeView'
import { OrdersView } from './OrdersView'
import { OrderSuccessView } from './OrderSuccessView'
import { ProfileView } from './ProfileView'

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
}

export function HomeScreen({ onLogout, customerProfile }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [lastCreatedOrderId, setLastCreatedOrderId] = useState<number | null>(null)
  const [realOrders, setRealOrders] = useState<OrderItem[]>([])

  const fetchOrders = async () => {
    try {
      const items = await fetchCustomerBookings()
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
          etaOrDate = b.status === 'rejected' ? 'Order rejected by administration' : 'Order cancelled'
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
          actionLabel: b.status === 'delivered' ? 'Order Again' : 'Track Order',
        }
      })
      setRealOrders(mapped)
    } catch {
      // Ignore network errors
    }
  }

  function floatRate(b: any) {
    return parseFloat(b.rate || '1300')
  }

  useEffect(() => {
    void fetchOrders()
  }, [activeTab])

  const profileUser: ProfileUser = {
    name: customerProfile?.name?.trim() || customerProfile?.full_name?.trim() || 'Customer',
    email: customerProfile?.email?.trim() || 'Not available',
    phone: customerProfile?.phone?.trim() || 'Not available',
    address: customerProfile?.address?.trim() || 'Not available',
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
    setCartItems((prev) => {
      const existing = prev.find((item) => item.cylinderTypeId === cylinderTypeId || item.name.toLowerCase().includes(productName.toLowerCase()))
      if (existing) {
        return prev.map((item) => (item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          cylinderTypeId: cylinderTypeId || 1,
          name: productName,
          variant: productName.includes('KG') ? productName : `${productName}`,
          unitPrice: price || 1300,
          quantity: 1,
          type: 'cylinder',
        },
      ]
    })
    setActiveTab('cart')
  }

  const handleNavigateToCart = () => {
    setActiveTab('cart')
  }

  const handleOrderCreated = (orderId: number) => {
    setCartItems([]) // Clear cart only after checkout order creation succeeds
    setLastCreatedOrderId(orderId)
    setActiveTab('order-success')
    void fetchOrders()
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
            onBook={handleBook}
            customerProfile={customerProfile}
            latestActiveOrder={realOrders.find((o) => o.status === 'ongoing')}
            onViewOrders={() => setActiveTab('orders')}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersView
            orders={realOrders}
            onNavigateToExplore={() => setActiveTab('explore')}
            onTrackOrder={() => alert('Order details & live status')}
            onOrderAgain={(orderId: string) => alert(`Reordering items from ${orderId}`)}
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
            onBackToCart={() => setActiveTab('cart')}
            onOrderCreated={handleOrderCreated}
          />
        )}
        {activeTab === 'order-success' && (
          <OrderSuccessView
            orderId={lastCreatedOrderId || 0}
            onViewOrders={() => setActiveTab('orders')}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView
            user={profileUser}
            onNavigateToAddresses={() => alert('Opening My Addresses')}
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
        <BottomNavigation
          activeTab={activeTab === 'checkout' || activeTab === 'order-success' ? 'cart' : activeTab}
          cartCount={cartCount}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  )
}
