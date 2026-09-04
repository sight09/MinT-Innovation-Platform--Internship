'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell, X, CheckCircle, Shield, Briefcase, Building2,
  TrendingUp, ArrowRight, Trash2, Check,
} from 'lucide-react'

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

function getIcon(type: string, entityType: string | null) {
  if (entityType === 'MINT_MENTOR') return Shield
  if (entityType === 'INVESTOR') return Briefcase
  if (entityType === 'STARTUP') return Building2
  if (type === 'INVESTOR_INTEREST') return TrendingUp
  if (type === 'APPROVAL') return CheckCircle
  return Bell
}

function getLink(notif: Notification, role: string): string {
  if (notif.link) return notif.link
  if (notif.type === 'NEW_REGISTRATION') {
    if (notif.entityType === 'MINT_MENTOR') return '/admin/mentors'
    if (notif.entityType === 'INVESTOR') return '/admin/investors'
    if (notif.entityType === 'STARTUP') return '/admin/startups'
  }
  if (notif.type === 'INVESTOR_INTEREST' && notif.startupId) return `/startups/${notif.startupId}`
  return '/dashboard'
}

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface Props {
  onClose: () => void
  onCountChange?: (count: number) => void
}

export function NotificationPopover({ onClose, onCountChange }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const router = useRouter()
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Fetch notifications + session role
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [notifsRes, sessionRes] = await Promise.all([
          fetch('/api/notifications'),
          fetch('/api/auth/session'),
        ])
        if (cancelled) return
        if (notifsRes.ok) {
          const data = await notifsRes.json()
          const notifs: Notification[] = data.notifications || []
          setNotifications(notifs)
          // Update parent count
          onCountChange?.(notifs.filter(n => !n.isRead).length)
        }
        if (sessionRes.ok) {
          const session = await sessionRes.json()
          setRole(session?.user?.role || '')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [onCountChange])

  const markRead = useCallback(async (ids: string[]) => {
    if (!ids.length) return
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    setNotifications(prev => {
      const updated = prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n)
      const newCount = updated.filter(n => !n.isRead).length
      setTimeout(() => onCountChange?.(newCount), 0)
      return updated
    })
  }, [onCountChange])

  async function handleItemClick(notif: Notification) {
    if (!notif.isRead) await markRead([notif.id])
    const href = getLink(notif, role)
    onClose()
    router.push(href)
  }

  async function handleDismiss(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id], deleteAll: true }),
    })
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      const newCount = updated.filter(n => !n.isRead).length
      setTimeout(() => onCountChange?.(newCount), 0)
      return updated
    })
  }

  async function handleMarkAllRead() {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
    if (!unreadIds.length) return
    await markRead(unreadIds)
  }

  async function handleClearAll() {
    if (!notifications.length) return
    setClearing(true)
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: notifications.map(n => n.id), deleteAll: true }),
      })
      setNotifications([])
      onCountChange?.(0)
    } finally {
      setClearing(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="notif-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popover panel */}
      <div
        ref={popoverRef}
        className="notif-popover"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        {/* ── Header ── */}
        <div className="notif-popover-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} style={{ color: 'var(--mint-teal)', flexShrink: 0 }} />
            <div>
              <div style={{
                fontWeight: 700, fontSize: '0.95rem',
                color: 'var(--text-primary)', lineHeight: 1.2,
              }}>
                Notifications
              </div>
              {unreadCount > 0 && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {unreadCount} unread
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Mark all as read"
                style={{
                  background: 'rgba(0,107,107,0.08)',
                  border: '1px solid rgba(0,107,107,0.2)',
                  color: 'var(--mint-teal)',
                  borderRadius: 6, cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  gap: 5, padding: '5px 10px',
                  fontSize: '0.75rem', fontWeight: 600,
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  transition: 'background 150ms',
                }}
              >
                <Check size={13} />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close notifications"
              style={{
                background: 'var(--surface-base)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-muted)',
                borderRadius: 6, cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                width: 30, height: 30, flexShrink: 0,
                fontFamily: 'inherit',
                transition: 'background 150ms',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="notif-popover-body">
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '48px 24px', gap: 14,
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Loading notifications…
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '56px 24px', textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--surface-base)',
                border: '1px solid var(--surface-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                <Bell size={24} style={{ color: 'var(--text-light)' }} />
              </div>
              <div style={{
                fontWeight: 600, fontSize: '0.9rem',
                color: 'var(--text-primary)', marginBottom: 6,
              }}>
                You're all caught up!
              </div>
              <p style={{
                fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0,
              }}>
                No notifications right now.
              </p>
            </div>
          ) : (
            notifications.map(notif => {
              const Icon = getIcon(notif.type, notif.entityType)
              const isUnread = !notif.isRead
              return (
                <div
                  key={notif.id}
                  role="button"
                  tabIndex={0}
                  className={`notif-list-item${isUnread ? ' unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleItemClick(notif)
                    }
                  }}
                >
                  {/* Icon bubble */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: isUnread ? 'rgba(0,107,107,0.12)' : 'var(--surface-base)',
                    border: `1px solid ${isUnread ? 'rgba(0,107,107,0.25)' : 'var(--surface-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={isUnread ? 'var(--mint-teal)' : 'var(--text-muted)'} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: 8, marginBottom: 3,
                    }}>
                      <span style={{
                        fontSize: '0.84rem',
                        fontWeight: isUnread ? 700 : 500,
                        color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
                        lineHeight: 1.3,
                      }}>
                        {notif.title}
                      </span>
                      <span style={{
                        fontSize: '0.68rem', color: 'var(--text-muted)',
                        whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1,
                      }}>
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.77rem', color: 'var(--text-muted)',
                      margin: 0, lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden',
                    }}>
                      {notif.message}
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      marginTop: 5, fontSize: '0.72rem', color: 'var(--mint-teal)',
                    }}>
                      <span>View details</span>
                      <ArrowRight size={10} />
                    </div>
                  </div>

                  {/* Unread dot + dismiss */}
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 8, flexShrink: 0,
                  }}>
                    {isUnread && (
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--mint-teal)',
                      }} />
                    )}
                    <button
                      onClick={(e) => handleDismiss(notif.id, e)}
                      title="Dismiss"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 2, borderRadius: 4,
                        display: 'flex', alignItems: 'center',
                        opacity: 0.4, transition: 'opacity 150ms, color 150ms',
                        fontFamily: 'inherit',
                        lineHeight: 1,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.style.color = '#F87171'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.opacity = '0.4'
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="notif-popover-footer">
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 8,
          }}>
            <Link
              href="/notifications"
              onClick={onClose}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--mint-teal)',
                textDecoration: 'none', transition: 'color 150ms',
              }}
            >
              View all notifications
              <ArrowRight size={13} />
            </Link>

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#F87171', fontSize: '0.78rem', fontWeight: 600,
                  padding: 0, opacity: clearing ? 0.5 : 1,
                  fontFamily: 'inherit', transition: 'opacity 150ms',
                }}
              >
                <Trash2 size={12} />
                {clearing ? 'Clearing…' : 'Clear all'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
