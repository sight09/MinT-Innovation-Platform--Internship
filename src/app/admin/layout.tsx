import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { prisma } from '@/lib/prisma'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = session?.user as any

  if (!user || user.role !== 'MINT_ADMIN') {
    redirect('/login')
  }

  // Get unread notification count
  const notificationCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-base)' }}>
      <Sidebar
        user={{
          id: user.id || '',
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }}
        notificationCount={notificationCount}
      />
      <main
        className="main-content"
        style={{
          flex: 1,
          minWidth: 0,
          padding: 'clamp(20px, 3vw, 36px)',
          minHeight: '100vh',
          background: 'var(--surface-base)',
          marginLeft: 260,
          transition: 'margin-left 300ms ease',
        }}
      >
        {children}
      </main>
    </div>
  )
}
