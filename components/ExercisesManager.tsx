'use client'

import { useState, useEffect } from 'react'

interface Exercise {
  id: string
  name: string
  description?: string
  muscleGroup: string
  equipment?: string
  instructions?: string
  imageUrl?: string
}

export default function ExercisesManager() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscleGroup: '',
    equipment: '',
    instructions: '',
    imageUrl: ''
  })

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises')
      if (response.ok) {
        const data = await response.json()
        setExercises(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des exercices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingExercise ? `/api/exercises/${editingExercise.id}` : '/api/exercises'
      const method = editingExercise ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchExercises()
        setShowForm(false)
        setEditingExercise(null)
        setFormData({
          name: '',
          description: '',
          muscleGroup: '',
          equipment: '',
          instructions: '',
          imageUrl: ''
        })
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment || '',
      instructions: exercise.instructions || '',
      imageUrl: exercise.imageUrl || ''
    })
    setShowForm(true)
    // Fait défiler jusqu'au formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      try {
        const response = await fetch(`/api/exercises/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchExercises()
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const getMuscleGroupName = (key: string) => {
    const groups: Record<string, string> = {
      chest: 'Pectoraux',
      back: 'Dos',
      shoulders: 'Épaules',
      arms: 'Bras',
      legs: 'Jambes',
      core: 'Abdominaux',
      full_body: 'Corps entier'
    }
    return groups[key] || key
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ff5722]"></div>
        <span className="ml-3 text-gray-400 font-medium">Chargement des exercices...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header action */}
      <div className="flex justify-between items-center bg-[#121824]/40 p-4 rounded-xl border border-[#1e293b] backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-bold text-white">Bibliothèque d'Exercices</h2>
          <p className="text-xs text-gray-400 mt-0.5">{exercises.length} exercices enregistrés</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setEditingExercise(null)
              setFormData({ name: '', description: '', muscleGroup: '', equipment: '', instructions: '', imageUrl: '' })
            }
            setShowForm(!showForm)
          }}
          className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-all ${
            showForm 
              ? 'bg-transparent border border-[#1e293b] text-gray-300 hover:bg-white/5' 
              : 'bg-[#ff5722] hover:bg-[#e64a19] text-white'
          }`}
        >
          {showForm ? 'Annuler' : 'Ajouter un exercice'}
        </button>
      </div>

      {/* Formulaire d'ajout / modification */}
      {showForm && (
        <div className="glass-card p-6 md:p-8 neon-border-orange animate-fadeIn">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5722]"></span>
            {editingExercise ? 'Modifier l\'exercice' : 'Ajouter un nouvel exercice'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                  Nom de l'exercice *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-colors"
                  placeholder="Ex: développé incliné haltères"
                />
              </div>

              <div>
                <label htmlFor="muscleGroup" className="block text-sm font-medium text-gray-400 mb-2">
                  Groupe musculaire *
                </label>
                <select
                  id="muscleGroup"
                  name="muscleGroup"
                  required
                  value={formData.muscleGroup}
                  onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                  className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] transition-colors"
                >
                  <option value="" className="bg-[#0e131f] text-gray-400">Sélectionner un groupe</option>
                  <option value="chest" className="bg-[#0e131f] text-white">Pectoraux</option>
                  <option value="back" className="bg-[#0e131f] text-white">Dos</option>
                  <option value="shoulders" className="bg-[#0e131f] text-white">Épaules</option>
                  <option value="arms" className="bg-[#0e131f] text-white">Bras (Biceps/Triceps)</option>
                  <option value="legs" className="bg-[#0e131f] text-white">Jambes (Quadriceps/Ischios/Mollets)</option>
                  <option value="core" className="bg-[#0e131f] text-white">Abdominaux / Gainage</option>
                  <option value="full_body" className="bg-[#0e131f] text-white">Corps entier</option>
                </select>
              </div>

              <div>
                <label htmlFor="equipment" className="block text-sm font-medium text-gray-400 mb-2">
                  Équipement requis
                </label>
                <input
                  type="text"
                  name="equipment"
                  id="equipment"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  placeholder="Ex: haltères, poulie, aucun..."
                  className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-400 mb-2">
                  URL de l'image illustrative
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Ex: https://images.pexels.com/..."
                  className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">
                Description / Rôle anatomique
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Courte description de l'intérêt de cet exercice..."
                className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-400 mb-2">
                Instructions d'exécution
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={3}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Consignes de placement, respiration, trajectoire..."
                className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingExercise(null)
                  setFormData({
                    name: '',
                    description: '',
                    muscleGroup: '',
                    equipment: '',
                    instructions: '',
                    imageUrl: ''
                  })
                }}
                className="px-5 py-2 bg-transparent border border-[#1e293b] text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-all text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-semibold rounded-lg transition-all text-sm shadow-md"
              >
                {editingExercise ? 'Enregistrer les modifications' : 'Créer l\'exercice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des exercices en grille moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exercises.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center text-gray-400 border border-dashed border-[#1e293b]">
            Aucun exercice disponible. Cliquez sur "Ajouter un exercice" pour commencer à remplir votre bibliothèque.
          </div>
        ) : (
          exercises.map((exercise) => (
            <div key={exercise.id} className="glass-card overflow-hidden flex flex-col justify-between glass-card-hover">
              <div>
                {/* Image & Title Header */}
                <div className="relative h-44 w-full bg-[#080c14] border-b border-[#1e293b]">
                  {exercise.imageUrl ? (
                    <img
                      className="h-full w-full object-cover opacity-80"
                      src={exercise.imageUrl}
                      alt={exercise.name}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-600 font-bold bg-[#0d1320]">
                      AUCUN VISUEL
                    </div>
                  )}
                  {/* Muscle Pill Badge */}
                  <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#0a0e17]/80 text-[#d4ff00] border border-[#d4ff00]/30 backdrop-blur-sm shadow-md">
                    🎯 {getMuscleGroupName(exercise.muscleGroup)}
                  </span>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-3">
                  <h4 className="text-base font-bold text-white">{exercise.name}</h4>
                  
                  {exercise.equipment && (
                    <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                      <span className="text-[#ff5722]">🏋️</span> Équipement : {exercise.equipment}
                    </div>
                  )}

                  {exercise.description && (
                    <p className="text-xs text-gray-400 leading-relaxed bg-[#0a0e17]/40 p-2.5 rounded border border-[#1e293b]">
                      {exercise.description}
                    </p>
                  )}

                  {exercise.instructions && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Exécution</span>
                      <p className="text-xs text-gray-400 leading-relaxed max-h-24 overflow-y-auto pr-1">
                        {exercise.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="px-5 pb-5 pt-2 flex gap-3 border-t border-[#1e293b]/40">
                <button
                  onClick={() => handleEdit(exercise)}
                  className="flex-1 py-2 text-center text-xs font-bold rounded bg-[#1e293b] hover:bg-[#ff5722]/10 border border-[#1e293b] hover:border-[#ff5722]/30 text-white transition-all"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(exercise.id)}
                  className="py-2 px-4 text-center text-xs font-bold rounded bg-red-950/20 border border-red-900/30 hover:bg-red-600 hover:border-red-600 text-red-400 hover:text-white transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}