'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Program {
  id: string
  name: string
  description?: string
  assignedAt: string
  coach: {
    name?: string
    email: string
  }
  exercises: Array<{
    id: string
    sets: number
    reps: number
    restTime?: number
    notes?: string
    exercise: {
      id: string
      name: string
      description?: string
      muscleGroup: string
      equipment?: string
      instructions?: string
      imageUrl?: string
    }
  }>
}

export default function MyPrograms({ userId }: { userId: string }) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  useEffect(() => {
    fetchPrograms()
  }, [userId])

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`/api/user/programs/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPrograms(data)
        if (data.length > 0) {
          setSelectedProgram(data[0])
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
        <p>Chargement de vos programmes...</p>
      </div>
    )
  }

  return (
    <div className="text-white">
      {programs.length === 0 ? (
        <div className="glass-card text-center py-16 px-4">
          <svg className="mx-auto h-16 w-16 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Aucun programme d'entraînement</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Votre coach n'a pas encore assigné de programme d'entraînement à votre profil. Contactez-le pour démarrer !
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Liste des programmes */}
            <div className="glass-card overflow-hidden lg:col-span-1 border border-slate-800">
              <div className="px-5 py-5 border-b border-slate-800/80 bg-slate-900/30">
                <h3 className="text-lg font-bold text-white">
                  Mes Programmes
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sélectionnez un entraînement à effectuer
                </p>
              </div>
              <ul className="divide-y divide-slate-850">
                {programs.map((program) => {
                  const isSelected = selectedProgram?.id === program.id
                  return (
                    <li key={program.id}>
                      <button
                        onClick={() => setSelectedProgram(program)}
                        className={`w-full px-5 py-4 text-left transition-all duration-150 flex flex-col gap-1 outline-none ${
                          isSelected 
                            ? 'bg-orange-500/10 border-l-4 border-orange-500' 
                            : 'hover:bg-slate-850/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-bold truncate ${isSelected ? 'text-orange-500' : 'text-slate-200'}`}>
                            {program.name}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                            {program.exercises.length} ex.
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Par: {program.coach.name || program.coach.email}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Assigné le {new Date(program.assignedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Détails du programme sélectionné */}
            <div className="lg:col-span-2 space-y-6">
              {selectedProgram ? (
                <div className="glass-card p-6 border border-slate-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <h3 className="text-2xl font-black text-white">
                        {selectedProgram.name}
                      </h3>
                      {selectedProgram.description && (
                        <p className="text-sm text-slate-400 mt-1">{selectedProgram.description}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-2">
                        Créé par Coach {selectedProgram.coach.name || selectedProgram.coach.email}
                      </p>
                    </div>
                    
                    {/* Glowing Start Button */}
                    <Link
                      href={`/programs/${selectedProgram.id}/workout`}
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-lg shadow-orange-950/20 transition-all duration-300 transform active:scale-95 uppercase tracking-wider text-center shrink-0"
                    >
                      Démarrer la séance ⚡
                    </Link>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-bold text-slate-300">Composition de l'entraînement</h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {selectedProgram.exercises.map((programExercise, index) => (
                        <div 
                          key={programExercise.id} 
                          className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-850 hover:border-slate-800 transition"
                        >
                          {programExercise.exercise.imageUrl && (
                            <img
                              src={programExercise.exercise.imageUrl}
                              alt={programExercise.exercise.name}
                              className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl border border-slate-800 shrink-0 self-start sm:self-center"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <h5 className="text-base font-bold text-white">
                                {index + 1}. {programExercise.exercise.name}
                              </h5>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                                {programExercise.exercise.muscleGroup}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {programExercise.exercise.equipment && `Matériel: ${programExercise.exercise.equipment}`}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/10">
                                {programExercise.sets} séries
                              </span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/10">
                                {programExercise.reps} reps
                              </span>
                              {programExercise.restTime && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-lime-500/10 text-lime-400 border border-lime-500/10">
                                  ⏱️ {programExercise.restTime}s repos
                                </span>
                              )}
                            </div>

                            {programExercise.notes && (
                              <p className="text-xs text-orange-400/90 italic mt-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                                Note : {programExercise.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center border border-slate-800">
                  <svg className="mx-auto h-12 w-12 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-base font-bold text-slate-400">Sélectionnez un programme</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cliquez sur un programme dans la liste latérale pour consulter ses exercices
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}