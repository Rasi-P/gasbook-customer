import { useState } from 'react'
import type { CustomerProfile } from '../../lib/auth'
import type { ActiveTab, CartItem, ProfileUser } from '../../types'
import { BottomNavigation } from '../layout/BottomNavigation'
import { CartView } from './CartView'
import { ExploreView } from './ExploreView'
import { HomeView } from './HomeView'
import { OrdersView } from './OrdersView'
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

  const handleBook = (productName: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.name.toLowerCase().includes(productName.toLowerCase()) || productName.toLowerCase().includes(item.name.toLowerCase()))
      if (existing) {
        return prev.map((item) => (item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          name: productName,
          variant: productName.includes('17') ? '17 KG' : '14.2 KG',
          unitPrice: productName.includes('17') ? 2400 : 1300,
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
          <HomeView onBook={handleBook} customerProfile={customerProfile} />
        )}
        {activeTab === 'orders' && (
          <OrdersView
            onNavigateToExplore={() => setActiveTab('explore')}
            onTrackOrder={(orderId: string) => alert(`Opening tracking details for ${orderId}`)}
            onOrderAgain={(orderId: string) => alert(`Reordering items from ${orderId}`)}
          />
        )}
        {activeTab === 'cart' && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onNavigateToExplore={() => setActiveTab('explore')}
            customerProfile={customerProfile}
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
          activeTab={activeTab}
          cartCount={cartCount}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  )
}
