import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const savedStartupSchema = z.object({
  startupId: z.string().min(1),
})

async function getInvestorProfile() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (session.user.role !== 'INVESTOR') {
    return { error: NextResponse.json({ error: 'Only investors can save startups' }, { status: 403 }) }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { investorProfile: true },
  })

  if (!user?.investorProfile) {
    return { error: NextResponse.json({ error: 'Investor profile not found' }, { status: 404 }) }
  }

  if (user.status !== 'ACTIVE') {
    return { error: NextResponse.json({ error: 'Investor account is pending approval' }, { status: 403 }) }
  }

  return { investor: user.investorProfile }
}

export async function GET() {
  try {
    const result = await getInvestorProfile()
    if ('error' in result) return result.error

    const savedStartups = await prisma.savedStartup.findMany({
      where: { investorId: result.investor.id },
      include: { startup: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ savedStartups })
  } catch (error) {
    console.error('Saved startups GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await getInvestorProfile()
    if ('error' in result) return result.error

    const { startupId } = savedStartupSchema.parse(await req.json())
    const startup = await prisma.startupProfile.findFirst({
      where: { id: startupId, status: { in: ['APPROVED', 'FEATURED'] } },
      select: { id: true },
    })

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 })
    }

    const savedStartup = await prisma.savedStartup.upsert({
      where: {
        investorId_startupId: {
          investorId: result.investor.id,
          startupId,
        },
      },
      update: {},
      create: {
        investorId: result.investor.id,
        startupId,
      },
    })

    return NextResponse.json({ savedStartup }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    console.error('Saved startup POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const result = await getInvestorProfile()
    if ('error' in result) return result.error

    const { startupId } = savedStartupSchema.parse(await req.json())
    await prisma.savedStartup.deleteMany({
      where: {
        investorId: result.investor.id,
        startupId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    console.error('Saved startup DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
