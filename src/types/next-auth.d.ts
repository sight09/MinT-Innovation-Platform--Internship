import { DefaultSession } from 'next-auth'
import { Role, AccountStatus } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    role: Role
    status?: AccountStatus
    emailVerified?: boolean
    avatarUrl?: string | null
    firstName?: string
    lastName?: string
  }

  interface Session {
    user: {
      id: string
      role: Role
      status?: AccountStatus
      emailVerified?: boolean
      avatarUrl?: string | null
      firstName?: string
      lastName?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    status?: AccountStatus
    emailVerified?: boolean
    avatarUrl?: string | null
  }
}
