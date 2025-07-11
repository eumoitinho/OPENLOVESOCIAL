import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/app/components/auth/AuthProvider"
import AuthDebug from "@/app/components/debug/AuthDebug"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ConnectHub - Conecte-se com pessoas próximas",
  description: "Uma rede social segura para conectar pessoas com base em interesses compartilhados",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <AuthDebug />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
