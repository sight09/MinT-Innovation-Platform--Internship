import { prisma } from '@/lib/prisma'
import { FileText, Clock } from 'lucide-react'

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Audit Logs</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Recent platform activity and security events (last 100).
        </p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Entity</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ fontWeight: 600 }}>
                  {log.action}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {log.user?.email || 'System'}
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>{log.entityType}</div>
                  <div style={{ fontFamily: 'monospace' }}>{log.entityId}</div>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {log.ipAddress || 'Unknown'}
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} />
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit logs recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
