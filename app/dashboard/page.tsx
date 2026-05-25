import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProgressTracker from '@/components/ProgressTracker'

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Rediriger les coachs vers leur espace dédié
  if (session.user.role?.toLowerCase() === 'coach') {
    redirect('/coach')
  }

  const resolvedParams = await searchParams
  const isSuccess = resolvedParams.success === 'workout_saved'

  return (
    <div className="min-h-screen py-8 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Success Alert Toast */}
        {isSuccess && (
          <div className="glass-card neon-border-neon p-4 bg-emerald-500/10 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <div>
                <p className="text-sm font-bold text-white">Félicitations, entraînement validé !</p>
                <p className="text-xs text-slate-400">Votre séance a été enregistrée avec succès dans votre journal de bord.</p>
              </div>
            </div>
            <Link 
              href="/dashboard"
              className="text-xs font-bold text-slate-500 hover:text-white shrink-0"
            >
              Fermer
            </Link>
          </div>
        )}

        {/* Dynamic Welcoming Card Banner */}
        <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-orange-600/20 to-amber-500/5 border-l-4 border-orange-500 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Salut, <span className="text-orange-500">{session.user.name || 'Athlète'}</span> !
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Prêt à repousser vos limites aujourd'hui ? Suivez votre programme d'entraînement personnalisé et enregistrez chaque répétition.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-lg shadow-orange-950/20 transition-all duration-300 uppercase tracking-wider text-center"
            >
              Commencer un entraînement ⚡
            </Link>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center px-5 py-3 border border-slate-700 hover:border-slate-600 text-sm font-bold rounded-xl text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 transition-all text-center"
            >
              Mon Profil
            </Link>
          </div>
        </div>

        {/* Embedded Analytical Tracker (Real Life feature) */}
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Mes Statistiques & Progrès</h2>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
              Live Tracker 📡
            </span>
          </div>

          <ProgressTracker userId={session.user.id} />
        </div>

      </div>
    </div>
  )
}