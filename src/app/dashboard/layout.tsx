import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { prisma } from '@/lib/prisma'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = session?.user as any

  if (!user) {
    redirect('/login')
  }

  if (user.emailVerified === false) {
    redirect('/verify-email')
  }

  // Fetch the full user from database to check verification status
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      startupProfile: true,
      mentorProfile: true,
      investorProfile: true,
    }
  })

  let isVerified = false
  if (dbUser) {
    if (dbUser.role === 'MINT_ADMIN') {
      isVerified = true
    } else if (dbUser.role === 'STARTUP') {
      isVerified = dbUser.startupProfile?.status === 'APPROVED'
    } else if (dbUser.role === 'MINT_MENTOR') {
      isVerified = dbUser.mentorProfile?.isVerified || false
    } else if (dbUser.role === 'INVESTOR') {
      isVerified = dbUser.investorProfile?.isVerified || false
    }
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
          role: user.role || 'STARTUP',
          avatarUrl: user.avatarUrl,
          isVerified,
        }}
        notificationCount={notificationCount}
      />
      {/* Main content — offset by sidebar width */}
      <main
        className="main-content"
        style={{
          flex: 1,
          minWidth: 0,
          padding: 'clamp(16px, 3vw, 36px)',
          minHeight: '100vh',
          background: 'var(--surface-base)',
          /* marginLeft is managed by .main-content CSS class + Sidebar useEffect */
        }}
      >
        {children}
      </main>
    </div>
  )
}
