import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { userId } = await params

    // Vérifier que l'utilisateur ne peut voir que ses propres programmes
    // ou que le coach peut voir les programmes de ses clients
    const isCoach = session.user.role?.toLowerCase() === 'coach'
    if (session.user.id !== userId && !isCoach) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Si c'est un coach, vérifier qu'il est bien le coach des programmes assignés à cet utilisateur
    if (isCoach && session.user.id !== userId) {

      // Vérifier que tous les programmes assignés à cet utilisateur appartiennent au coach
      const userProgramsCheck = await prisma.userProgram.findMany({
        where: { userId },
        include: {
          program: {
            select: { coachId: true }
          }
        }
      })

      const hasUnauthorizedPrograms = userProgramsCheck.some(
        userProgram => userProgram.program.coachId !== session.user.id
      )

      if (hasUnauthorizedPrograms) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
    }

    const userPrograms = await prisma.userProgram.findMany({
      where: { userId },
      include: {
        program: {
          include: {
            coach: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            exercises: {
              include: {
                exercise: true
              },
              orderBy: {
                id: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    // Transformer les données pour le frontend
    const programs = userPrograms.map(userProgram => ({
      id: userProgram.program.id,
      name: userProgram.program.name,
      description: userProgram.program.description,
      assignedAt: userProgram.assignedAt.toISOString(),
      coach: userProgram.program.coach,
      exercises: userProgram.program.exercises.map(pe => ({
        id: pe.id,
        sets: pe.sets,
        reps: pe.reps,
        restTime: pe.restTime,
        notes: pe.notes,
        exercise: pe.exercise
      }))
    }))

    return NextResponse.json(programs)
  } catch (error) {
    console.error('Erreur lors de la récupération des programmes:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}