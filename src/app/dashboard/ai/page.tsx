import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default async function AIPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>MInT AI Assistant</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Your intelligent partner for building Ethiopian startups.
        </p>
      </div>

      <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
        <Sparkles size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h3 style={{ marginBottom: 8 }}>Dedicated Workspace Coming Soon</h3>
        <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
          The standalone AI workspace is being prepared. For now, you can access the AI assistant using the floating button in the bottom right corner of any page.
        </p>
      </div>
    </div>
  )
}
