'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  name?: string
  email: string
  goal?: string
  experience?: string
}

interface Program {
  id: string
  name: string
  description?: string
  _count?: { exercises: number }
}

interface AssignedProgram {
  programId: string
}

export default function AssignProgram({ programId, coachId }: { programId: string; coachId: string }) {
  const [clients, setClients] = useState<Client[]>([])
  const [program, setProgram] = useState<Program | null>(null)
  const [assignedTo, setAssignedTo] = useState<Set<string>>(new Set())
  const [selectedClientId, setSelectedClientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  useEffect(() => {
    Promise.all([fetchClients(), fetchProgram()]).finally(() => setLoading(false))
  }, [programId])

  const fetchClients = async () => {
    const res = await fetch('/api/coach/clients')
    if (res.ok) setClients(await res.json())
  }

  const fetchProgram = async () => {
    const res = await fetch(`/api/programs/${programId}`)
    if (res.ok) {
      const data = await res.json()
      setProgram(data)
      // Track who already has this program
      if (data.userPrograms) {
        setAssignedTo(new Set(data.userPrograms.map((up: AssignedProgram) => up.programId)))
      }
    }
  }

  const handleAssign = async () => {
    if (!selectedClientId) { setMessage({ text: 'Veuillez sélectionner un client.', type: 'error' }); return }
    setAssigning(true)
    setMessage(null)

    const res = await fetch('/api/programs/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId, userId: selectedClientId })
    })

    setAssigning(false)
    if (res.ok) {
      setMessage({ text: '✅ Programme assigné avec succès ! Redirection...', type: 'success' })
      setAssignedTo(prev => new Set([...prev, selectedClientId]))
      setTimeout(() => router.push('/coach/programs'), 2000)
    } else {
      const err = await res.json()
      setMessage({ text: err.error || 'Erreur lors de l\'assignation', type: 'error' })
    }
  }

  const S = {
    card: { background: 'rgba(18,24,36,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(30,41,59,0.8)', borderRadius: '1rem', padding: '1.5rem' } as React.CSSProperties,
    input: { width: '100%', padding: '0.75rem 1rem', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '0.6rem', color: '#f9fafb', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
      <p>Chargement...</p>
    </div>
  )

  if (!program) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#f87171' }}>
      <p>Programme introuvable.</p>
      <Link href="/coach/programs" style={{ color: '#ff5722' }}>Retour aux programmes</Link>
    </div>
  )

  const selectedClient = clients.find(c => c.id === selectedClientId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
      {/* Back */}
      <Link href="/coach/programs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>
        ← Retour aux programmes
      </Link>

      {/* Program info card */}
      <div style={{ ...S.card, background: 'rgba(255,87,34,0.06)', border: '1px solid rgba(255,87,34,0.2)' }}>
        <h1 style={{ color: '#ff5722', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 0.5rem' }}>
          📋 Assigner : {program.name}
        </h1>
        {program.description && <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>{program.description}</p>}
        <span style={{ background: 'rgba(255,87,34,0.15)', color: '#ff5722', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '2rem' }}>
          {program._count?.exercises ?? 0} exercices
        </span>
      </div>

      {/* Client selector */}
      <div style={S.card}>
        <h3 style={{ color: '#fff', fontWeight: 700, margin: '0 0 1.25rem', fontSize: '1rem' }}>
          Choisir un client
        </h3>

        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', border: '2px dashed rgba(51,65,85,0.5)', borderRadius: '0.75rem' }}>
            <p style={{ margin: 0 }}>Aucun client inscrit pour le moment.</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem' }}>Les clients apparaîtront ici une fois inscrits.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {clients.map(client => (
                <div key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.85rem 1rem',
                    background: selectedClientId === client.id ? 'rgba(255,87,34,0.12)' : 'rgba(30,41,59,0.4)',
                    border: `1px solid ${selectedClientId === client.id ? 'rgba(255,87,34,0.4)' : 'rgba(51,65,85,0.5)'}`,
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,#ff5722,#ff9800)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '1rem', color: '#fff', flexShrink: 0,
                  }}>
                    {(client.name || client.email).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#fff', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{client.name || 'Sans nom'}</p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>{client.email}</p>
                    {(client.goal || client.experience) && (
                      <p style={{ color: '#475569', fontSize: '0.75rem', margin: '0.15rem 0 0' }}>
                        {client.goal && `Objectif: ${client.goal}`}
                        {client.goal && client.experience && ' • '}
                        {client.experience && `Niveau: ${client.experience}`}
                      </p>
                    )}
                  </div>
                  {selectedClientId === client.id && (
                    <span style={{ color: '#ff5722', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>✓</span>
                  )}
                </div>
              ))}
            </div>

            {/* Client preview */}
            {selectedClient && (
              <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                <strong style={{ color: '#fff' }}>{selectedClient.name}</strong> recevra le programme <strong style={{ color: '#ff5722' }}>{program.name}</strong>
              </div>
            )}

            {/* Message */}
            {message && (
              <div style={{
                background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: '0.75rem', padding: '0.75rem 1rem',
                color: message.type === 'success' ? '#86efac' : '#fca5a5',
                fontSize: '0.875rem',
              }}>{message.text}</div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => router.push('/coach/programs')}
                style={{ padding: '0.65rem 1.2rem', background: 'transparent', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '0.6rem', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                Annuler
              </button>
              <button onClick={handleAssign} disabled={assigning || !selectedClientId}
                style={{
                  padding: '0.65rem 1.4rem',
                  background: assigning || !selectedClientId ? 'rgba(255,87,34,0.3)' : 'linear-gradient(135deg,#ff5722,#ff9800)',
                  border: 'none', borderRadius: '0.6rem', color: '#fff',
                  fontWeight: 700, cursor: assigning || !selectedClientId ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  boxShadow: !assigning && selectedClientId ? '0 4px 15px rgba(255,87,34,0.3)' : 'none',
                }}>
                {assigning ? '⏳ Assignation...' : 'Assigner le programme →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}