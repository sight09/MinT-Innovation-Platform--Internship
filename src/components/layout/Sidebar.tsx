'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Rocket, Users, TrendingUp, LineChart,
  MessageSquare, Sparkles, BookOpen, Bell, Settings,
  ChevronLeft, Menu, Shield, Star, Briefcase, FileText,
  Building2, LogOut, X,
} from 'lucide-react'
import { MintLogo } from '@/components/ui/MintLogo'
import { NotificationPopover } from '@/components/layout/NotificationPopover'
import { getInitials } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}

interface SidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role: string
    avatarUrl?: string
    isVerified?: boolean
  }
  notificationCount?: number
}

function getNavItems(role: string, isVerified: boolean = false): NavItem[] {
  const base: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]

  if (role === 'MINT_ADMIN') {
    return [
      ...base,
      { href: '/admin/startups', icon: Rocket, label: 'Startups' },
      { href: '/admin/mentors', icon: Shield, label: 'Mentors' },
      { href: '/admin/investors', icon: Briefcase, label: 'Investors' },
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/analytics', icon: LineChart, label: 'Analytics' },
      { href: '/admin/knowledge', icon: BookOpen, label: 'Knowledge Base' },
      { href: '/admin/audit', icon: FileText, label: 'Audit Logs' },
      { href: '/admin/settings', icon: Settings, label: 'Settings' },
    ]
  }

  if (!isVerified) {
    return base
  }

  if (role === 'STARTUP') {
    return [
      ...base,
      { href: '/dashboard/startup/profile', icon: Building2, label: 'My Startup' },
      { href: '/dashboard/startup/submit', icon: FileText, label: 'Submit Problem' },
      { href: '/startups', icon: Rocket, label: 'Discover Startups' },
      { href: '/dashboard/startup/feedback', icon: Star, label: 'Mentor Feedback' },
      { href: '/dashboard/startup/investors', icon: TrendingUp, label: 'Investor Interest' },
      { href: '/messages', icon: MessageSquare, label: 'Messages' },
      { href: '/resources', icon: BookOpen, label: 'Resources' },
    ]
  }

  if (role === 'MINT_MENTOR') {
    return [
      ...base,
      { href: '/startups', icon: Rocket, label: 'Startups' },
      { href: '/dashboard/mentor/assignments', icon: Users, label: 'My Assignments' },
      { href: '/dashboard/mentor/reviews', icon: Star, label: 'My Reviews' },
      { href: '/messages', icon: MessageSquare, label: 'Messages' },
      { href: '/resources', icon: BookOpen, label: 'Resources' },
    ]
  }

  if (role === 'INVESTOR') {
    return [
      ...base,
      { href: '/startups', icon: Rocket, label: 'Discover Startups' },
      { href: '/dashboard/investor/recommendations', icon: Star, label: 'Recommendations' },
      { href: '/dashboard/investor/saved', icon: Briefcase, label: 'Saved Startups' },
      { href: '/dashboard/investor/interests', icon: TrendingUp, label: 'My Interests' },
      { href: '/messages', icon: MessageSquare, label: 'Messages' },
    ]
  }

  return base
}

const roleColors: Record<string, string> = {
  STARTUP: '#22D3EE',
  MINT_MENTOR: '#4ADE80',
  INVESTOR: '#FBBF24',
  MINT_ADMIN: '#F87171',
}

const roleLabels: Record<string, string> = {
  STARTUP: 'Startup',
  MINT_MENTOR: 'MInT Mentor',
  INVESTOR: 'Investor',
  MINT_ADMIN: 'Admin',
}

export function Sidebar({ user, notificationCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [localNotifCount, setLocalNotifCount] = useState(notificationCount)
  const pathname = usePathname()
  const navItems = getNavItems(user.role, user.isVerified)
  const initials = getInitials(
    user.name?.split(' ')[0] || 'U',
    user.name?.split(' ')[1] || ''
  )

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 1024) setCollapsed(true)
    }
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Update main-content margin when sidebar collapses
  useEffect(() => {
    const main = document.querySelector('.main-content') as HTMLElement | null
    if (main) {
      main.style.marginLeft = collapsed ? '68px' : '260px'
    }
  }, [collapsed])

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Logo Header */}
      <div style={{
        padding: collapsed ? '16px 10px' : '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 68, gap: 8,
      }}>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <MintLogo size="sm" showText variant="dark" />
          </motion.div>
        )}
        {collapsed && <MintLogo size="xs" showText={false} variant="dark" />}

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28, height: 28, flexShrink: 0,
            }}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}

        {collapsed && (
          <div style={{ position: 'absolute', top: 20, right: -12 }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: '#006B6B',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24, height: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
              aria-label="Expand sidebar"
            >
              <ChevronLeft size={12} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {/* Section Label */}
        {!collapsed && (
          <div style={{
            padding: '6px 20px 4px',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: 4,
          }}>
            Navigation
          </div>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? '10px 0' : '9px 20px',
                }}
                data-tooltip={collapsed ? item.label : undefined}
              >
                <item.icon
                  size={18}
                  style={{
                    flexShrink: 0,
                    color: isActive ? '#4DD9E0' : 'rgba(255,255,255,0.6)',
                  }}
                />
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                    {item.label}
                  </span>
                )}
                {item.badge && !collapsed && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#006B6B',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 99,
                    minWidth: 18,
                    textAlign: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Notifications + User */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '10px 0' }}>

        {/* Notifications — opens popover, no redirect */}
          <button
            onClick={() => setNotifOpen(true)}
            style={{
              all: 'unset',
              display: 'flex',
              width: '100%',
              cursor: 'pointer',
            }}
            aria-label="Open notifications"
          >
            <div
              className="sidebar-item"
              style={{
                width: '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px 0' : '9px 20px',
              }}
              data-tooltip={collapsed ? 'Notifications' : undefined}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Bell size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
                {localNotifCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 9, height: 9,
                    background: '#F5A623',
                    borderRadius: '50%',
                    border: '2px solid #0F5567',
                  }} />
                )}
              </div>
              {!collapsed && (
                <>
                  <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Notifications</span>
                  {localNotifCount > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: '#F5A623',
                      color: '#1a1a1a',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 99,
                    }}>
                      {localNotifCount}
                    </span>
                  )}
                </>
              )}
            </div>
          </button>

        {/* User Card */}
        <div style={{
          margin: '6px 10px 0',
          padding: collapsed ? '8px 0' : '10px 12px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `${roleColors[user.role]}22`,
            border: `2px solid ${roleColors[user.role]}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700,
            color: roleColors[user.role],
            flexShrink: 0,
          }}>
            {initials || 'U'}
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8rem', fontWeight: 600,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {user.name}
                </div>
                <div style={{
                  fontSize: '0.65rem', color: roleColors[user.role],
                  fontWeight: 600,
                }}>
                  {roleLabels[user.role]}
                </div>
              </div>
              <button
                onClick={() => setShowSignOutModal(true)}
                style={{
                  color: 'rgba(255,255,255,0.4)', flexShrink: 0,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar — fixed position, always visible on desktop */}
      <motion.div
        animate={{ width: collapsed ? 68 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          background: '#0F5567',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
          zIndex: 50,
          flexShrink: 0,
          display: 'none',
        }}
        id="desktop-sidebar"
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 100,
          background: '#0F5567',
          border: 'none',
          color: 'white',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40, height: 40,
          boxShadow: '0 2px 8px rgba(13,43,78,0.3)',
        }}
        id="mobile-menu-btn"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(13,43,78,0.6)',
                zIndex: 90, backdropFilter: 'blur(4px)',
              }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 260,
                background: '#0F5567',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                zIndex: 100,
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.7)',
                  borderRadius: 6, padding: 4,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignOutModal(false)}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 24,
                width: '100%',
                maxWidth: 360,
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#FEE2E2', color: '#DC2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <LogOut size={24} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#0F5567', fontWeight: 700 }}>
                Sign Out
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: '#64748B' }}>
                Are you sure you want to sign out of your account?
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowSignOutModal(false)}
                  style={{
                    flex: 1, padding: '10px 0',
                    background: '#F1F5F9', color: '#475569',
                    border: 'none', borderRadius: 8,
                    fontWeight: 600, cursor: 'pointer',
                    transition: 'background 150ms'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
                >
                  Cancel
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  style={{
                    flex: 1, padding: '10px 0',
                    background: '#DC2626', color: '#FFFFFF',
                    border: 'none', borderRadius: 8,
                    fontWeight: 600, cursor: 'pointer',
                    transition: 'background 150ms'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#B91C1C'}
                  onMouseLeave={e => e.currentTarget.style.background = '#DC2626'}
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Responsive display rules */}
      <style>{`
        @media (min-width: 1024px) {
          #desktop-sidebar { display: flex !important; }
          #mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 1023px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Notification Popover — inline, no redirect */}
      {notifOpen && (
        <NotificationPopover
          onClose={() => setNotifOpen(false)}
          onCountChange={(count) => setLocalNotifCount(count)}
        />
      )}
    </>
  )
}
