import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import MyPrograms from '@/components/MyPrograms'

export default async function ProgramsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role?.toLowerCase() === 'coach') {
    redirect('/coach')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mes programmes d'entraînement</h1>
            <p className="mt-2 text-sm text-gray-600">
              Consultez les programmes assignés par votre coach
            </p>
          </div>

          <MyPrograms userId={session.user.id} />
        </div>
      </div>
    </div>
  )
}