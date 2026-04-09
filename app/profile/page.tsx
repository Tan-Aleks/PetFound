import Header from '@/components/Header'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export const runtime = 'nodejs'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProfileClient />
    </div>
  )
}
