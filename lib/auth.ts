import type { DefaultSession, NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { JWT } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'

import { prisma } from './prisma'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role: string
    }
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // --- Auto-upgrade (self-healing) vers le rôle coach si l'email correspond à COACH_EMAIL ---
        const coachEmail = process.env.COACH_EMAIL
        if (coachEmail && user.email.toLowerCase() === coachEmail.toLowerCase() && user.role !== 'coach') {
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'coach' }
          })
          user.role = updatedUser.role
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id ?? token.sub ?? ''
        session.user.role = token.role ?? 'client'
      }

      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}