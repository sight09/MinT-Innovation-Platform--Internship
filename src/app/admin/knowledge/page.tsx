import type { Metadata } from 'next'
import { BookOpen, Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Knowledge Base — MInT Platform Admin',
  description: 'Admin knowledge base section.',
}

export default function AdminKnowledgePage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 64 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(96,165,250,0.15)',
            border: '1px solid rgba(96,165,250,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={20} color="#60A5FA" />
          </div>
          <h1 style={{ margin: 0 }}>Knowledge Base</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Admin-managed resources, guides, and documentation for platform users.
        </p>
      </div>

      {/* Under Construction Card */}
      <div style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--surface-border)',
        borderRadius: 20,
        padding: '56px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative top gradient bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #60A5FA, #A78BFA, #34D399)',
        }} />

        {/* Icon cluster */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(96,165,250,0.1)',
            border: '1px solid rgba(96,165,250,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
          }}>
            <BookOpen size={36} color="#60A5FA" />
          </div>
          {/* Wrench badge */}
          <div style={{
            position: 'absolute', bottom: 0, right: -4,
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--surface-elevated)',
            border: '2px solid var(--surface-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wrench size={13} color="#FBBF24" />
          </div>
        </div>

        <h2 style={{ marginBottom: 12, fontSize: '1.5rem' }}>
          Under Construction
        </h2>

        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.95rem',
          lineHeight: 1.7, maxWidth: 480, margin: '0 auto 28px',
        }}>
          The Knowledge Base is currently being built. Soon, admins will be able to publish
          curated documents, startup guides, templates, and resources for all platform users.
        </p>

        {/* Features coming soon list */}
        <div style={{
          display: 'inline-flex', flexDirection: 'column', gap: 10,
          background: 'var(--surface-elevated)',
          border: '1px solid var(--surface-border)',
          borderRadius: 12, padding: '16px 24px',
          textAlign: 'left', marginBottom: 28,
        }}>
          {[
            'Upload and categorize documents',
            'Tag resources by role (Startup, Investor, Mentor)',
            'Publish startup guides and templates',
            'Track resource views and downloads',
          ].map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#60A5FA', flexShrink: 0,
              }} />
              {feature}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
