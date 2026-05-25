import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import WorkoutLogger from '@/components/WorkoutLogger'

export default async function WorkoutPage({
  params
}: {
  params: Promise<{ programId: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Rediriger les coachs
  if (session.user.role?.toLowerCase() === 'coach') {
    redirect('/coach')
  }

  const { programId } = await params

  return (
    <div className="min-h-screen py-6">
      <WorkoutLogger programId={programId} />
    </div>
  )
}
