import { useState, useEffect, useCallback } from 'react'
import { type BookingRecord, type CustomerProfile } from '../../lib/auth'
import type { ActiveTab, CartItem, OrderItem, ProfileUser } from '../../types'
import { ACTIVE_STATUS_FILTER, getOrderStatusMeta } from '../../lib/orderStatus'
import { buildOrderPrice } from '../../lib/pricing'
import { currentNavState, hydrateHomeState, readNavState, saveHomeState, writeTabHistory, type NavState } from '../../lib/uiState'
import { BottomNavigation } from '../layout/BottomNavigation'
import { CartView } from './CartView'
import { CheckoutView } from './CheckoutView'
import { ExploreView } from './ExploreView'
import { HomeView } from './HomeView'
import { OrdersView } from './OrdersView'
import { OrderSuccessView } from './OrderSuccessView'
import { getCylinderDisplay } from '../../lib/formatters'
import { ProfileView } from './ProfileView'
import { TrackOrderView } from './TrackOrderView'
import { fetchPaginatedBookings } from '../../lib/api-queries'
import { DesktopHeader } from '../desktop/DesktopHeader'
import { DesktopHomeView } from '../desktop/DesktopHomeView'
import { DesktopExploreView } from '../desktop/DesktopExploreView'
import { DesktopOrdersView } from '../desktop/DesktopOrdersView'
import { DesktopCartView } from '../desktop/DesktopCartView'
import { DesktopCheckoutView } from '../desktop/DesktopCheckoutView'
import { DesktopTrackOrderView } from '../desktop/DesktopTrackOrderView'
import { DesktopProfileView } from '../desktop/DesktopProfileView'
import { DesktopOrderSuccessView } from '../desktop/DesktopOrderSuccessView'

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
  /** Signed-in user id; keys the per-user sessionStorage snapshot. */
  userId: number
  onLogout?: () => void
  customerProfile: CustomerProfile | null
  onProfileUpdated?: () => void
}

interface NavigateOptions {
  trackingBookingId?: number | null
  previousTab?: ActiveTab
  /** Replace the current history entry instead of pushing a new one (programmatic redirects). */
  replace?: boolean
}

export function HomeScreen({ userId, onLogout, customerProfile, onProfileUpdated }: HomeScreenProps) {
  // Hydrate from the URL hash + sessionStorage so a reload restores the tab, cart and tracked order.
  const [initialState] = useState(() => hydrateHomeState(userId))
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialState.activeTab)
  const [cartItems, setCartItems] = useState<CartItem[]>(initialState.cartItems)
  const [lastCreatedBookings, setLastCreatedBookings] = useState<BookingRecord[]>(initialState.lastCreatedBookings)
  const [realOrders, setRealOrders] = useState<OrderItem[]>([])
  const [trackingBookingId, setTrackingBookingId] = useState<number | null>(initialState.trackingBookingId)
  const [previousTab, setPreviousTab] = useState<ActiveTab>(initialState.previousTab)

  // Persist UI state per user (cleared on logout by lib/auth logout()).
  useEffect(() => {
    saveHomeState(userId, { cartItems, activeTab, previousTab, trackingBookingId, lastCreatedBookings })
  }, [userId, cartItems, activeTab, previousTab, trackingBookingId, lastCreatedBookings])

  // Make the current entry describe the restored tab (idempotent under StrictMode), then
  // let browser Back / Forward move between tabs via popstate.
  useEffect(() => {
    writeTabHistory(
      { gasbookTab: initialState.activeTab, trackingBookingId: initialState.trackingBookingId, previousTab: initialState.previousTab, userId },
      true,
    )

    const handlePopState = (event: PopStateEvent) => {
      const state = readNavState(event.state)
      if (state && state.userId === userId) {
        setActiveTab(state.gasbookTab === 'track-order' && state.trackingBookingId === null ? 'home' : state.gasbookTab)
        setTrackingBookingId(state.trackingBookingId)
        setPreviousTab(state.previousTab)
      } else {
        // Unknown entry, or one left behind by a previous user in this tab: normalise it to Home.
        setActiveTab('home')
        setTrackingBookingId(null)
        setPreviousTab('home')
        writeTabHistory({ gasbookTab: 'home', trackingBookingId: null, previousTab: 'home', userId }, true)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [initialState, userId])

  const navigateTo = useCallback(
    (tab: ActiveTab, options: NavigateOptions = {}) => {
      const nextTracking = options.trackingBookingId !== undefined ? options.trackingBookingId : trackingBookingId
      const nextPrevious = options.previousTab ?? previousTab

      setTrackingBookingId(nextTracking)
      setPreviousTab(nextPrevious)
      setActiveTab(tab)

      const state: NavState = { gasbookTab: tab, trackingBookingId: nextTracking, previousTab: nextPrevious, userId }
      writeTabHistory(state, Boolean(options.replace) || (tab === activeTab && nextTracking === trackingBookingId))
    },
    [activeTab, previousTab, trackingBookingId, userId],
  )

  const openTrackOrder = (id: number, from: ActiveTab) => {
    navigateTo('track-order', { trackingBookingId: id, previousTab: from })
  }

  const closeTrackOrder = () => {
    const state = currentNavState()
    if (state?.pushed && state.gasbookTab === 'track-order') {
      window.history.back()
      return
    }
    navigateTo(previousTab, { trackingBookingId: null })
  }

  const fetchActiveOrder = async () => {
    try {
      // Fetch just the ongoing orders for the Home active order card
      const response = await fetchPaginatedBookings({ status: ACTIVE_STATUS_FILTER, page: 1 })
      const items = response.results
      const mapped: OrderItem[] = items.map((b: any) => {
        const meta = getOrderStatusMeta(b.status, b)
        const display = getCylinderDisplay(b.cylinder_type_name, b.cylinder_type_weight)
        const pricing = buildOrderPrice(b)

        return {
          id: `ord-${b.id}`,
          orderNumber: `Order #${b.order_id}`,
          date: b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
          productName: display.title,
          weight: display.badge,
          price: pricing.price,
          originalPrice: pricing.originalPrice,
          status: meta.kind,
          statusCode: b.status,
          statusLabel: meta.label,
          etaOrDate: meta.description,
          actionLabel: meta.kind === 'cancelled' ? 'View Details' : (meta.kind === 'completed' ? 'Order Again' : 'Track Order'),
          rawBooking: b,
          rejectionReason: b.rejection_reason,
        }
      })
      setRealOrders(mapped)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    void fetchActiveOrder()
  }, [activeTab])

  // Safety guards: never leave the user on a tab that would render blank.
  useEffect(() => {
    if (activeTab === 'checkout' && cartItems.length === 0) {
      navigateTo('explore', { replace: true })
    } else if (activeTab === 'order-success' && lastCreatedBookings.length === 0) {
      navigateTo('home', { replace: true })
    } else if (activeTab === 'track-order' && trackingBookingId === null) {
      navigateTo(previousTab === 'track-order' ? 'home' : previousTab, { replace: true })
    }
  }, [activeTab, cartItems, lastCreatedBookings, trackingBookingId, previousTab, navigateTo])

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

  const handleBook = (productName: string, price?: number, cylinderTypeId?: number, weight?: string | number) => {
    setCartItems((prev) => {
      // Find existing exactly by cylinderTypeId if defined, or strictly fallback to name match if no ID provided.
      const existing = prev.find((item) => cylinderTypeId ? item.cylinderTypeId === cylinderTypeId : item.variant === productName && item.name === weight)
      if (existing) {
        return prev.map((item) => (item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          cylinderTypeId: cylinderTypeId || 1,
          name: weight ? weight.toString() : 'Gas Cylinder',
          variant: productName || 'Cylinder',
          unitPrice: price || 1300,
          quantity: 1,
          type: 'cylinder',
        },
      ]
    })
    navigateTo('cart')
  }

  // Removed old handleOrderAgain, OrdersView will call handleBook directly

  const handleNavigateToCart = () => {
    // Actually, "Cart" is deprecated in this flow. We'll map this back to home if called
    navigateTo('home')
  }

  const handleOrderCreated = (bookings: BookingRecord[]) => {
    setCartItems([]) // Clear cart only after checkout order creation succeeds
    setLastCreatedBookings(bookings)
    navigateTo('order-success')
    void fetchActiveOrder()
  }

  return (
    <div className="home-root">
      {/* MOBILE / PWA VIEW (LOCKED & UNTOUCHED) */}
      <div className="mobile-view-wrapper">
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
              onNavigateToExplore={() => navigateTo('explore')}
              customerProfile={customerProfile}
              latestActiveOrder={realOrders[0]}
              onViewOrders={() => navigateTo('orders')}
              onTrackOrder={(id: number) => openTrackOrder(id, activeTab)}
            />
          )}
          {activeTab === 'orders' && (
            <OrdersView
              onNavigateToExplore={() => navigateTo('explore')}
              onTrackOrder={(id: number) => openTrackOrder(id, activeTab)}
              onOrderAgain={handleBook}
            />
          )}
          {activeTab === 'cart' && (
            <CartView
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onNavigateToExplore={() => navigateTo('explore')}
              onProceedToCheckout={() => navigateTo('checkout')}
              customerProfile={customerProfile}
              profileUser={profileUser}
              onProfileUpdated={onProfileUpdated}
            />
          )}
          {activeTab === 'checkout' && (
            <CheckoutView
              cartItems={cartItems}
              customerProfile={customerProfile}
              profileUser={profileUser}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onProfileUpdated={onProfileUpdated}
              onNavigateToExplore={() => navigateTo('explore')}
              onBackToCart={() => navigateTo('cart')}
              onOrderCreated={handleOrderCreated}
            />
          )}
          {activeTab === 'order-success' && lastCreatedBookings.length > 0 && (
            <OrderSuccessView
              orders={lastCreatedBookings}
              onViewOrders={() => navigateTo('orders')}
              onTrackOrder={(id) => openTrackOrder(id, 'home')}
              onBackToHome={() => navigateTo('home')}
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
          {activeTab !== 'order-success' && (
            <BottomNavigation
              activeTab={activeTab === 'explore' ? 'home' : activeTab}
              cartCount={cartCount}
              setActiveTab={navigateTo}
            />
          )}

          {/* Track Order View */}
          {activeTab === 'track-order' && trackingBookingId !== null && (
            <TrackOrderView
              bookingId={trackingBookingId}
              onBack={closeTrackOrder}
            />
          )}
        </div>
      </div>

      {/* DESKTOP / WEB VIEW (MODERN CUSTOMER LPG PORTAL) */}
      <div className="desktop-view-wrapper">
        <DesktopHeader
          activeTab={activeTab}
          setActiveTab={navigateTo}
          customerProfile={customerProfile}
          cartCount={cartCount}
          onLogout={onLogout}
        />

        <main style={{ flex: 1 }}>
          {activeTab === 'home' && (
            <DesktopHomeView
              onNavigateToExplore={() => navigateTo('explore')}
              customerProfile={customerProfile}
              latestActiveOrder={realOrders[0]}
              onViewOrders={() => navigateTo('orders')}
              onTrackOrder={(id: number) => openTrackOrder(id, 'home')}
              onBook={handleBook}
            />
          )}

          {activeTab === 'explore' && (
            <DesktopExploreView
              onBook={handleBook}
              onNavigateToCart={() => navigateTo('cart')}
            />
          )}

          {activeTab === 'orders' && (
            <DesktopOrdersView
              onNavigateToExplore={() => navigateTo('explore')}
              onTrackOrder={(id: number) => openTrackOrder(id, 'orders')}
              onOrderAgain={handleBook}
            />
          )}

          {activeTab === 'cart' && (
            <DesktopCartView
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onNavigateToExplore={() => navigateTo('explore')}
              onProceedToCheckout={() => navigateTo('checkout')}
              customerProfile={customerProfile}
              profileUser={profileUser}
              onProfileUpdated={onProfileUpdated}
            />
          )}

          {activeTab === 'checkout' && (
            <DesktopCheckoutView
              cartItems={cartItems}
              customerProfile={customerProfile}
              profileUser={profileUser}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onProfileUpdated={onProfileUpdated}
              onNavigateToExplore={() => navigateTo('explore')}
              onBackToCart={() => navigateTo('cart')}
              onOrderCreated={handleOrderCreated}
            />
          )}

          {activeTab === 'order-success' && lastCreatedBookings.length > 0 && (
            <DesktopOrderSuccessView
              orders={lastCreatedBookings}
              onViewOrders={() => navigateTo('orders')}
              onTrackOrder={(id) => openTrackOrder(id, 'home')}
              onBackToHome={() => navigateTo('home')}
            />
          )}

          {activeTab === 'profile' && (
            <DesktopProfileView
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

          {activeTab === 'track-order' && trackingBookingId !== null && (
            <DesktopTrackOrderView
              bookingId={trackingBookingId}
              onBack={closeTrackOrder}
            />
          )}
        </main>
      </div>
    </div>
  )
}
