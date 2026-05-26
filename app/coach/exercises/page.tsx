import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ExercisesManager from '../../../components/ExercisesManager'
import Link from 'next/link'

export default async function ExercisesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'coach') {
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Navigation / Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link 
            href="/coach" 
            style={{ 
              color: '#94a3b8', 
              textDecoration: 'none', 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              transition: 'color 0.2s'
            }}
          >
            ← Espace Coach
          </Link>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Gestion des Exercices</span>
        </div>

        {/* Exercises Manager */}
        <ExercisesManager />
      </div>
    </div>
  )
}