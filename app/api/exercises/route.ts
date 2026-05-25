import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(exercises)
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
    const { name, description, muscleGroup, equipment, instructions, imageUrl } = body

    if (!name || !muscleGroup) {
      return NextResponse.json({ error: 'Name and muscle group are required' }, { status: 400 })
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        description,
        muscleGroup,
        equipment,
        instructions,
        imageUrl
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}