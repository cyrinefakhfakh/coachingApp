import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import MyPrograms from '../../components/MyPrograms'

export default async function MyProgramsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role === 'coach') {
    redirect('/coach')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Mes Programmes</h1>
            <a
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Retour au dashboard
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <MyPrograms userId={session.user.id} />
        </div>
      </main>
    </div>
  )
}