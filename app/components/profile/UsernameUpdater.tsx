"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { toast } from "sonner"

export default function UsernameUpdater() {
  const { user, profile, refreshProfile } = useAuth()
  const [newUsername, setNewUsername] = useState(profile?.username || "")
  const [loading, setLoading] = useState(false)

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error("Username não pode estar vazio")
      return
    }

    if (newUsername === profile?.username) {
      toast.info("Username já é o atual")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/profile/update-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: newUsername }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar username")
      }

      toast.success("Username atualizado com sucesso!")
      await refreshProfile()
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar username")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div>
        <h3 className="text-lg font-semibold mb-2">Atualizar Username</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Seu username atual: @{profile?.username}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Novo Username</Label>
        <Input
          id="username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="seu_novo_username"
          className="max-w-xs"
        />
        <p className="text-xs text-gray-500">
          Escolha um username único para seu perfil
        </p>
      </div>

      <Button
        onClick={handleUpdateUsername}
        disabled={loading || !newUsername.trim() || newUsername === profile?.username}
        className="bg-pink-500 hover:bg-pink-600 text-white"
      >
        {loading ? "Atualizando..." : "Atualizar Username"}
      </Button>
    </div>
  )
} 