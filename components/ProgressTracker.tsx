'use client'

import { useState, useEffect } from 'react'

interface LoggedSet {
  id: string
  setIndex: number
  weight?: number
  reps?: number
  completed: boolean
}

interface LoggedExercise {
  id: string
  exercise: {
    name: string
    muscleGroup: string
    imageUrl?: string
  }
  loggedSets: LoggedSet[]
}

interface WorkoutSession {
  id: string
  program: {
    name: string
  }
  completedAt: string
  duration: number
  notes?: string
  loggedExercises: LoggedExercise[]
}

export default function ProgressTracker({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [userId])

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/workout-sessions?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des progrès:', err)
    } finally {
      setLoading(false)
    }
  }

  // Analytical Calculations
  const totalWorkouts = sessions.length
  
  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0)
  
  const totalWeightLifted = sessions.reduce((acc, s) => {
    return acc + s.loggedExercises.reduce((exAcc, le) => {
      return exAcc + le.loggedSets.reduce((setAcc, set) => {
        if (!set.completed) return setAcc
        return setAcc + ((set.weight || 0) * (set.reps || 0))
      }, 0)
    }, 0)
  }, 0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
        <p className="text-xs">Calcul de vos statistiques de force...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-white">
      {/* Analytical KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Total Workouts */}
        <div className="glass-card p-5 border-l-4 border-orange-500 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Séances Effectuées</p>
            <p className="text-3xl font-black text-white mt-1">{totalWorkouts}</p>
            <p className="text-xs text-orange-500 font-semibold mt-2">À la salle de sport 🏋️</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Active Minutes */}
        <div className="glass-card p-5 border-l-4 border-lime-500 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Minutes Actives</p>
            <p className="text-3xl font-black text-white mt-1">{totalMinutes} <span className="text-sm font-normal text-slate-400">min</span></p>
            <p className="text-xs text-lime-500 font-semibold mt-2">Temps sous tension ⏱️</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Weight Lifted */}
        <div className="glass-card p-5 border-l-4 border-amber-500 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fonte Soulevée</p>
            <p className="text-3xl font-black text-white mt-1">{totalWeightLifted.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-400">kg</span></p>
            <p className="text-xs text-amber-500 font-semibold mt-2">Volume cumulé de fonte 💪</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* History Log Header */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-white">Journal d'Entraînement</h3>

        {sessions.length === 0 ? (
          <div className="glass-card text-center py-12 px-4">
            <p className="text-slate-400 italic">Aucune séance enregistrée pour le moment. Lancez votre premier entraînement !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id
              const totalSetsCount = session.loggedExercises.reduce((acc, le) => acc + le.loggedSets.length, 0)
              
              return (
                <div 
                  key={session.id} 
                  className={`glass-card overflow-hidden transition-all duration-200 border ${
                    isExpanded ? 'border-orange-500/30 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Collapsible Header */}
                  <button
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/30 outline-none hover:bg-slate-900/50"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-extrabold text-white">
                          {session.program.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400">
                          {session.duration} min
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Complété le {new Date(session.completedAt).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className="text-xs font-semibold text-slate-400">
                        {session.loggedExercises.length} exercices • {totalSetsCount} séries
                      </span>
                      <span className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'transform rotate-180 text-orange-500' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded Section Details */}
                  {isExpanded && (
                    <div className="px-5 py-5 border-t border-slate-800/80 space-y-5 bg-slate-950/20">
                      {/* Overall Note */}
                      {session.notes && (
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
                          <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">📝 Note de séance</p>
                          <p className="text-sm text-slate-300 mt-1 leading-relaxed">{session.notes}</p>
                        </div>
                      )}

                      {/* Exercises Details */}
                      <div className="space-y-4">
                        {session.loggedExercises.map((le, leIdx) => (
                          <div 
                            key={le.id} 
                            className="bg-slate-900/20 border border-slate-850 rounded-xl p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-bold text-white">
                                {leIdx + 1}. {le.exercise.name}
                              </h4>
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                                {le.exercise.muscleGroup}
                              </span>
                            </div>

                            {/* Sets log grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {le.loggedSets.map((set) => (
                                <div 
                                  key={set.id}
                                  className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-850 flex items-center justify-between"
                                >
                                  <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Série {set.setIndex}</p>
                                    <p className="text-sm font-bold text-white mt-0.5">
                                      {set.weight || 0} kg <span className="text-[10px] text-slate-400 font-normal">x {set.reps || 0}</span>
                                    </p>
                                  </div>
                                  <span className="text-xs text-lime-400 font-extrabold">✔</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
