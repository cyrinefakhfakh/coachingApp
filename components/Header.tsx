'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!session) return null

  const isCoach = session.user.role?.toLowerCase() === 'coach'

  const clientLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Mes Programmes', href: '/programs' },
    { name: 'Mon Profil', href: '/profile' }
  ]

  const coachLinks = [
    { name: 'Espace Coach', href: '/coach' },
    { name: 'Mes Clients', href: '/coach/clients' },
    { name: 'Exercices', href: '/coach/exercises' },
    { name: 'Programmes', href: '/coach/programs' },
    { name: 'Mon Profil', href: '/profile' }
  ]

  const links = isCoach ? coachLinks : clientLinks

  return (
    <header className="sticky top-0 z-50 bg-[#0a0e17]/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={isCoach ? '/coach' : '/dashboard'} className="flex items-center space-x-2">
              <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20">
                H
              </span>
              <span className="text-xl font-black tracking-wider text-white">
                HAMZA <span className="text-orange-500">FIT</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">Connecté en tant que</p>
              <p className="text-sm font-bold text-white max-w-[150px] truncate">
                {session.user.name || session.user.email}
              </p>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600/90 hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20 focus:outline-none"
            >
              Déconnexion
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c1220] border-b border-slate-800 px-2 pt-2 pb-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          
          <div className="border-t border-slate-800/80 pt-4 mt-4 px-4 flex items-center justify-between">
            <div className="truncate pr-4">
              <p className="text-xs text-slate-400">Compte</p>
              <p className="text-sm font-bold text-white truncate">
                {session.user.name || session.user.email}
              </p>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-50 hover:bg-red-600 transition-colors shadow-lg"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
