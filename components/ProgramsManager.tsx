'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment?: string
  imageUrl?: string
  description?: string
}

interface ProgramExerciseItem {
  localId: string
  exerciseId: string
  exercise: Exercise
  sets: number
  reps: number
  restTime: number
  notes: string
}

interface Program {
  id: string
  name: string
  description?: string
  createdAt: string
  _count?: { exercises: number }
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
  thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
}
const DAYS = Object.keys(DAY_LABELS)

const MUSCLE_COLORS: Record<string, string> = {
  'Jambes': '#3b82f6', 'Poitrine': '#ef4444', 'Dos': '#8b5cf6',
  'Épaules': '#f59e0b', 'Abdominaux': '#10b981', 'Corps entier': '#ff5722',
  'Biceps': '#ec4899', 'Triceps': '#6366f1'
}

export default function ProgramsManager({ coachId }: { coachId: string }) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [exercisesLoading, setExercisesLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMuscle, setFilterMuscle] = useState('')

  const [currentDay, setCurrentDay] = useState('monday')
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, ProgramExerciseItem[]>>({
    monday: [], tuesday: [], wednesday: [], thursday: [],
    friday: [], saturday: [], sunday: []
  })
  const [formData, setFormData] = useState({ name: '', description: '' })

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch('/api/programs')
      if (res.ok) setPrograms(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  const fetchExercises = useCallback(async () => {
    try {
      // First try to get from DB
      const res = await fetch('/api/exercises')
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          setExercises(data)
          setExercisesLoading(false)
          return
        }
      }
      // If no exercises in DB, auto-seed
      await fetch('/api/exercises/seed', { method: 'POST' })
      const res2 = await fetch('/api/exercises')
      if (res2.ok) setExercises(await res2.json())
    } catch (e) { console.error(e) }
    finally { setExercisesLoading(false) }
  }, [])

  useEffect(() => {
    fetchPrograms()
    fetchExercises()
  }, [fetchPrograms, fetchExercises])

  const addExerciseToDay = (exercise: Exercise) => {
    const newItem: ProgramExerciseItem = {
      localId: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      exercise,
      sets: 3, reps: 10, restTime: 60, notes: ''
    }
    setWeeklyPlan(prev => ({ ...prev, [currentDay]: [...prev[currentDay], newItem] }))
  }

  const removeFromDay = (localId: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [currentDay]: prev[currentDay].filter(e => e.localId !== localId)
    }))
  }

  const updateExercise = (localId: string, field: keyof ProgramExerciseItem, value: any) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [currentDay]: prev[currentDay].map(e => e.localId === localId ? { ...e, [field]: value } : e)
    }))
  }

  const totalExercises = Object.values(weeklyPlan).reduce((sum, arr) => sum + arr.length, 0)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!formData.name.trim()) { setError('Le nom du programme est obligatoire.'); return }
    if (totalExercises === 0) { setError('Ajoutez au moins un exercice à un jour.'); return }

    setSaving(true)
    const created: Program[] = []

    for (const [day, items] of Object.entries(weeklyPlan)) {
      if (items.length === 0) continue
      const dayLabel = DAY_LABELS[day]
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.name} — ${dayLabel}`,
          description: formData.description || `Programme du ${dayLabel}`,
          exercises: items.map(e => ({
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            restTime: e.restTime,
            notes: e.notes
          }))
        })
      })
      if (res.ok) created.push(await res.json())
      else {
        const err = await res.json()
        setError(err.error || 'Erreur lors de la création')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    if (created.length > 0) {
      setPrograms(prev => [...created, ...prev])
      setWeeklyPlan({ monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] })
      setFormData({ name: '', description: '' })
      setShowForm(false)
      setSuccessMsg(`✅ ${created.length} programme(s) créé(s) avec succès !`)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce programme ? Cette action est irréversible.')) return
    const res = await fetch(`/api/programs/${id}`, { method: 'DELETE' })
    if (res.ok) setPrograms(prev => prev.filter(p => p.id !== id))
  }

  const filteredExercises = exercises.filter(ex => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || ex.name.toLowerCase().includes(q) || ex.muscleGroup.toLowerCase().includes(q)
    const matchMuscle = !filterMuscle || ex.muscleGroup === filterMuscle
    return matchSearch && matchMuscle
  })
  const muscleGroups = [...new Set(exercises.map(e => e.muscleGroup))].sort()
  const isInCurrentDay = (exId: string) => weeklyPlan[currentDay].some(e => e.exerciseId === exId)

  // ── styles ──────────────────────────────────────────────────
  const S = {
    card: { background: 'rgba(18,24,36,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(30,41,59,0.8)', borderRadius: '1rem', padding: '1.5rem' } as React.CSSProperties,
    input: { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '0.6rem', color: '#f9fafb', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
    label: { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
    btn: (color = '#ff5722') => ({ padding: '0.6rem 1.2rem', background: `linear-gradient(135deg, ${color}, ${color}dd)`, border: 'none', borderRadius: '0.6rem', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }) as React.CSSProperties,
    btnOutline: { padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '0.6rem', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' } as React.CSSProperties,
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
      <p>Chargement des programmes...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>Gestion des Programmes</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{programs.length} programme(s) créé(s)</p>
        </div>
        <button style={S.btn()} onClick={() => { setShowForm(!showForm); setError('') }}>
          {showForm ? '✕ Annuler' : '+ Nouveau Programme'}
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.75rem', padding: '1rem', color: '#86efac' }}>
          {successMsg}
        </div>
      )}

      {/* Creation form */}
      {showForm && (
        <div style={{ ...S.card, border: '1px solid rgba(255,87,34,0.2)' }}>
          <h3 style={{ color: '#ff5722', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 1.5rem' }}>
            📋 Créer un nouveau programme hebdomadaire
          </h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Name & Description */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={S.label}>Nom du programme *</label>
                <input style={S.input} placeholder="Ex: Programme Débutant" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label style={S.label}>Description</label>
                <input style={S.input} placeholder="Ex: Programme sur 4 semaines" value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>

            {/* Day selector */}
            <div>
              <label style={S.label}>Choisir le jour</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {DAYS.map(day => (
                  <button key={day} type="button"
                    onClick={() => setCurrentDay(day)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '2rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      transition: 'all 0.2s',
                      background: currentDay === day ? 'linear-gradient(135deg,#ff5722,#ff9800)' : 'rgba(30,41,59,0.6)',
                      color: currentDay === day ? '#fff' : '#94a3b8',
                      position: 'relative' as const,
                    }}>
                    {DAY_LABELS[day]}
                    {weeklyPlan[day].length > 0 && (
                      <span style={{
                        position: 'absolute', top: '-6px', right: '-6px',
                        background: '#d4ff00', color: '#0a0e17',
                        borderRadius: '50%', width: '16px', height: '16px',
                        fontSize: '0.6rem', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{weeklyPlan[day].length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Left: Exercise picker */}
              <div>
                <label style={S.label}>Exercices disponibles ({filteredExercises.length})</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input style={{ ...S.input, flex: 1 }} placeholder="🔍 Rechercher..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)} />
                  <select style={{ ...S.input, width: 'auto' }} value={filterMuscle}
                    onChange={e => setFilterMuscle(e.target.value)}>
                    <option value="">Tous</option>
                    {muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {exercisesLoading ? (
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Chargement des exercices...</p>
                ) : (
                  <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredExercises.map(ex => {
                      const added = isInCurrentDay(ex.id)
                      const color = MUSCLE_COLORS[ex.muscleGroup] || '#64748b'
                      return (
                        <div key={ex.id} style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.6rem 0.75rem',
                          background: added ? 'rgba(255,87,34,0.1)' : 'rgba(30,41,59,0.4)',
                          border: `1px solid ${added ? 'rgba(255,87,34,0.4)' : 'rgba(51,65,85,0.5)'}`,
                          borderRadius: '0.6rem',
                          transition: 'all 0.2s',
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</p>
                            <span style={{ fontSize: '0.7rem', color, fontWeight: 700 }}>{ex.muscleGroup}</span>
                          </div>
                          <button type="button"
                            onClick={() => added ? removeFromDay(weeklyPlan[currentDay].find(e => e.exerciseId === ex.id)!.localId) : addExerciseToDay(ex)}
                            style={{
                              padding: '0.3rem 0.7rem',
                              borderRadius: '0.4rem',
                              border: 'none',
                              background: added ? 'rgba(239,68,68,0.2)' : 'rgba(255,87,34,0.2)',
                              color: added ? '#f87171' : '#ff5722',
                              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                              flexShrink: 0,
                            }}>
                            {added ? '✕' : '+'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Right: Current day exercises */}
              <div>
                <label style={S.label}>
                  Exercices — {DAY_LABELS[currentDay]} ({weeklyPlan[currentDay].length})
                </label>
                {weeklyPlan[currentDay].length === 0 ? (
                  <div style={{ background: 'rgba(30,41,59,0.3)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', border: '2px dashed rgba(51,65,85,0.5)' }}>
                    Aucun exercice pour ce jour.<br />Cliquez sur + pour en ajouter.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
                    {weeklyPlan[currentDay].map((item) => (
                      <div key={item.localId} style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '0.75rem', padding: '0.75rem', border: '1px solid rgba(51,65,85,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{item.exercise.name}</p>
                          <button type="button" onClick={() => removeFromDay(item.localId)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                          {[
                            { label: 'Séries', field: 'sets' as const, min: 1, max: 10 },
                            { label: 'Reps', field: 'reps' as const, min: 1, max: 100 },
                            { label: 'Repos(s)', field: 'restTime' as const, min: 0, max: 300, step: 15 },
                          ].map(cfg => (
                            <div key={cfg.field}>
                              <label style={{ ...S.label, fontSize: '0.65rem' }}>{cfg.label}</label>
                              <input type="number" min={cfg.min} max={cfg.max} step={(cfg as any).step || 1}
                                value={item[cfg.field] as number}
                                onChange={e => updateExercise(item.localId, cfg.field, parseInt(e.target.value))}
                                style={{ ...S.input, textAlign: 'center', padding: '0.35rem' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {totalExercises > 0 && (
              <div style={{ background: 'rgba(255,87,34,0.06)', border: '1px solid rgba(255,87,34,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                <p style={{ color: '#ff5722', fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>
                  📊 Résumé: {DAYS.filter(d => weeklyPlan[d].length > 0).map(d => `${DAY_LABELS[d]} (${weeklyPlan[d].length} ex.)`).join(' • ')}
                </p>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.875rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" style={S.btnOutline} onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" disabled={saving} style={S.btn()}>
                {saving ? '⏳ Création...' : `🚀 Créer ${DAYS.filter(d => weeklyPlan[d].length > 0).length} programme(s)`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Programs list */}
      <div style={S.card}>
        {programs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Aucun programme créé</p>
            <p style={{ fontSize: '0.875rem' }}>Cliquez sur "Nouveau Programme" pour commencer</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {programs.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'rgba(30,41,59,0.4)',
                border: '1px solid rgba(51,65,85,0.5)',
                borderRadius: '0.75rem',
                gap: '1rem',
                flexWrap: 'wrap',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,87,34,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '1rem' }}>{p.name}</h4>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {p.description && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{p.description}</span>}
                    <span style={{ background: 'rgba(255,87,34,0.15)', color: '#ff5722', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '2rem' }}>
                      {p._count?.exercises ?? 0} exercices
                    </span>
                    <span style={{ color: '#475569', fontSize: '0.75rem' }}>
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <Link href={`/coach/programs/${p.id}/assign`}
                    style={{ padding: '0.45rem 0.9rem', background: 'rgba(212,255,0,0.12)', border: '1px solid rgba(212,255,0,0.25)', color: '#d4ff00', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                    Assigner →
                  </Link>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ padding: '0.45rem 0.9rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}