'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface InvestorsTableProps {
  initialInvestors: any[]
}

export function InvestorsTable({ initialInvestors: initialUsers }: InvestorsTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function handleVerify(investorId: string, isVerified: boolean) {
    if (!investorId) {
      toast.error('Investor profile not found')
      return
    }
    setProcessingId(investorId)
    try {
      const res = await fetch(`/api/admin/investors/${investorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified }),
      })
      if (!res.ok) throw new Error('Failed to update')

      const { investor } = await res.json()
      toast.success(isVerified ? '✓ Investor approved' : 'Investor suspended')
      setUsers(prev =>
        prev.map(u => u.investorProfile?.id === investorId ? { ...u, investorProfile: investor } : u)
      )
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setProcessingId(null)
    }
  }

  if (users.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        No investors registered yet.
      </div>
    )
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Investor Name</th>
            <th>Organization</th>
            <th>Type</th>
            <th>Status</th>
            <th>Interests</th>
            <th>Joined</th>
            <th style={{ width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const investor = user.investorProfile;
            return (
            <tr key={user.id}>
              <td>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.firstName} {user.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </td>
              <td style={{ fontSize: '0.85rem' }}>
                {investor ? (investor.organizationName || <span style={{ color: 'var(--text-muted)' }}>Independent</span>) : <span style={{ color: 'var(--text-muted)' }}>Profile not setup</span>}
              </td>
              <td>
                {investor ? (
                  <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                    {investor.investorType.replace(/_/g, ' ')}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>-</span>
                )}
              </td>
              <td>
                {investor?.isVerified ? (
                  <span className="badge badge-green">
                    <CheckCircle size={11} /> Approved
                  </span>
                ) : (
                  <span className="badge badge-gray">
                    <XCircle size={11} /> Pending
                  </span>
                )}
              </td>
              <td style={{ fontWeight: 600 }}>
                {investor?._count?.investmentInterests ?? 0}
              </td>
              <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleVerify(investor?.id, !investor?.isVerified)}
                    disabled={!investor || processingId === investor?.id}
                    className="btn btn-xs"
                    style={{
                      background: investor?.isVerified
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(34,197,94,0.12)',
                      color: investor?.isVerified ? '#F87171' : '#4ADE80',
                      border: `1px solid ${investor?.isVerified ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
                      flex: 1,
                      display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center',
                    }}
                  >
                    {processingId === investor?.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : investor?.isVerified ? (
                      <><XCircle size={12} /> Revoke</>
                    ) : (
                      <><Shield size={12} /> Approve</>
                    )}
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
