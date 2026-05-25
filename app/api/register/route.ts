import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// The ONE authorized coach email — set COACH_EMAIL in .env.local
const COACH_EMAIL = process.env.COACH_EMAIL

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, role } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
    }

    // --- Single-coach security check ---
    // If someone tries to register as 'coach', only allow it if their email
    // matches the COACH_EMAIL environment variable.
    if (role === 'coach') {
      if (!COACH_EMAIL) {
        return NextResponse.json(
          { error: 'La création de compte coach est désactivée.' },
          { status: 403 }
        )
      }
      if (email.toLowerCase() !== COACH_EMAIL.toLowerCase()) {
        return NextResponse.json(
          { error: 'Cet email n\'est pas autorisé à créer un compte coach.' },
          { status: 403 }
        )
      }
    }

    // --- Check for existing user ---
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 400 })
    }

    // --- Password strength ---
    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Force the coach role when the email matches the single allowed coach email.
    const assignedRole =
      COACH_EMAIL && email.toLowerCase() === COACH_EMAIL.toLowerCase() ? 'coach' : 'client'

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: assignedRole,
      }
    })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}