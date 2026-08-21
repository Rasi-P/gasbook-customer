import { useState, useEffect } from 'react'
import type { ActiveTab } from '../../types'
import type { CustomerProfile, NotificationItem } from '../../lib/auth'
import { fetchCustomerNotifications, markNotificationRead } from '../../lib/auth'
import sabcoLogo from '../../assets/sabco_logo.png'
import { DesktopNotificationsPopover } from './DesktopNotificationsPopover'

interface DesktopHeaderProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  customerProfile: CustomerProfile | null
  cartCount: number
  onLogout?: () => void
}

export function DesktopHeader({
  activeTab,
  setActiveTab,
  customerProfile,
  cartCount,
  onLogout,
}: DesktopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const customerName = customerProfile?.name?.trim() || customerProfile?.full_name?.trim() || 'Customer'
  const initials = customerName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'C'

  useEffect(() => {
    fetchCustomerNotifications().then(setNotifications).catch(() => {})
  }, [activeTab])

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch {
      // ignore
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <header className="desktop-header-bar">
      <div className="desktop-header-inner">
        {/* Left: Brand Logo & Title */}
        <div className="desktop-brand-group" onClick={() => setActiveTab('home')}>
          <img src={sabcoLogo} className="desktop-brand-logo" alt="GasBook Sabco Logo" />
          <h1 className="desktop-brand-title">GasBook</h1>
        </div>

        {/* Center: Navigation Links */}
        <nav className="desktop-nav-links">
          <button
            className={`desktop-nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Home</span>
          </button>

          <button
            className={`desktop-nav-item ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>Explore Cylinders</span>
          </button>

          <button
            className={`desktop-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>My Orders</span>
          </button>

          <button
            className={`desktop-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Cart</span>
            {cartCount > 0 && (
              <span
                style={{
                  background: '#ff7a00',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Notifications, Profile */}
        <div className="desktop-header-actions">
          {/* Notifications Button & Popover */}
          <div style={{ position: 'relative' }}>
            <button
              className="desktop-icon-btn"
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && <span className="desktop-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <DesktopNotificationsPopover
                notifications={notifications}
                onMarkRead={handleMarkRead}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* Profile Menu Trigger */}
          <div style={{ position: 'relative' }}>
            <div
              className="desktop-profile-chip"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="desktop-avatar">{initials}</div>
              <span className="desktop-profile-name">{customerName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '200px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                  border: '1px solid #e2e8f0',
                  padding: '8px',
                  zIndex: 1100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    setActiveTab('profile')
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#1e293b',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>My Profile</span>
                </button>

                <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    if (onLogout) onLogout()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
