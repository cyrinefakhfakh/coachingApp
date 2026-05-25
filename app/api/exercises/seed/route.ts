import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { predefinedExercises } from '@/lib/predefinedExercises'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role?.toLowerCase() !== 'coach') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    let addedCount = 0
    let skippedCount = 0

    for (const item of predefinedExercises) {
      // Vérifier si l'exercice existe déjà par son nom ou id
      const existing = await prisma.exercise.findFirst({
        where: {
          OR: [
            { id: item.id },
            { name: item.name }
          ]
        }
      })

      if (!existing) {
        await prisma.exercise.create({
          data: {
            id: item.id,
            name: item.name,
            description: item.description,
            muscleGroup: item.muscleGroup,
            equipment: item.equipment,
            instructions: item.instructions,
            imageUrl: item.imageUrl
          }
        })
        addedCount++
      } else {
        skippedCount++
      }
    }

    return NextResponse.json({
      message: 'Seed complété avec succès !',
      added: addedCount,
      skipped: skippedCount
    })
  } catch (error) {
    console.error('Erreur lors du seeding des exercices:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
