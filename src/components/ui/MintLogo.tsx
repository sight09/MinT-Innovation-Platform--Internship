import React from 'react'
import Image from 'next/image'

interface MintLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  style?: React.CSSProperties
  /** Use 'dark' variant (white text) for dark nav backgrounds, 'light' for white backgrounds */
  variant?: 'light' | 'dark'
}

const sizes = {
  xs: { logo: 28, fontSize: '0.875rem', subFontSize: '0.5rem', gap: 8 },
  sm: { logo: 36, fontSize: '1rem',     subFontSize: '0.55rem', gap: 10 },
  md: { logo: 44, fontSize: '1.15rem',  subFontSize: '0.6rem',  gap: 12 },
  lg: { logo: 60, fontSize: '1.5rem',   subFontSize: '0.7rem',  gap: 14 },
}

export function MintLogo({ size = 'md', showText = true, className, style, variant = 'light' }: MintLogoProps) {
  const s = sizes[size]
  const textColor     = variant === 'dark' ? '#FFFFFF' : '#0F5567'
  const subtextColor  = variant === 'dark' ? 'rgba(255,255,255,0.6)' : '#006B6B'

  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: s.gap, userSelect: 'none', ...style }}
      role="img"
      aria-label="MInT — Ministry of Innovation and Technology Ethiopia"
    >
      {/* Official MInT Logo Image */}
      <Image
        src="/mint-logo.png"
        alt="MInT Logo"
        width={s.logo}
        height={s.logo}
        style={{
          objectFit: 'contain', flexShrink: 0,
          filter: variant === 'dark' ? 'drop-shadow(0 0 8px rgba(0,180,180,0.35))' : 'none',
        }}
        priority
      />

      {showText && (
        <div style={{ lineHeight: 1.2 }}>
          <div style={{
            fontWeight: 500,
            fontSize: s.fontSize,
            letterSpacing: '-0.01em',
            color: textColor,
            fontFamily: "'Fraunces', Georgia, serif",
          }}>
            M·InT
          </div>
          {size !== 'xs' && (
            <div style={{
              fontSize: s.subFontSize,
              color: subtextColor,
              letterSpacing: '0.01em',
              fontWeight: 400,
              fontFamily: "'Public Sans', system-ui, sans-serif",
              whiteSpace: 'nowrap',
              marginTop: 1,
            }}>
              Innovation Platform
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Badge shown for verified MInT entities */
export function VerifiedMentorBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: compact ? '2px 6px' : '3px 8px',
      background: 'rgba(26,122,74,0.10)',
      border: '1px solid rgba(26,122,74,0.25)',
      borderRadius: 99,
      fontSize: compact ? '0.65rem' : '0.75rem',
      fontWeight: 600,
      color: '#1A7A4A',
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 0.5L6.18 3.42L9.33 3.67L7 5.64L7.72 8.73L5 7.1L2.28 8.73L3 5.64L0.67 3.67L3.82 3.42L5 0.5Z" fill="#1A7A4A" />
      </svg>
      Verified MInT Mentor
    </span>
  )
}

export function VerifiedInvestorBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: compact ? '2px 6px' : '3px 8px',
      background: 'rgba(212,137,26,0.10)',
      border: '1px solid rgba(212,137,26,0.25)',
      borderRadius: 99,
      fontSize: compact ? '0.65rem' : '0.75rem',
      fontWeight: 600,
      color: '#92400E',
    }}>
      ✓ Verified Investor
    </span>
  )
}

export function AiBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px',
      background: 'rgba(109,40,217,0.08)',
      border: '1px solid rgba(109,40,217,0.20)',
      borderRadius: 99,
      fontSize: '0.7rem',
      fontWeight: 600,
      color: '#6D28D9',
    }}>
      ✦ AI Assisted
    </span>
  )
}
