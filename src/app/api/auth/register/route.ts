import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  role: z.enum(['STARTUP', 'MINT_MENTOR', 'INVESTOR']),
})

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(data.password, 12)
    const otpCode = generateOTP()
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: 'PENDING_VERIFICATION',
        otpCode,
        otpExpiry,
        ...(data.role === 'MINT_MENTOR' && {
          mentorProfile: {
            create: {
              title: 'Mentor',
              organization: 'Independent',
              expertiseAreas: '[]',
              sectorsOfInterest: '[]',
              yearsExperience: 0,
            }
          }
        }),
        ...(data.role === 'INVESTOR' && {
          investorProfile: {
            create: {
              investorType: 'Individual',
              preferredSectors: '[]',
              preferredStages: '[]',
            }
          }
        }),
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'user',
        entityId: user.id,
      },
    })

    // Notify admins of every new registration requiring review
    const adminLink =
      data.role === 'MINT_MENTOR'
        ? '/admin/mentors'
        : data.role === 'INVESTOR'
        ? '/admin/investors'
        : '/admin/startups'

    const roleLabel =
      data.role === 'MINT_MENTOR' ? 'Mentor' : data.role === 'INVESTOR' ? 'Investor' : 'Startup'

    const admins = await prisma.user.findMany({ where: { role: 'MINT_ADMIN' } })
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: `New ${roleLabel} Registration`,
          message: `${data.firstName} ${data.lastName} (${data.email}) has registered as a ${roleLabel} and requires review.`,
          type: 'NEW_REGISTRATION',
          entityType: data.role,
          entityId: user.id,
          link: adminLink,
        })),
      })
    }

    // In production, send email with OTP
    // For demo: return OTP in response (never do this in production!)
    const isDev = process.env.NODE_ENV === 'development'

    return NextResponse.json({
      message: 'Account created. Please verify your email.',
      userId: user.id,
      ...(isDev && { devOtp: otpCode }), // Only in dev mode
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).issues || (error as any).errors },
        { status: 400 }
      )
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
