import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Messages</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Direct communication with other platform members.
        </p>
      </div>

      <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
        <MessageSquare size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h3 style={{ marginBottom: 8 }}>Coming Soon</h3>
        <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
          The real-time messaging feature is currently under development. You will soon be able to communicate securely with mentors and investors directly on the platform.
        </p>
      </div>
    </div>
  )
}
