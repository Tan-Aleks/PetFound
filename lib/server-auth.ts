import 'server-only'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export const getAuthorizedUser = async () => {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!session || !userId) {
    return null
  }

  return {
    session,
    userId,
  }
}
