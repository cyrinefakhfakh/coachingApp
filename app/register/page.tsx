'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)

    // All public registrations are "client" — coach can only be set via server-side whitelist
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, role: 'client' })
    })

    setLoading(false)

    if (response.ok) {
      setSuccess('Inscription réussie ! Redirection vers la connexion...')
      setTimeout(() => router.push('/login'), 2000)
    } else {
      const data = await response.json()
      setError(data.error || 'Une erreur est survenue.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(ellipse at top right, rgba(212,255,0,0.07) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(255,87,34,0.10) 0%, transparent 50%), #0a0e17',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Back button */}
        <Link href="/login" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#94a3b8',
          textDecoration: 'none',
          fontSize: '0.875rem',
          marginBottom: '2rem',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ff5722')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          ← Retour à la connexion
        </Link>

        {/* Card */}
        <div style={{
          background: 'rgba(18, 24, 36, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(30, 41, 59, 0.8)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,255,0,0.04)',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #d4ff00, #a3e635)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.75rem',
              boxShadow: '0 0 30px rgba(212,255,0,0.3)',
            }}>🏋️</div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #d4ff00, #a3e635)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 0.25rem',
            }}>Créer un compte</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              Rejoignez votre coach et commencez 🚀
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hamza Martin"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.8)',
                  borderRadius: '0.75rem',
                  color: '#f9fafb', fontSize: '0.95rem', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(212,255,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,255,0,0.08)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(51,65,85,0.8)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.8)',
                  borderRadius: '0.75rem',
                  color: '#f9fafb', fontSize: '0.95rem', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(212,255,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,255,0,0.08)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(51,65,85,0.8)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 caractères"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.8)',
                  borderRadius: '0.75rem',
                  color: '#f9fafb', fontSize: '0.95rem', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(212,255,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,255,0,0.08)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(51,65,85,0.8)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid ${confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.6)' : 'rgba(51,65,85,0.8)'}`,
                  borderRadius: '0.75rem',
                  color: '#f9fafb', fontSize: '0.95rem', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(212,255,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,255,0,0.08)' }}
                onBlur={e => { e.target.style.borderColor = confirmPassword !== password ? 'rgba(239,68,68,0.6)' : 'rgba(51,65,85,0.8)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.75rem', padding: '0.75rem 1rem',
                color: '#fca5a5', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>⚠️ {error}</div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '0.75rem', padding: '0.75rem 1rem',
                color: '#86efac', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>✅ {success}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading ? 'rgba(212,255,0,0.3)' : 'linear-gradient(135deg, #d4ff00, #a3e635)',
                border: 'none',
                borderRadius: '0.75rem',
                color: '#0a0e17',
                fontSize: '1rem',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(212,255,0,0.3)',
                marginTop: '0.5rem',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.transform = 'translateY(-1px)') }}
              onMouseLeave={e => { (e.currentTarget.style.transform = 'translateY(0)') }}
            >
              {loading ? '⏳ Inscription...' : 'Créer mon compte →'}
            </button>

            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>
              Déjà inscrit ?{' '}
              <Link href="/login" style={{ color: '#d4ff00', textDecoration: 'none', fontWeight: '600' }}>
                Se connecter
              </Link>
            </p>
          </form>
        </div>

        {/* Coach note */}
        <div style={{
          marginTop: '1.5rem',
          background: 'rgba(255,87,34,0.06)',
          border: '1px solid rgba(255,87,34,0.15)',
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.25rem' }}>🔐</span>
          <div>
            <p style={{ color: '#fb923c', fontWeight: '700', fontSize: '0.875rem', margin: '0 0 0.25rem' }}>Accès Coach</p>
            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
              L'accès coach est réservé et configuré par l'administrateur. Inscrivez-vous comme client et contactez votre coach.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}