import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  try {
    const session = await getServerSession(authOptions)
    const isCoach = session?.user?.role?.toLowerCase() === 'coach'
    if (!session || (session.user.id !== userId && !isCoach)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }


    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        weight: true,
        height: true,
        age: true,
        goal: true,
        experience: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, gender, weight, height, age, goal, experience } = body

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        gender,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age) : null,
        goal,
        experience
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        weight: true,
        height: true,
        age: true,
        goal: true,
        experience: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}