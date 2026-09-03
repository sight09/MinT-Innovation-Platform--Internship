import { prisma } from '@/lib/prisma'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage all users registered on the platform.
          </p>
        </div>
      </div>

      <UsersTable initialUsers={JSON.parse(JSON.stringify(users))} />
    </div>
  )
}
