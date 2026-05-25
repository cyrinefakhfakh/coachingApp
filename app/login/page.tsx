'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    setLoading(false)

    if (result?.error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      const session = await getSession()
      if (session?.user.role?.toLowerCase() === 'coach') {
        router.push('/coach')
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(ellipse at top left, rgba(255,87,34,0.12) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(212,255,0,0.06) 0%, transparent 50%), #0a0e17',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Back button */}
        <Link href="/" style={{
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
          ← Retour à l'accueil
        </Link>

        {/* Card */}
        <div style={{
          background: 'rgba(18, 24, 36, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(30, 41, 59, 0.8)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,87,34,0.05)',
        }}>

          {/* Logo / Icon */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #ff5722, #ff9800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.75rem',
              boxShadow: '0 0 30px rgba(255,87,34,0.35)',
            }}>💪</div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ff5722, #ff9800)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 0.25rem',
            }}>Connexion</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              Content de vous revoir 👋
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

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
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.8)',
                  borderRadius: '0.75rem',
                  color: '#f9fafb',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(255,87,34,0.6)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,87,34,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(51,65,85,0.8)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

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
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.8)',
                  borderRadius: '0.75rem',
                  color: '#f9fafb',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(255,87,34,0.6)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,87,34,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(51,65,85,0.8)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: '#fca5a5',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading ? 'rgba(255,87,34,0.5)' : 'linear-gradient(135deg, #ff5722, #ff9800)',
                border: 'none',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(255,87,34,0.4)',
                marginTop: '0.5rem',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.transform = 'translateY(-1px)') }}
              onMouseLeave={e => { (e.currentTarget.style.transform = 'translateY(0)') }}
            >
              {loading ? '⏳ Connexion...' : 'Se connecter →'}
            </button>

            {/* Register link */}
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0' }}>
              Pas encore de compte ?{' '}
              <Link href="/register" style={{ color: '#ff5722', textDecoration: 'none', fontWeight: '600' }}>
                S'inscrire
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}