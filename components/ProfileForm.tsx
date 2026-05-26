'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name?: string
  email: string
  role?: string
  gender?: string
  weight?: number
  height?: number
  age?: number
  goal?: string
  experience?: string
}

interface ProfileFormProps {
  userId: string
}

export default function ProfileForm({ userId }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      setError('')
      const response = await fetch(`/api/profile/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else if (response.status === 401) {
        setError("Vous n'êtes pas autorisé à accéder à ce profil.")
      } else if (response.status === 404) {
        setError('Profil non trouvé.')
      } else {
        setError('Erreur lors du chargement du profil.')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        setMessage('Profil mis à jour avec succès !')
        const isCoach = profile?.role?.toLowerCase() === 'coach'
        setTimeout(() => router.push(isCoach ? '/coach' : '/dashboard'), 2000)
      } else {
        setMessage('Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ff5722]"></div>
        <span className="ml-3 text-gray-400 font-medium">Chargement du profil...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card neon-border-orange p-6 text-center">
          <svg className="h-12 w-12 text-[#ff5722] mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-5 py-2.5 bg-[#ff5722] text-white font-semibold rounded-lg hover:bg-[#e64a19] transition-all"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center text-gray-400 py-8">
        Erreur lors du chargement du profil
      </div>
    )
  }

  const isCoach = profile.role?.toLowerCase() === 'coach'

  return (
    <div className="max-w-2xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-6 border-b border-[#1e293b]">
            <div>
              <h3 className="text-xl font-bold text-white">Mon Profil</h3>
              <p className="text-sm text-gray-400 mt-1">
                Gérez vos informations de compte {isCoach ? 'coach' : 'athlète'}.
              </p>
            </div>
            {isCoach ? (
              <span className="self-start sm:self-center inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                👑 COACH PRINCIPAL
              </span>
            ) : (
              <span className="self-start sm:self-center inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30 shadow-[0_0_10px_rgba(212,255,0,0.1)]">
                💪 ATHLÈTE
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                Adresse Email (Non modifiable)
              </label>
              <input
                type="email"
                name="email"
                id="email"
                disabled
                value={profile.email}
                className="w-full bg-[#080c14] border border-[#1e293b] text-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none cursor-not-allowed"
              />
            </div>

            <div className={isCoach ? "sm:col-span-2" : "sm:col-span-1"}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={profile.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-colors"
                placeholder="Votre nom"
              />
            </div>

            {!isCoach && (
              <>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-400 mb-2">
                    Sexe
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={profile.gender || ''}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] transition-colors"
                  >
                    <option value="" className="bg-[#0e131f] text-gray-400">Sélectionner</option>
                    <option value="male" className="bg-[#0e131f] text-white">Homme</option>
                    <option value="female" className="bg-[#0e131f] text-white">Femme</option>
                    <option value="other" className="bg-[#0e131f] text-white">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-400 mb-2">
                    Âge
                  </label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={profile.age || ''}
                    onChange={(e) => handleChange('age', parseInt(e.target.value) || '')}
                    className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-colors"
                    placeholder="Ex: 28"
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-400 mb-2">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    id="weight"
                    value={profile.weight || ''}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value) || '')}
                    className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-colors"
                    placeholder="Ex: 75.5"
                  />
                </div>

                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-400 mb-2">
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    id="height"
                    value={profile.height || ''}
                    onChange={(e) => handleChange('height', parseFloat(e.target.value) || '')}
                    className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-colors"
                    placeholder="Ex: 178"
                  />
                </div>

                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-400 mb-2">
                    Objectif principal
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    value={profile.goal || ''}
                    onChange={(e) => handleChange('goal', e.target.value)}
                    className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] transition-colors"
                  >
                    <option value="" className="bg-[#0e131f] text-gray-400">Sélectionner</option>
                    <option value="weight_loss" className="bg-[#0e131f] text-white">Perte de poids</option>
                    <option value="muscle_gain" className="bg-[#0e131f] text-white">Prise de masse</option>
                    <option value="maintenance" className="bg-[#0e131f] text-white">Maintien</option>
                    <option value="strength" className="bg-[#0e131f] text-white">Force & Puissance</option>
                    <option value="endurance" className="bg-[#0e131f] text-white">Endurance cardio</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-400 mb-2">
                    Niveau d'expérience
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={profile.experience || ''}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    className="w-full bg-[#0e131f] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff5722] transition-colors"
                  >
                    <option value="" className="bg-[#0e131f] text-gray-400">Sélectionner</option>
                    <option value="beginner" className="bg-[#0e131f] text-white">Débutant</option>
                    <option value="intermediate" className="bg-[#0e131f] text-white">Intermédiaire</option>
                    <option value="advanced" className="bg-[#0e131f] text-white">Avancé</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(isCoach ? '/coach' : '/dashboard')}
            className="px-6 py-2.5 bg-transparent border border-[#1e293b] text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-all text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#ff5722] hover:bg-[#e64a19] text-white font-semibold rounded-lg shadow-md transition-all text-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Sauvegarde...
              </span>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-center font-semibold text-sm transition-all border ${
            message.includes('succès')
              ? 'bg-[#d4ff00]/10 text-[#d4ff00] border-[#d4ff00]/30 shadow-[0_0_15px_rgba(212,255,0,0.05)]'
              : 'bg-[#ff5722]/10 text-[#ff5722] border-[#ff5722]/30 shadow-[0_0_15px_rgba(255,87,34,0.05)]'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}