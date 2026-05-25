import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import ExercisesManager from '../../../components/ExercisesManager'

export default async function ExercisesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'coach') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Exercices</h1>
            <a
              href="/coach"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Retour à l'espace coach
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ExercisesManager />
        </div>
      </main>
    </div>
  )
}