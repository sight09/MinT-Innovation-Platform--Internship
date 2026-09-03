'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Power, PowerOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface UsersTableProps {
  initialUsers: any[]
}

const roleColors: Record<string, string> = {
  STARTUP: 'badge-blue',
  MINT_MENTOR: 'badge-green',
  INVESTOR: 'badge-gold',
  MINT_ADMIN: 'badge-red',
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update user status')

      const { user } = await res.json()
      toast.success(`User is now ${user.status}`)
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: user.status } : u)))
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined Date</th>
            <th style={{ width: 140 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ fontWeight: 600 }}>
                {user.firstName} {user.lastName}
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </td>
              <td>
                <span className={`badge ${roleColors[user.role] || 'badge-gray'}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span className={`badge ${user.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                  {user.status}
                </span>
              </td>
              <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td>
                {user.role !== 'MINT_ADMIN' && (
                  <button
                    onClick={() => handleToggleStatus(user.id, user.status)}
                    disabled={processingId === user.id}
                    className="btn btn-xs"
                    style={{
                      background: user.status === 'ACTIVE'
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(34,197,94,0.12)',
                      color: user.status === 'ACTIVE' ? '#F87171' : '#4ADE80',
                      border: `1px solid ${user.status === 'ACTIVE' ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                    }}
                  >
                    {processingId === user.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : user.status === 'ACTIVE' ? (
                      <><PowerOff size={12} /> Suspend</>
                    ) : (
                      <><Power size={12} /> Activate</>
                    )}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
