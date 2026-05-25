'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Exercise {
  id: string
  name: string
  description?: string
  muscleGroup: string
  equipment?: string
  instructions?: string
  imageUrl?: string
}

interface ProgramExercise {
  id: string
  sets: number
  reps: number
  restTime?: number
  notes?: string
  exercise: Exercise
}

interface Program {
  id: string
  name: string
  description?: string
  exercises: ProgramExercise[]
}

interface LoggedSetState {
  setIndex: number
  weight: string
  reps: string
  completed: boolean
}

interface LoggedExerciseState {
  exerciseId: string
  exerciseName: string
  sets: LoggedSetState[]
}

export default function WorkoutLogger({ programId }: { programId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Stopwatch States
  const [timeElapsed, setTimeElapsed] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Rest Timer States
  const [restCountdown, setRestCountdown] = useState<number | null>(null)
  const [activeRestLimit, setActiveRestLimit] = useState<number>(60)
  const restTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Logged Exercises States
  const [exerciseLogs, setExerciseLogs] = useState<LoggedExerciseState[]>([])

  // Load Program
  useEffect(() => {
    fetchProgram()

    // Start Stopwatch
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (restTimerRef.current) clearInterval(restTimerRef.current)
    }
  }, [programId])

  const fetchProgram = async () => {
    try {
      const response = await fetch(`/api/programs/${programId}`)
      if (response.ok) {
        const data = await response.json()
        setProgram(data)

        // Initialize logging state
        const initialLogs = data.exercises.map((pe: ProgramExercise) => {
          const sets: LoggedSetState[] = Array.from({ length: pe.sets }, (_, i) => ({
            setIndex: i + 1,
            weight: '',
            reps: pe.reps.toString(),
            completed: false
          }))
          return {
            exerciseId: pe.exercise.id,
            exerciseName: pe.exercise.name,
            sets
          }
        })
        setExerciseLogs(initialLogs)
      } else {
        setError('Impossible de charger le programme d\'entraînement.')
      }
    } catch (err) {
      console.error(err)
      setError('Erreur réseau lors du chargement du programme.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Input Changes
  const handleSetChange = (exerciseId: string, setIndex: number, field: keyof LoggedSetState, value: any) => {
    setExerciseLogs(prevLogs =>
      prevLogs.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.setIndex !== setIndex) return s
            return { ...s, [field]: value }
          })
        }
      })
    )
  }

  // Handle Set Validation & Trigger Rest Timer
  const handleToggleSetComplete = (exerciseId: string, setIndex: number, isCompleted: boolean, defaultRest: number = 60) => {
    handleSetChange(exerciseId, setIndex, 'completed', isCompleted)

    // Trigger Rest countdown if checked
    if (isCompleted) {
      startRestTimer(defaultRest)
    }
  }

  // Rest Timer Controller
  const startRestTimer = (seconds: number) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current)
    
    setActiveRestLimit(seconds)
    setRestCountdown(seconds)

    restTimerRef.current = setInterval(() => {
      setRestCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current)
          // Web Audio Beep when countdown finishes (optional gym feel)
          try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)()
            const osc = context.createOscillator()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(880, context.currentTime) // High pitch A note
            osc.connect(context.destination)
            osc.start()
            osc.stop(context.currentTime + 0.15)
          } catch (e) {
            // Ignore if browser blocks context
          }
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  // Add Dynamic Set to Exercise
  const handleAddSet = (exerciseId: string, lastReps: string) => {
    setExerciseLogs(prevLogs =>
      prevLogs.map(ex => {
        if (ex.exerciseId !== exerciseId) return ex
        const nextIndex = ex.sets.length + 1
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { setIndex: nextIndex, weight: '', reps: lastReps || '10', completed: false }
          ]
        }
      })
    )
  }

  // Format stopwatch output: hh:mm:ss
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean).join(':')
  }

  // Submit Workout Session
  const handleFinishWorkout = async () => {
    if (!session || !program) return

    setSaving(true)
    try {
      const minutesElapsed = Math.max(1, Math.round(timeElapsed / 60))
      
      // Filter exercises where at least one set is completed, to avoid logging empty exercises
      const filteredExercises = exerciseLogs.map(ex => ({
        exerciseId: ex.exerciseId,
        loggedSets: ex.sets.filter(s => s.completed).map(s => ({
          setIndex: s.setIndex,
          weight: parseFloat(s.weight) || 0,
          reps: parseInt(s.reps) || 0,
          completed: true
        }))
      })).filter(ex => ex.loggedSets.length > 0)

      if (filteredExercises.length === 0) {
        alert('Veuillez valider au moins une série pour pouvoir enregistrer votre entraînement.')
        setSaving(false)
        return
      }

      const payload = {
        userId: session.user.id,
        programId: program.id,
        duration: minutesElapsed,
        notes,
        loggedExercises: filteredExercises
      }

      const response = await fetch('/api/workout-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        router.push('/dashboard?success=workout_saved')
      } else {
        alert('Erreur lors de la sauvegarde de la séance.')
      }
    } catch (err) {
      console.error(err)
      alert('Erreur réseau lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
        <p>Préparation de votre séance d'entraînement...</p>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold mb-4">{error || 'Programme introuvable'}</p>
        <button
          onClick={() => router.push('/programs')}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
        >
          Retour aux programmes
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Rest Timer Floating Toast */}
      {restCountdown !== null && (
        <div className="fixed bottom-6 right-6 z-50 glass-card neon-border-neon px-6 py-4 flex items-center space-x-4 animate-bounce">
          <div className="relative flex items-center justify-center h-12 w-12 rounded-full border-2 border-lime-400/30 text-lime-400 font-bold">
            {restCountdown}
          </div>
          <div>
            <p className="text-sm font-bold text-white">Temps de repos actif</p>
            <p className="text-xs text-slate-400">Préparez-vous pour la suite !</p>
          </div>
          <button 
            onClick={() => setRestCountdown(null)}
            className="text-xs font-bold text-slate-500 hover:text-white"
          >
            Passer
          </button>
        </div>
      )}

      {/* Workout Header Info */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-orange-500">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 mb-2 border border-orange-500/25">
            Séance en cours ⚡
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{program.name}</h1>
          <p className="text-sm text-slate-400 mt-1">{program.description || 'Bonne séance d\'entraînement !'}</p>
        </div>

        {/* Live Stopwatch UI */}
        <div className="flex items-center justify-center gap-4 bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 shadow-inner self-start md:self-auto">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Chrono</p>
            <p className="text-2xl font-mono font-black text-white tracking-wider">
              {formatTime(timeElapsed)}
            </p>
          </div>
        </div>
      </div>

      {/* Exercises Logging List */}
      <div className="space-y-6">
        {program.exercises.map((pe, idx) => {
          const log = exerciseLogs.find(el => el.exerciseId === pe.exercise.id)
          if (!log) return null

          return (
            <div key={pe.id} className="glass-card overflow-hidden">
              {/* Exercise Header */}
              <div className="p-4 sm:p-5 bg-slate-900/40 border-b border-slate-800/80 flex gap-4">
                {pe.exercise.imageUrl && (
                  <img
                    src={pe.exercise.imageUrl}
                    alt={pe.exercise.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl border border-slate-800"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {idx + 1}. {pe.exercise.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                      {pe.exercise.muscleGroup}
                    </span>
                    {pe.exercise.equipment && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-400">
                        {pe.exercise.equipment}
                      </span>
                    )}
                  </div>
                  {pe.notes && (
                    <p className="text-xs text-orange-400 font-semibold mt-2">
                      💡 Notes du coach : {pe.notes}
                    </p>
                  )}
                  {pe.exercise.instructions && (
                    <details className="mt-2 text-xs text-slate-400 cursor-pointer">
                      <summary className="hover:text-slate-200">Consulter les instructions</summary>
                      <p className="mt-1 bg-slate-950/40 p-3 rounded-lg border border-slate-900 whitespace-pre-line leading-relaxed">
                        {pe.exercise.instructions}
                      </p>
                    </details>
                  )}
                </div>
              </div>

              {/* Set Logging Matrix */}
              <div className="p-4 sm:p-5 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 w-16 text-center">Série</th>
                      <th className="pb-3 w-32">Objectif</th>
                      <th className="pb-3 w-32">Poids (kg)</th>
                      <th className="pb-3 w-32">Répétitions</th>
                      <th className="pb-3 w-24 text-center">Validé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {log.sets.map((set, sIdx) => (
                      <tr 
                        key={set.setIndex} 
                        className={`transition-colors ${set.completed ? 'bg-orange-500/5' : 'hover:bg-slate-900/20'}`}
                      >
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                            set.completed ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {set.setIndex}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 text-sm font-semibold">
                          {pe.reps} reps
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="number"
                            step="0.5"
                            placeholder="0"
                            disabled={set.completed}
                            value={set.weight}
                            onChange={(e) => handleSetChange(pe.exercise.id, set.setIndex, 'weight', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-lg px-3 py-1.5 text-sm text-white font-bold disabled:opacity-50"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="number"
                            placeholder="10"
                            disabled={set.completed}
                            value={set.reps}
                            onChange={(e) => handleSetChange(pe.exercise.id, set.setIndex, 'reps', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500/50 rounded-lg px-3 py-1.5 text-sm text-white font-bold disabled:opacity-50"
                          />
                        </td>
                        <td className="py-3 text-center">
                          <input
                            type="checkbox"
                            checked={set.completed}
                            onChange={(e) => handleToggleSetComplete(
                              pe.exercise.id, 
                              set.setIndex, 
                              e.target.checked, 
                              pe.restTime || 60
                            )}
                            className="custom-checkbox h-6 w-6"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Set Manager Actions */}
              <div className="px-5 py-3 bg-slate-900/20 border-t border-slate-800/50 flex justify-between">
                <button
                  type="button"
                  onClick={() => handleAddSet(pe.exercise.id, pe.reps.toString())}
                  className="inline-flex items-center text-xs font-semibold text-orange-500 hover:text-orange-400 transition"
                >
                  ➕ Ajouter une série
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall Session Notes */}
      <div className="glass-card p-6">
        <label htmlFor="notes" className="block text-sm font-bold text-slate-300 mb-2">
          Notes de séance (Optionnel)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ressentis de séance, fatigue, énergie, difficultés sur un exercice..."
          className="w-full bg-slate-900 border border-slate-850 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 rounded-xl px-4 py-3 text-sm text-white leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={() => {
            if (confirm('Voulez-vous vraiment annuler votre séance ? Les données en cours seront perdues.')) {
              router.push('/dashboard')
            }
          }}
          className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-center text-sm font-bold border border-slate-800 transition shadow-inner"
        >
          Abandonner la séance
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={handleFinishWorkout}
          className="flex-[2] py-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-xl text-center text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-xl shadow-orange-950/20 disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Sauvegarde en cours...' : 'Terminer l\'entraînement 🏁'}
        </button>
      </div>
    </div>
  )
}
