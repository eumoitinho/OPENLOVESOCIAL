"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Menu, X, User } from "lucide-react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import SignOut from "@/app/components/auth/SignOut"

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, loading } = useAuth()

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition-colors">
            Openlove
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/explore" className="hover:text-blue-200 transition-colors">
              Explorar
            </Link>
            <Link href="/communities" className="hover:text-blue-200 transition-colors">
              Comunidades
            </Link>
            <Link href="/events" className="hover:text-blue-200 transition-colors">
              Eventos
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex space-x-4 items-center">
            {loading ? (
              <div className="animate-pulse">Carregando...</div>
            ) : user ? (
              <>
                <Link href="/dashboard" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span>{profile?.username || "Perfil"}</span>
                </Link>
                <SignOut className="bg-blue-700 hover:bg-blue-800 text-white border-blue-700" />
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-secondary">
                  Entrar
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-2">
              <Link href="/explore" className="py-2 hover:text-blue-200 transition-colors">
                Explorar
              </Link>
              <Link href="/communities" className="py-2 hover:text-blue-200 transition-colors">
                Comunidades
              </Link>
              <Link href="/events" className="py-2 hover:text-blue-200 transition-colors">
                Eventos
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                {loading ? (
                  <div className="animate-pulse">Carregando...</div>
                ) : user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 py-2 hover:text-blue-200 transition-colors"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url || "/placeholder.svg"}
                          alt={profile.full_name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                      <span>{profile?.username || "Perfil"}</span>
                    </Link>
                    <SignOut className="bg-blue-700 hover:bg-blue-800 text-white border-blue-700 text-center" />
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="btn-secondary text-center">
                      Entrar
                    </Link>
                    <Link href="/auth/signup" className="btn-primary text-center">
                      Cadastrar
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
