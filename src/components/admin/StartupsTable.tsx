'use client'

import { useState } from 'react'
import { Rocket, CheckCircle, XCircle, Star, MoreVertical, Trash2, UserPlus, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface StartupsTableProps {
  initialStartups: any[]
  mentors: any[]
}

export function StartupsTable({ initialStartups: initialUsers, mentors }: StartupsTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  // Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null)
  const [selectedMentorId, setSelectedMentorId] = useState<string>('')

  async function handleVerify(startupId: string, status: 'APPROVED' | 'PENDING_REVIEW') {
    if (!startupId) {
      toast.error('Startup profile not found')
      return
    }
    setProcessingId(startupId)
    try {
      const res = await fetch(`/api/admin/startups/${startupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      
      const { startup } = await res.json()
      toast.success(status === 'APPROVED' ? 'Startup approved' : 'Startup pending')
      
      setUsers(prev => prev.map(u => u.startupProfile?.id === startupId ? { ...u, startupProfile: startup } : u))
    } catch (err) {
      toast.error('Failed to update startup')
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

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStartupId || !selectedMentorId) return
    
    setProcessingId(selectedStartupId)
    try {
      const res = await fetch('/api/reviews/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId: selectedStartupId, mentorId: selectedMentorId })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to assign')
      
      toast.success('Mentor assigned successfully')
      
      // Update local state to increment mentor reviews count
      setUsers(prev => prev.map(u => {
        if (u.startupProfile?.id === selectedStartupId) {
          return {
            ...u,
            startupProfile: {
              ...u.startupProfile,
              _count: { ...u.startupProfile._count, mentorReviews: (u.startupProfile._count?.mentorReviews || 0) + 1 }
            }
          }
        }
        return u
      }))
      
      setAssignModalOpen(false)
      setSelectedStartupId(null)
      setSelectedMentorId('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign mentor')
    } finally {
      setProcessingId(null)
    }
  }

  if (users.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        No startups registered yet.
      </div>
    )
  }

  return (
    <>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Startup</th>
              <th>Sector / Stage</th>
              <th>Status</th>
              <th>Metrics</th>
              <th>Joined Date</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const startup = user.startupProfile;
              return (
              <tr key={user.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{startup ? startup.name : `${user.firstName} ${user.lastName}`}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </td>
                <td>
                  {startup ? (
                    <>
                      <div style={{ fontSize: '0.85rem' }}>{startup.sector}</div>
                      <span className={`stage-badge stage-${startup.stage}`} style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                        {startup.stage.replace('_', ' ')}
                      </span>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Profile not setup</div>
                  )}
                </td>
                <td>
                  {startup?.status === 'APPROVED' ? (
                    <span className="badge badge-green"><CheckCircle size={12} /> Approved</span>
                  ) : (
                    <span className="badge badge-gray"><XCircle size={12} /> Pending</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="Mentor Reviews">
                      <Star size={14} /> {startup?._count?.mentorReviews || 0}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="Investor Interests">
                      <Rocket size={14} /> {startup?._count?.investmentInterests || 0}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleVerify(startup?.id, startup?.status === 'APPROVED' ? 'PENDING_REVIEW' : 'APPROVED')}
                      disabled={!startup || processingId === startup?.id}
                      className="btn btn-xs"
                      style={{ 
                        background: startup?.status === 'APPROVED' ? 'rgba(255,255,255,0.1)' : 'rgba(34,197,94,0.15)',
                        color: startup?.status === 'APPROVED' ? 'var(--text-secondary)' : '#4ADE80',
                        flex: 1
                      }}
                    >
                      {startup?.status === 'APPROVED' ? 'Revoke' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStartupId(startup?.id || null)
                        setAssignModalOpen(true)
                      }}
                      className="btn btn-xs btn-icon"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#4ADE80' }}
                      title="Assign Mentor"
                      disabled={!startup || user.status !== 'ACTIVE'}
                    >
                      <UserPlus size={14} />
                    </button>
                    {startup && (
                      <Link href={`/startups/${startup.id}`} className="btn btn-ghost btn-icon btn-xs" title="View Profile">
                        <MoreVertical size={14} />
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={processingId === user.id}
                      className="btn btn-ghost btn-icon btn-xs"
                      style={{ color: '#F87171' }}
                      title="Delete Startup"
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

      {/* Assignment Modal */}
      {assignModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(13,43,78,0.8)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface-card, #1a2332)',
            border: '1px solid var(--surface-border)',
            borderRadius: 16,
            width: '100%', maxWidth: 400,
            padding: 24, position: 'relative',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}>
            <button
              onClick={() => {
                setAssignModalOpen(false)
                setSelectedStartupId(null)
                setSelectedMentorId('')
              }}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Assign Mentor</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Select a verified mentor to review this startup.
            </p>

            <form onSubmit={handleAssign}>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Mentor</label>
                <select
                  className="form-input"
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a mentor...</option>
                  {mentors.filter(m => m.isVerified).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.user.firstName} {m.user.lastName} ({m.organization})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processingId === selectedStartupId}
                >
                  Assign Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
