import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'coach') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { programId, userId } = body

    if (!programId || !userId) {
      return NextResponse.json({ error: 'Program ID and User ID are required' }, { status: 400 })
    }

    // Vérifier que le programme appartient au coach
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { coachId: true }
    })

    if (!program || program.coachId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est un client
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'client') {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
    }

    // Vérifier si le programme est déjà assigné à cet utilisateur
    const existingAssignment = await prisma.userProgram.findUnique({
      where: {
        userId_programId: {
          userId,
          programId
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json({ error: 'Program already assigned to this user' }, { status: 400 })
    }

    // Assigner le programme
    const userProgram = await prisma.userProgram.create({
      data: {
        userId,
        programId
      }
    })

    return NextResponse.json(userProgram)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}