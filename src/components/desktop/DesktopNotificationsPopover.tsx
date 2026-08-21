import { useEffect, useRef } from 'react'
import type { NotificationItem } from '../../lib/auth'

interface DesktopNotificationsPopoverProps {
  notifications: NotificationItem[]
  onMarkRead: (id: number) => void
  onClose: () => void
}

export function DesktopNotificationsPopover({
  notifications,
  onMarkRead,
  onClose,
}: DesktopNotificationsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: '56px',
        right: '0',
        width: '360px',
        maxHeight: '480px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
        border: '1px solid #e2e8f0',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'desktopScaleIn 0.2s ease-out',
      }}
    >
      {/* Popover Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
            Notifications
          </h3>
          {notifications.filter((n) => !n.is_read).length > 0 && (
            <span
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              {notifications.filter((n) => !n.is_read).length} new
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Popover List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: n.is_read ? '#f8fafc' : '#eff6ff',
                border: n.is_read ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>{n.title}</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                {n.body}
              </p>
            </div>
          ))
        ) : (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ margin: 0, fontSize: '13.5px' }}>No notifications at this time</p>
          </div>
        )}
      </div>
    </div>
  )
}
