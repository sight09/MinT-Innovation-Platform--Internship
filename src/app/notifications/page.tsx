'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, CheckCircle, Users, Shield, Briefcase, Building2,
  TrendingUp, ArrowRight, ArrowLeft, Trash2, X,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  entityType: string | null
  entityId: string | null
  startupId: string | null
  link: string | null
  isRead: boolean
  createdAt: string
}

function getNotificationIcon(type: string, entityType: string | null) {
  if (entityType === 'MINT_MENTOR') return Shield
  if (entityType === 'INVESTOR') return Briefcase
  if (entityType === 'STARTUP') return Building2
  if (type === 'INVESTOR_INTEREST') return TrendingUp
  if (type === 'APPROVAL') return CheckCircle
  return Bell
}

function getNotificationLink(notif: Notification, role: string): string {
  if (notif.link) return notif.link

  if (notif.type === 'NEW_REGISTRATION') {
    if (notif.entityType === 'MINT_MENTOR') return '/admin/mentors'
    if (notif.entityType === 'INVESTOR') return '/admin/investors'
    if (notif.entityType === 'STARTUP') return '/admin/startups'
  }

  if (notif.type === 'INVESTOR_INTEREST' && notif.startupId) {
    return `/startups/${notif.startupId}`
  }

  if (notif.type === 'APPROVAL') return '/dashboard'

  return '/dashboard'
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [notifsRes, sessionRes] = await Promise.all([
          fetch('/api/notifications'),
          fetch('/api/auth/session'),
        ])

        if (notifsRes.ok) {
          const data = await notifsRes.json()
          setNotifications(data.notifications || [])

          // Auto-mark all unread as read on page visit
          const unreadIds = (data.notifications || [])
            .filter((n: Notification) => !n.isRead)
            .map((n: Notification) => n.id)

          if (unreadIds.length > 0) {
            await fetch('/api/notifications/mark-read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: unreadIds }),
            })
            setNotifications(prev =>
              prev.map(n => (unreadIds.includes(n.id) ? { ...n, isRead: true } : n))
            )
          }
        }

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json()
          setRole(sessionData?.user?.role || '')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleClick(notif: Notification) {
    const link = getNotificationLink(notif, role)
    router.push(link)
  }

  async function handleClearAll() {
    if (notifications.length === 0) return
    setClearing(true)
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: notifications.map(n => n.id), deleteAll: true }),
      })
      if (res.ok) {
        setNotifications([])
        toast.success('All notifications cleared')
      } else {
        toast.error('Failed to clear notifications')
      }
    } catch {
      toast.error('Failed to clear notifications')
    } finally {
      setClearing(false)
    }
  }

  async function handleDismiss(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], deleteAll: true }),
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch {
      toast.error('Failed to dismiss')
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>Loading notifications…</p>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.875rem',
            fontWeight: 500, padding: '4px 0', marginBottom: 20,
            transition: 'color 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>Notifications</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {notifications.length > 0 && (
              <span className="badge badge-blue">{notifications.length} total</span>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="btn btn-ghost btn-sm"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: '#F87171', border: '1px solid rgba(248,113,113,0.3)',
                }}
                title="Clear all notifications"
              >
                <Trash2 size={14} />
                {clearing ? 'Clearing…' : 'Clear All'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="empty-state" style={{
          background: 'var(--surface-card)', borderRadius: 16,
          border: '1px solid var(--surface-border)',
        }}>
          <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>You're all caught up!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No notifications at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {notifications.map(notif => {
            const Icon = getNotificationIcon(notif.type, notif.entityType)
            const isUnread = !notif.isRead
            const link = getNotificationLink(notif, role)

            return (
              <div
                key={notif.id}
                role="button"
                tabIndex={0}
                onClick={() => handleClick(notif)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(notif); } }}
                style={{
                  all: 'unset',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '18px 20px',
                  background: isUnread ? 'rgba(0,107,107,0.06)' : 'var(--surface-card)',
                  border: `1px solid ${isUnread ? 'rgba(0,107,107,0.25)' : 'var(--surface-border)'}`,
                  borderLeft: isUnread ? '4px solid var(--mint-teal)' : '4px solid transparent',
                  borderRadius: 12,
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'background 0.15s, transform 0.1s',
                  textAlign: 'left',
                  position: 'relative',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = isUnread ? 'rgba(0,107,107,0.06)' : 'var(--surface-card)')}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: isUnread ? 'rgba(0,107,107,0.15)' : 'var(--surface-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={isUnread ? 'var(--mint-teal)' : 'var(--text-muted)'} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <h4 style={{
                      margin: '0 0 4px',
                      fontSize: '0.95rem',
                      color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: isUnread ? 700 : 500,
                    }}>
                      {notif.title}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {notif.message}
                  </p>
                  {link && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--mint-teal)' }}>
                      <span>View details</span>
                      <ArrowRight size={12} />
                    </div>
                  )}
                </div>

                {/* Unread dot */}
                {isUnread && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--mint-teal)', flexShrink: 0, marginTop: 6,
                  }} />
                )}

                {/* Dismiss (×) button */}
                <button
                  onClick={(e) => handleDismiss(notif.id, e)}
                  title="Dismiss"
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 2, borderRadius: 4,
                    display: 'flex', alignItems: 'center',
                    opacity: 0.5,
                    transition: 'opacity 150ms, color 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#F87171' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
