import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AssignProgram from '@/components/AssignProgram'

export default async function AssignProgramPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'coach') {
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <AssignProgram programId={id} coachId={session.user.id} />
    </div>
  )
}