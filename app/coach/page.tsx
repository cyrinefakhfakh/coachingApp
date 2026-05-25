import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import CoachDashboard from '../../components/CoachDashboard'

export default async function CoachPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'coach') {
    redirect('/login')
  }

  return <CoachDashboard />
}