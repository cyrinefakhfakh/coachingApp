import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, programId, duration, notes, loggedExercises } = body

    if (!userId || !programId || duration === undefined || !loggedExercises) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Sécurité: Un client ne peut logguer que ses propres séances
    if (session.user.id !== userId && session.user.role?.toLowerCase() !== 'coach') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
    }

    // Démarrer une transaction Prisma pour tout insérer de façon atomique
    const workoutSession = await prisma.$transaction(async (tx) => {
      // 1. Créer la session principale
      const sessionRecord = await tx.workoutSession.create({
        data: {
          userId,
          programId,
          duration: parseInt(duration) || 0,
          notes: notes || '',
          startedAt: new Date(Date.now() - (duration * 60 * 1000)), // Estimer le début
          completedAt: new Date()
        }
      })

      // 2. Insérer les exercices
      for (const leg of loggedExercises) {
        const loggedExercise = await tx.loggedExercise.create({
          data: {
            workoutSessionId: sessionRecord.id,
            exerciseId: leg.exerciseId
          }
        })

        // 3. Insérer les séries de cet exercice
        if (leg.loggedSets && leg.loggedSets.length > 0) {
          await tx.loggedSet.createMany({
            data: leg.loggedSets.map((set: any) => ({
              loggedExerciseId: loggedExercise.id,
              setIndex: parseInt(set.setIndex),
              weight: parseFloat(set.weight) || 0,
              reps: parseInt(set.reps) || 0,
              completed: set.completed ?? true
            }))
          })
        }
      }

      return sessionRecord
    })

    return NextResponse.json({
      success: true,
      message: 'Séance enregistrée avec succès !',
      session: workoutSession
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la séance:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // Sécurité: Un client ne peut voir que son propre historique
    if (session.user.id !== userId && session.user.role?.toLowerCase() !== 'coach') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
    }

    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: {
        program: {
          select: { name: true }
        },
        loggedExercises: {
          include: {
            exercise: true,
            loggedSets: {
              orderBy: { setIndex: 'asc' }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Erreur lors de la récupération des séances:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
