import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/app/components/auth/AuthProvider"
import AuthDebug from "@/app/components/debug/AuthDebug"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OpenLove",
  description: "Rede social OpenLove",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg" },
  manifest: "/manifest.json" }

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false }

export default function RootLayout({
  children }: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <AuthDebug />
          <Analytics />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
