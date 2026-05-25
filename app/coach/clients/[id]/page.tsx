'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ClientProfile {
  id: string
  name?: string
  email: string
  gender?: string
  weight?: number
  height?: number
  age?: number
  goal?: string
  experience?: string
}

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

export default function ClientDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: clientId } = use(params)
  const router = useRouter()
  
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const fetchClientData = async () => {
    try {
      // 1. Fetch profile
      const profileResponse = await fetch(`/api/profile/${clientId}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData)
      } else {
        alert('Erreur lors du chargement du profil client')
        router.push('/coach/clients')
        return
      }

      // 2. Fetch logged sessions
      const sessionsResponse = await fetch(`/api/coach/clients/${clientId}/sessions`)
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const calculateIMC = (w?: number, h?: number) => {
    if (!w || !h) return null
    const heightInMeters = h / 100
    const imc = w / (heightInMeters * heightInMeters)
    return imc.toFixed(1)
  }

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { text: 'Insuffisance pondérale', color: 'text-blue-400' }
    if (imc < 25) return { text: 'Poids normal', color: 'text-lime-400' }
    if (imc < 30) return { text: 'Surpoids', color: 'text-amber-400' }
    return { text: 'Obésité', color: 'text-red-400' }
  }

  const formatGoal = (goal?: string) => {
    switch (goal) {
      case 'weight_loss': return 'Perte de poids 📉'
      case 'muscle_gain': return 'Prise de masse 💪'
      case 'maintenance': return 'Maintien ⚖️'
      case 'strength': return 'Force 🏋️'
      case 'endurance': return 'Endurance 🏃'
      default: return 'Non spécifié'
    }
  }

  const formatExperience = (exp?: string) => {
    switch (exp) {
      case 'beginner': return 'Débutant 🟢'
      case 'intermediate': return 'Intermédiaire 🟡'
      case 'advanced': return 'Avancé 🔴'
      default: return 'Non spécifié'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
        <p>Chargement du dossier client...</p>
      </div>
    )
  }

  if (!profile) return null

  const imcVal = calculateIMC(profile.weight, profile.height)
  const imcStatus = imcVal ? getIMCStatus(parseFloat(imcVal)) : null

  return (
    <div className="min-h-screen py-8 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header navigation bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-black text-white">Fiche Client</h1>
            <p className="text-sm text-slate-400 mt-1">Dossier physique & journal d'entraînement de {profile.name || profile.email}</p>
          </div>
          <Link
            href="/coach/clients"
            className="px-4 py-2 border border-slate-700 hover:border-slate-600 text-sm font-bold rounded-lg text-slate-300 hover:text-white bg-slate-900/60 transition"
          >
            ← Retour aux clients
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Dossier Physique */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 border border-slate-800 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500 font-black text-xl shadow-lg">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white truncate max-w-[180px]">{profile.name || 'Athlète'}</h3>
                  <p className="text-xs text-slate-400">{profile.email}</p>
                </div>
              </div>

              {/* Physical details grid */}
              <div className="border-t border-slate-850 pt-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mensurations & Dossier</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Poids</p>
                    <p className="text-lg font-black text-white mt-1">{profile.weight ? `${profile.weight} kg` : 'Non renseigné'}</p>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Taille</p>
                    <p className="text-lg font-black text-white mt-1">{profile.height ? `${profile.height} cm` : 'Non renseigné'}</p>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Âge</p>
                    <p className="text-lg font-black text-white mt-1">{profile.age ? `${profile.age} ans` : 'Non renseigné'}</p>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Sexe</p>
                    <p className="text-lg font-black text-white mt-1 uppercase">{profile.gender === 'male' ? 'Homme' : profile.gender === 'female' ? 'Femme' : profile.gender ? 'Autre' : 'Non spécifié'}</p>
                  </div>
                </div>
              </div>

              {/* BMI section */}
              {imcVal && imcStatus && (
                <div className="border-t border-slate-850 pt-5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Calcul de l'IMC</h4>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-white">{imcVal}</p>
                      <p className={`text-xs font-bold mt-1 ${imcStatus.color}`}>{imcStatus.text}</p>
                    </div>
                    <span className="text-2xl">⚖️</span>
                  </div>
                </div>
              )}

              {/* Coaching metadata badges */}
              <div className="border-t border-slate-850 pt-5 space-y-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Objectif principal</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-orange-500/10 text-orange-500 border border-orange-500/10">
                    {formatGoal(profile.goal)}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Niveau d'expérience</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-lime-500/10 text-lime-400 border border-lime-500/10">
                    {formatExperience(profile.experience)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Training Journal & Session history */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-black text-white">Journal de séances du client</h3>

            {sessions.length === 0 ? (
              <div className="glass-card text-center py-16 px-4">
                <svg className="mx-auto h-12 w-12 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-400 italic">Ce client n'a pas encore loggé de séances d'entraînement.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const isExpanded = expandedSessionId === session.id
                  const totalSets = session.loggedExercises.reduce((acc, le) => acc + le.loggedSets.length, 0)
                  
                  return (
                    <div 
                      key={session.id} 
                      className={`glass-card overflow-hidden transition-all duration-200 border ${
                        isExpanded ? 'border-orange-500/30' : 'border-slate-800 hover:border-slate-750'
                      }`}
                    >
                      {/* Interactive Header */}
                      <button
                        onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                        className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/30 outline-none hover:bg-slate-900/50"
                      >
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-base font-extrabold text-white">{session.program.name}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400">
                              ⏱️ {session.duration} min
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Séance complétée le {new Date(session.completedAt).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">
                            {session.loggedExercises.length} ex. • {totalSets} séries
                          </span>
                          <span className={`text-slate-500 transition-transform ${isExpanded ? 'transform rotate-180 text-orange-500' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </button>

                      {/* Log details */}
                      {isExpanded && (
                        <div className="px-5 py-5 border-t border-slate-800 bg-slate-950/10 space-y-5">
                          {session.notes && (
                            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
                              <p className="text-xs font-bold text-orange-500 uppercase">💬 Ressenti de l'athlète</p>
                              <p className="text-sm text-slate-300 mt-1 leading-relaxed">{session.notes}</p>
                            </div>
                          )}

                          <div className="space-y-3">
                            {session.loggedExercises.map((le, idx) => (
                              <div key={le.id} className="bg-slate-900/30 border border-slate-850 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-extrabold text-white">
                                    {idx + 1}. {le.exercise.name}
                                  </h4>
                                  <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">
                                    {le.exercise.muscleGroup}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {le.loggedSets.map((set) => (
                                    <div key={set.id} className="bg-slate-950/40 border border-slate-850 rounded-lg p-2.5 flex items-center justify-between">
                                      <div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">Série {set.setIndex}</p>
                                        <p className="text-xs font-bold text-white mt-0.5">
                                          {set.weight} kg <span className="text-[10px] text-slate-400 font-normal">x {set.reps}</span>
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

      </div>
    </div>
  )
}
