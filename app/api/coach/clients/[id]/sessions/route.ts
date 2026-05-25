import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role?.toLowerCase() !== 'coach') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: clientId } = await params

    const sessions = await prisma.workoutSession.findMany({
      where: { userId: clientId },
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
    console.error('Erreur lors du chargement des séances du client:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
