import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            exercise: true
          }
        },
        coach: {
          select: { name: true, email: true }
        }
      }
    })

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    return NextResponse.json(program)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'coach') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, exercises } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Vérifier que le programme appartient au coach
    const existingProgram = await prisma.program.findUnique({
      where: { id },
      select: { coachId: true }
    })

    if (!existingProgram || existingProgram.coachId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mettre à jour le programme
    const program = await prisma.program.update({
      where: { id },
      data: {
        name,
        description
      }
    })

    // Supprimer les anciens exercices
    await prisma.programExercise.deleteMany({
      where: { programId: id }
    })

    // Ajouter les nouveaux exercices
    if (exercises && exercises.length > 0) {
      for (const exerciseData of exercises) {
        await prisma.programExercise.create({
          data: {
            programId: id,
            exerciseId: exerciseData.exerciseId,
            sets: exerciseData.sets,
            reps: exerciseData.reps,
            restTime: exerciseData.restTime,
            notes: exerciseData.notes
          }
        })
      }
    }

    return NextResponse.json(program)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'coach') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que le programme appartient au coach
    const existingProgram = await prisma.program.findUnique({
      where: { id },
      select: { coachId: true }
    })

    if (!existingProgram || existingProgram.coachId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.program.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}