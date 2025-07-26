"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@heroui/react"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token) {
          setStatus("error")
          setMessage("Token de confirmação não encontrado")
          return
        }

        if (type === "signup") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "signup",
          })

          if (error) {
            console.error("Error confirming email:", error)
            setStatus("error")
            setMessage("Erro ao confirmar email. Tente novamente.")
          } else {
            setStatus("success")
            setMessage("Email confirmado com sucesso!")
            toast.success("Email confirmado! Você pode fazer login agora.")
            
            // Redirecionar após 3 segundos
            setTimeout(() => {
              router.push("/auth/signin")
            }, 3000)
          }
        } else {
          setStatus("error")
          setMessage("Tipo de confirmação inválido")
        }
      } catch (error) {
        console.error("Error in confirmEmail:", error)
        setStatus("error")
        setMessage("Erro inesperado. Tente novamente.")
      }
    }

    confirmEmail()
  }, [searchParams, supabase.auth, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 p-8 shadow-lg">
          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                  <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Confirmando Email
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Aguarde enquanto confirmamos seu email...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Confirmado!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/auth/signin")}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    Fazer Login
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Redirecionando automaticamente em alguns segundos...
                  </p>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Erro na Confirmação
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/auth/signin")}
                    variant="bordered"
                    className="w-full"
                  >
                    Voltar ao Login
                  </Button>
                  <Link
                    href="/auth/signup"
                    className="block text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
                  >
                    Criar nova conta
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
} 