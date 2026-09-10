import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BookOpen } from 'lucide-react'

export default async function ResourcesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Knowledge Base & Resources</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Curated materials to help you build and scale your startup in Ethiopia.
        </p>
      </div>

      <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
        <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h3 style={{ marginBottom: 8 }}>Resources Coming Soon</h3>
        <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
          We are compiling a library of essential documents, templates, and guides tailored for Ethiopian innovators. Check back soon.
        </p>
      </div>
    </div>
  )
}
