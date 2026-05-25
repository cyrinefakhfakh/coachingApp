import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'coach') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const programs = await prisma.program.findMany({
      where: { coachId: session.user.id },
      include: {
        _count: {
          select: { exercises: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(programs)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'coach') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, exercises } = body

    if (!name || !exercises || exercises.length === 0) {
      return NextResponse.json({ error: 'Name and exercises are required' }, { status: 400 })
    }

    // Créer le programme
    const program = await prisma.program.create({
      data: {
        name,
        description,
        coachId: session.user.id
      }
    })

    // Ajouter les exercices au programme
    for (const exerciseData of exercises) {
      await prisma.programExercise.create({
        data: {
          programId: program.id,
          exerciseId: exerciseData.exerciseId,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          restTime: exerciseData.restTime,
          notes: exerciseData.notes
        }
      })
    }

    return NextResponse.json(program)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}