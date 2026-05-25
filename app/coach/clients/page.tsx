import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientsList from '../../../components/ClientsList'
import Link from 'next/link'

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'coach') redirect('/login')

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/coach" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ← Espace coach
          </Link>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Clients</span>
        </div>
        <ClientsList coachId={session.user.id} />
      </div>
    </div>
  )
}