import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bodySchema = z.object({
  ids: z.array(z.string()).optional(),
  // If true, physically delete the notifications instead of just marking them read
  deleteAll: z.boolean().optional(),
})

// POST /api/notifications/mark-read
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { ids, deleteAll } = bodySchema.parse(body)

    const userId = session.user.id as string

    if (deleteAll) {
      // Physically delete the notifications (clear action)
      const where = ids?.length
        ? { userId, id: { in: ids } }
        : { userId }

      const result = await prisma.notification.deleteMany({ where })
      return NextResponse.json({ deleted: result.count })
    }

    // Otherwise just mark as read
    const where = ids?.length
      ? { userId, id: { in: ids }, isRead: false }
      : { userId, isRead: false }

    const result = await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    })

    return NextResponse.json({ marked: result.count })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
