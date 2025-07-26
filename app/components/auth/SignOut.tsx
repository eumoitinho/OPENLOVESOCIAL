"use client"

import type React from "react"
import { LogOut } from "lucide-react"
import { Button } from "@heroui/react"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SignOutProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  children?: React.ReactNode
}

const SignOut: React.FC<SignOutProps> = ({ variant = "ghost", size = "default", showIcon = true, children }) => {
  const { signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      })
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar desconectar. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children || "Sair"}
    </Button>
  )
}

export default SignOut
