import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5F5 0%, #F0FAF9 30%, #E6F4F1 60%, #EEF6FF 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', position: 'relative', overflow: 'hidden',
      fontFamily: "'Public Sans', system-ui, sans-serif",
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-8%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,130,130,0.12) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,137,26,0.10) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,107,107,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,120,120,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560 }}>
        {/* Large 404 */}
        <div style={{
          fontSize: 'clamp(80px, 18vw, 160px)',
          fontWeight: 900,
          letterSpacing: '-0.06em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #0C4D60 0%, #096976 50%, #0F8A9A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 16,
          userSelect: 'none',
        }}>
          404
        </div>

        {/* Divider line */}
        <div style={{ width: 60, height: 4, background: 'linear-gradient(135deg, #0C4D60, #096976)', borderRadius: 4, margin: '0 auto 28px' }} />

        {/* Message */}
        <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 800, color: '#0A2540', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Page not found
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.7, margin: '0 0 36px' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/dashboard"
            id="not-found-dashboard-link"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #0D4C60 0%, #096976 100%)',
              color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
              padding: '13px 28px', borderRadius: 12,
              boxShadow: '0 4px 16px rgba(15,85,103,0.35)',
              transition: 'all 200ms',
            }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            id="not-found-home-link"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
              padding: '13px 28px', borderRadius: 12,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'all 200ms',
            }}
          >
            Back to Home
          </Link>
        </div>

        {/* Subtle hint */}
        <p style={{ marginTop: 40, fontSize: '0.78rem', color: '#94A3B8' }}>
          MInT Innovation Platform &mdash; Error 404
        </p>
      </div>

      <style>{`
        @media (max-width: 480px) {
          a[id^="not-found-"] { width: 100%; justify-content: center; }
        }
        a[id="not-found-dashboard-link"]:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15,85,103,0.4) !important;
        }
        a[id="not-found-home-link"]:hover {
          border-color: #CBD5E1 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  )
}
