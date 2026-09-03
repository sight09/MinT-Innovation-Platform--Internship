// MInT Platform — Auth Configuration (NextAuth v5 Beta)

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!user) return null
        if (user.status === 'SUSPENDED') return null

        // Users who signed up with OAuth might not have a password
        if (!user.passwordHash) return null

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatch) return null

        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'USER_LOGIN',
            entityType: 'user',
            entityId: user.id,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          avatarUrl: user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    /**
     * signIn callback — fired for OAuth logins.
     * For Google sign-ins we need to ensure our custom User row exists and has
     * all the fields the platform expects (role, status, firstName, etc.).
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = user.email?.toLowerCase()
        if (!email) return false

        try {
          let dbUser = await prisma.user.findUnique({ where: { email } })

          if (!dbUser) {
            // Brand-new Google user — create the User row with PENDING_VERIFICATION
            const nameParts = (user.name || email.split('@')[0]).split(' ')
            const firstName = nameParts[0] || 'User'
            const lastName = nameParts.slice(1).join(' ') || ''

            dbUser = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                role: 'STARTUP', // default role; user can be changed by admin
                status: 'PENDING_VERIFICATION',
                emailVerified: true,
                avatarUrl: (profile as any)?.picture || null,
              },
            })

            // Notify admins of the new registration
            const admins = await prisma.user.findMany({ where: { role: 'MINT_ADMIN' } })
            if (admins.length > 0) {
              await prisma.notification.createMany({
                data: admins.map(admin => ({
                  userId: admin.id,
                  title: 'New Google Sign-Up',
                  message: `${dbUser!.firstName} ${dbUser!.lastName} (${email}) just joined via Google as a Startup and requires review.`,
                  type: 'NEW_REGISTRATION',
                  entityType: 'STARTUP',
                  entityId: dbUser!.id,
                  link: '/admin/startups',
                })),
              })
            }
          } else {
            // Existing user — update avatar if changed
            if ((profile as any)?.picture && !dbUser.avatarUrl) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { avatarUrl: (profile as any).picture },
              })
            }
          }

          // Stamp the NextAuth user object with our custom fields so the JWT
          // callback can pick them up
          ;(user as any).id = dbUser.id
          ;(user as any).role = dbUser.role
          ;(user as any).status = dbUser.status
          ;(user as any).emailVerified = dbUser.emailVerified
          ;(user as any).avatarUrl = dbUser.avatarUrl

          return true
        } catch (err) {
          console.error('[auth] Google signIn error:', err)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        // Freshly signed in — copy all fields from the user object
        token.id = user.id
        token.role = (user as any).role
        token.status = (user as any).status
        token.emailVerified = (user as any).emailVerified
        token.avatarUrl = (user as any).avatarUrl
      }

      // On every request re-fetch the latest status from DB so approvals are
      // reflected without requiring a new login
      if (token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true, emailVerified: true, avatarUrl: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.status = dbUser.status
          token.emailVerified = dbUser.emailVerified
          token.avatarUrl = dbUser.avatarUrl
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.status = token.status as any
        session.user.emailVerified = Boolean(token.emailVerified) as any
        session.user.avatarUrl = token.avatarUrl as string | null
      }
      return session
    },
  },
})
