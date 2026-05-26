import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const isCoach = session.user.role?.toLowerCase() === 'coach'

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Navigation / Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link 
            href={isCoach ? "/coach" : "/dashboard"} 
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
            ← {isCoach ? "Espace Coach" : "Tableau de Bord"}
          </Link>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Mon Profil</span>
        </div>

        {/* Profile Form */}
        <ProfileForm userId={session.user.id} />
      </div>
    </div>
  )
}