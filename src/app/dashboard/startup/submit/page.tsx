import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StartupSubmitForm } from '@/components/startup/StartupSubmitForm'

export default async function SubmitStartupPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'STARTUP') {
    redirect('/dashboard')
  }

  const existingProfile = await prisma.startupProfile.findUnique({
    where: { userId: session.user.id },
  })

  return <StartupSubmitForm initialData={existingProfile} />
}
