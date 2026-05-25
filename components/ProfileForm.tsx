'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
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
        setError('Vous n\'êtes pas autorisé à accéder à ce profil.')
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
        setTimeout(() => router.push('/dashboard'), 2000)
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
    return <div className="text-center">Chargement...</div>
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur de chargement
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchProfile}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center">Erreur lors du chargement du profil</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Informations personnelles
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Renseignez vos informations pour un coaching personnalisé.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={profile.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Sexe
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={profile.gender || ''}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Sélectionner</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                    Âge
                  </label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={profile.age || ''}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    id="weight"
                    value={profile.weight || ''}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    id="height"
                    value={profile.height || ''}
                    onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                    Objectif
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    value={profile.goal || ''}
                    onChange={(e) => handleChange('goal', e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Sélectionner</option>
                    <option value="weight_loss">Perte de poids</option>
                    <option value="muscle_gain">Prise de masse musculaire</option>
                    <option value="maintenance">Maintien</option>
                    <option value="strength">Force</option>
                    <option value="endurance">Endurance</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Niveau d'expérience
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={profile.experience || ''}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Sélectionner</option>
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-md ${message.includes('succès') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}