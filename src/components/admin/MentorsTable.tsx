'use client'

import { useState } from 'react'
import { Shield, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface MentorsTableProps {
  initialMentors: any[]
}

export function MentorsTable({ initialMentors: initialUsers }: MentorsTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function handleVerify(mentorId: string, isVerified: boolean) {
    if (!mentorId) {
      toast.error('Mentor profile not found')
      return
    }
    setProcessingId(mentorId)
    try {
      const res = await fetch(`/api/admin/mentors/${mentorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified }),
      })
      if (!res.ok) throw new Error('Failed to update')
      
      const { mentor } = await res.json()
      toast.success(isVerified ? 'Mentor verified' : 'Mentor unverified')
      
      setUsers(prev => prev.map(u => u.mentorProfile?.id === mentorId ? { ...u, mentorProfile: mentor } : u))
    } catch (err) {
      toast.error('Failed to update mentor')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this user? This will delete their account entirely.')) return
    
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success('User deleted')
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      toast.error('Failed to delete user')
    } finally {
      setProcessingId(null)
    }
  }

  if (users.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        No mentors registered yet.
      </div>
    )
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Mentor Name</th>
            <th>Organization</th>
            <th>Status</th>
            <th>Reviews</th>
            <th>Joined Date</th>
            <th style={{ width: 140 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const mentor = user.mentorProfile;
            return (
              <tr key={user.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.firstName} {user.lastName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </td>
                <td>
                  {mentor ? (
                    <>
                      <div style={{ fontSize: '0.85rem' }}>{mentor.organization}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mentor.title}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Profile not setup</div>
                  )}
                </td>
                <td>
                  {mentor?.isVerified ? (
                    <span className="badge badge-green"><CheckCircle size={12} /> Approved</span>
                  ) : (
                    <span className="badge badge-gray"><XCircle size={12} /> Pending</span>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>
                  {mentor?._count?.reviews || 0}
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleVerify(mentor?.id, !mentor?.isVerified)}
                      disabled={!mentor || processingId === mentor?.id}
                      className="btn btn-xs"
                      style={{ 
                        background: mentor?.isVerified ? 'rgba(255,255,255,0.1)' : 'rgba(34,197,94,0.15)',
                        color: mentor?.isVerified ? 'var(--text-secondary)' : '#4ADE80',
                        flex: 1
                      }}
                    >
                      {mentor?.isVerified ? 'Revoke' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={processingId === user.id}
                      className="btn btn-xs btn-icon"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}
                      title="Delete Mentor"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
