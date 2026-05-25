'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name?: string
  email: string
  gender?: string
  weight?: number
  height?: number
  age?: number
  goal?: string
  experience?: string
  createdAt: string
}

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Perte de poids', muscle_gain: 'Prise de masse',
  maintenance: 'Maintien', endurance: 'Endurance', flexibility: 'Souplesse'
}
const EXP_LABELS: Record<string, string> = {
  beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé'
}
const EXP_COLORS: Record<string, string> = {
  beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444'
}

export default function ClientsList({ coachId }: { coachId: string }) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/coach/clients')
      .then(r => r.ok ? r.json() : [])
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [coachId])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return !q || (c.name?.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
  })

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
      <p>Chargement des clients...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>Mes Clients</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{clients.length} client(s) inscrit(s)</p>
        </div>
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            background: 'rgba(30,41,59,0.6)',
            border: '1px solid rgba(51,65,85,0.8)',
            borderRadius: '0.6rem',
            color: '#f9fafb',
            fontSize: '0.875rem',
            outline: 'none',
            minWidth: '220px',
          }}
        />
      </div>

      {/* Client grid */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'rgba(18,24,36,0.85)', border: '2px dashed rgba(51,65,85,0.5)',
          borderRadius: '1rem', padding: '4rem 2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <p style={{ color: '#94a3b8', fontWeight: 600, margin: '0 0 0.5rem' }}>
            {search ? 'Aucun client trouvé' : 'Aucun client inscrit'}
          </p>
          <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>
            {search ? 'Essayez un autre nom ou email.' : 'Les clients apparaîtront ici après leur inscription.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map(client => {
            const expColor = EXP_COLORS[client.experience || ''] || '#64748b'
            const initial = (client.name || client.email).charAt(0).toUpperCase()
            return (
              <div key={client.id} style={{
                background: 'rgba(18,24,36,0.85)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(30,41,59,0.8)',
                borderRadius: '1rem', padding: '1.25rem',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,87,34,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.8)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                {/* Top: avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,#ff5722,#ff9800)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.25rem', color: '#fff', flexShrink: 0,
                  }}>{initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.name || 'Sans nom'}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.1rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</p>
                  </div>
                  {client.experience && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: expColor, background: expColor + '20', padding: '0.2rem 0.5rem', borderRadius: '2rem', flexShrink: 0 }}>
                      {EXP_LABELS[client.experience] || client.experience}
                    </span>
                  )}
                </div>

                {/* Stats */}
                {(client.age || client.weight || client.height || client.goal) && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {client.age && <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(30,41,59,0.6)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem' }}>🎂 {client.age} ans</span>}
                    {client.weight && <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(30,41,59,0.6)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem' }}>⚖️ {client.weight} kg</span>}
                    {client.height && <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(30,41,59,0.6)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem' }}>📏 {client.height} cm</span>}
                    {client.goal && <span style={{ fontSize: '0.75rem', color: '#ff5722', background: 'rgba(255,87,34,0.1)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem' }}>🎯 {GOAL_LABELS[client.goal] || client.goal}</span>}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/coach/clients/${client.id}`}
                    style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.6)', borderRadius: '0.5rem', color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                    👤 Voir profil
                  </Link>
                  <Link href={`/coach/programs`}
                    style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(255,87,34,0.12)', border: '1px solid rgba(255,87,34,0.25)', borderRadius: '0.5rem', color: '#ff5722', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                    📋 Assigner prog.
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}