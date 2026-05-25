const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const predefinedExercises = [
  {
    id: 'squat',
    name: 'Squat',
    description: 'Mouvement complet des jambes et fessiers',
    muscleGroup: 'Jambes',
    equipment: 'Poids du corps ou barre',
    instructions: 'Debout, pieds écartés largeur d\'épaules. Descendre en pliant les genoux jusqu\'à ce que les cuisses soient parallèles au sol, puis remonter.',
    imageUrl: 'https://images.pexels.com/photos/4162489/pexels-photo-4162489.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    id: 'pushup',
    name: 'Pompes',
    description: 'Pompes classiques pour le haut du corps',
    muscleGroup: 'Poitrine',
    equipment: 'Poids du corps',
    instructions: 'En position de planche, descendre le corps en pliant les coudes, puis pousser pour remonter.',
    imageUrl: 'https://images.pexels.com/photos/4162488/pexels-photo-4162488.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    id: 'pullup',
    name: 'Traction',
    description: 'Traction à la barre fixe',
    muscleGroup: 'Dos',
    equipment: 'Barre de traction',
    instructions: 'S\'accrocher à la barre, tirer le corps vers le haut jusqu\'à ce que le menton dépasse la barre.',
    imageUrl: 'https://images.pexels.com/photos/4164769/pexels-photo-4164769.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    id: 'deadlift',
    name: 'Soulevé de terre',
    description: 'Soulevé de terre pour le dos et les jambes',
    muscleGroup: 'Dos',
    equipment: 'Barre et poids',
    instructions: 'Debout derrière la barre, s\'accroupir pour saisir la barre, puis se relever en gardant le dos droit.',
    imageUrl: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    id: 'benchpress',
    name: 'Développé couché',
    description: 'Développé couché pour la poitrine',
    muscleGroup: 'Poitrine',
    equipment: 'Barre et banc',
    instructions: 'Allongé sur le banc, saisir la barre et la descendre jusqu\'à la poitrine, puis la pousser vers le haut.',
    imageUrl: 'https://images.pexels.com/photos/4162490/pexels-photo-4162490.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    id: 'plank',
    name: 'Planche',
    description: 'Planche pour le core',
    muscleGroup: 'Abdominaux',
    equipment: 'Poids du corps',
    instructions: 'En appui sur les avant-bras et les orteils, maintenir le corps en ligne droite.',
    imageUrl: 'https://images.pexels.com/photos/4162486/pexels-photo-4162486.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    id: 'burpee',
    name: 'Burpee',
    description: 'Burpee complet pour cardio et force',
    muscleGroup: 'Corps entier',
    equipment: 'Poids du corps',
    instructions: 'Debout, s\'accroupir et poser les mains au sol, sauter les pieds en arrière en planche, faire une pompe, puis sauter les pieds vers l\'avant et sauter.',
    imageUrl: 'https://images.pexels.com/photos/4162485/pexels-photo-4162485.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    id: 'lunges',
    name: 'Fentes',
    description: 'Fentes pour les jambes',
    muscleGroup: 'Jambes',
    equipment: 'Poids du corps ou haltères',
    instructions: 'Avancer une jambe, descendre jusqu\'à ce que les deux genoux forment un angle de 90°, puis pousser pour remonter.',
    imageUrl: 'https://images.pexels.com/photos/4162484/pexels-photo-4162484.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    id: 'shoulderpress',
    name: 'Développé épaules',
    description: 'Développé épaules',
    muscleGroup: 'Épaules',
    equipment: 'Haltères ou barre',
    instructions: 'Debout ou assis, saisir les haltères à hauteur d\'épaules et les pousser vers le haut au-dessus de la tête.',
    imageUrl: 'https://images.pexels.com/photos/4162483/pexels-photo-4162483.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  }
]

async function main() {
  console.log('Début du seeding des exercices...')
  let added = 0
  let skipped = 0

  for (const item of predefinedExercises) {
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
      added++
    } else {
      skipped++
    }
  }

  console.log(`Seeding terminé. Ajoutés: ${added}, Sautés: ${skipped}`)
}

main()
  .catch((e) => {
    console.error('Erreur de seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
