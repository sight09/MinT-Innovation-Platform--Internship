import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

const schema = z.object({ userId: z.string() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' })
    }

    // Rate-limit: only allow resend once per 60 seconds
    if (user.otpExpiry) {
      const remainingMs = user.otpExpiry.getTime() - Date.now()
      // otpExpiry is set for 15 min; we added the otp at most 60s ago if
      // (15*60*1000 - remainingMs) < 60000
      const secondsSinceCreated = Math.floor((15 * 60 * 1000 - remainingMs) / 1000)
      if (secondsSinceCreated < 60 && remainingMs > 0) {
        const waitSeconds = 60 - secondsSinceCreated
        return NextResponse.json(
          { error: `Please wait ${waitSeconds} seconds before requesting another code.`, waitSeconds },
          { status: 429 }
        )
      }
    }

    // Generate a new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    const newExpiry = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: { otpCode: newOtp, otpExpiry: newExpiry },
    })

    try {
      await sendVerificationEmail(user.email, user.firstName, newOtp)
    } catch (emailErr) {
      console.error('[resend-otp] Failed to send email:', emailErr)
    }

    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json({
      message: 'Verification code resent. Check your email.',
      ...(isDev && { devOtp: newOtp }),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('[resend-otp] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
