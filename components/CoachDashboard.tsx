'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Stats {
  clientCount: number
  programCount: number
  exerciseCount: number
  sessionCount: number
}

export default function CoachDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({ clientCount: 0, programCount: 0, exerciseCount: 0, sessionCount: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, programsRes, exercisesRes] = await Promise.all([
          fetch('/api/coach/clients'),
          fetch('/api/programs'),
          fetch('/api/exercises'),
        ])
        const [clients, programs, exercises] = await Promise.all([
          clientsRes.ok ? clientsRes.json() : [],
          programsRes.ok ? programsRes.json() : [],
          exercisesRes.ok ? exercisesRes.json() : [],
        ])
        setStats({
          clientCount: clients.length,
          programCount: programs.length,
          exerciseCount: exercises.length,
          sessionCount: 0,
        })
      } catch (e) { console.error(e) }
      finally { setLoadingStats(false) }
    }
    fetchStats()
  }, [])

  const statCards = [
    { icon: '👥', label: 'Clients actifs', value: stats.clientCount, color: '#3b82f6', href: '/coach/clients' },
    { icon: '📋', label: 'Programmes créés', value: stats.programCount, color: '#ff5722', href: '/coach/programs' },
    { icon: '🏋️', label: 'Exercices en biblio', value: stats.exerciseCount, color: '#d4ff00', href: '/coach/exercises' },
  ]

  const quickLinks = [
    { icon: '📋', title: 'Mes Programmes', desc: 'Créer et gérer les programmes', href: '/coach/programs', color: '#ff5722' },
    { icon: '👥', title: 'Mes Clients', desc: 'Voir les profils et assigner des programmes', href: '/coach/clients', color: '#3b82f6' },
    { icon: '🏋️', title: 'Bibliothèque Exercices', desc: 'Parcourir et gérer les exercices', href: '/coach/exercises', color: '#d4ff00' },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', margin: '0 0 0.25rem' }}>
              Espace <span style={{ background: 'linear-gradient(135deg,#ff5722,#ff9800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Coach</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
              Bonjour {session?.user?.name || 'Coach'} 👋 — Gérez vos clients et programmes
            </p>
          </div>
          <Link href="/dashboard"
            style={{ padding: '0.6rem 1.2rem', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.6)', borderRadius: '0.6rem', color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
            ← Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {statCards.map(card => (
            <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(18,24,36,0.85)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(30,41,59,0.8)',
                borderRadius: '1rem', padding: '1.5rem',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = card.color + '55'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.8)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '0.75rem',
                    background: card.color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>{card.icon}</div>
                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                    <p style={{ color: card.color, fontSize: '2rem', fontWeight: 900, margin: 0, lineHeight: 1 }}>
                      {loadingStats ? '—' : card.value}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick access */}
        <div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 1rem' }}>Accès rapide</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'rgba(18,24,36,0.85)', backdropFilter: 'blur(12px)',
                  border: `1px solid ${link.color}22`,
                  borderRadius: '1rem', padding: '1.5rem',
                  display: 'flex', alignItems: 'center', gap: '1.25rem',
                  transition: 'all 0.25s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = link.color + '55'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 30px -10px ${link.color}30` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = link.color + '22'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                >
                  <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>{link.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 0.25rem', fontSize: '1.05rem' }}>{link.title}</p>
                    <p style={{ color: '#64748b', fontSize: '0.825rem', margin: 0 }}>{link.desc}</p>
                  </div>
                  <span style={{ color: link.color, fontSize: '1.25rem', flexShrink: 0 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div style={{
          background: 'rgba(255,87,34,0.05)', border: '1px solid rgba(255,87,34,0.15)',
          borderRadius: '1rem', padding: '1.25rem 1.5rem',
          display: 'flex', gap: '1rem', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</span>
          <div>
            <p style={{ color: '#fb923c', fontWeight: 700, margin: '0 0 0.25rem' }}>Workflow recommandé</p>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              1. Allez dans <strong style={{ color: '#94a3b8' }}>Programmes</strong> → Créez un programme hebdomadaire →
              2. Cliquez sur <strong style={{ color: '#94a3b8' }}>Assigner</strong> pour l'attribuer à un client →
              3. Le client verra le programme dans son <strong style={{ color: '#94a3b8' }}>Dashboard</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}