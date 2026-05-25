import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'coach') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Pour l'instant, récupérer tous les clients (dans une vraie app, on filtrerait par coach)
    // TODO: Ajouter une relation coach-clients
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        weight: true,
        height: true,
        age: true,
        goal: true,
        experience: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}