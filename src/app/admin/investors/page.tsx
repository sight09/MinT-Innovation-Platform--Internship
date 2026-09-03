import { prisma } from '@/lib/prisma'
import { Briefcase, CheckCircle, XCircle } from 'lucide-react'
import { InvestorsTable } from '@/components/admin/InvestorsTable'

export default async function AdminInvestorsPage() {
  const investors = await prisma.user.findMany({
    where: { role: 'INVESTOR' },
    include: {
      investorProfile: {
        include: {
          _count: {
            select: { investmentInterests: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Investor Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Verify investors and monitor their activity.
          </p>
        </div>
      </div>

      <InvestorsTable initialInvestors={JSON.parse(JSON.stringify(investors))} />
    </div>
  )
}
