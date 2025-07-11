"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/auth-client"
import { useAuth } from "@/app/components/auth/AuthProvider"

interface ReportFormProps {
  targetType: "user" | "post" | "comment"
  targetId: string
  targetTitle?: string
  onClose: () => void
  onSuccess?: () => void
}

const REPORT_TYPES = [
  { value: "spam", label: "Spam ou conteúdo repetitivo" },
  { value: "harassment", label: "Assédio ou bullying" },
  { value: "inappropriate_content", label: "Conteúdo inapropriado" },
  { value: "fake_profile", label: "Perfil falso" },
  { value: "other", label: "Outro" },
]

const ReportForm: React.FC<ReportFormProps> = ({ targetType, targetId, targetTitle, onClose, onSuccess }) => {
  const [reportType, setReportType] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !reportType || !description.trim()) return

    setLoading(true)
    setError(null)

    try {
      const reportData: any = {
        reporter_id: user.id,
        report_type: reportType,
        description: description.trim(),
      }

      // Definir o campo correto baseado no tipo
      if (targetType === "user") {
        reportData.reported_user_id = targetId
      } else if (targetType === "post") {
        reportData.reported_post_id = targetId
      } else if (targetType === "comment") {
        reportData.reported_comment_id = targetId
      }

      const { error } = await supabase.from("reports").insert(reportData)

      if (error) {
        throw error
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error)
      setError("Erro ao enviar denúncia. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const getTargetTypeLabel = () => {
    switch (targetType) {
      case "user":
        return "usuário"
      case "post":
        return "post"
      case "comment":
        return "comentário"
      default:
        return "conteúdo"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Denunciar {getTargetTypeLabel()}</h2>
              {targetTitle && <p className="text-sm text-gray-500 truncate">{targetTitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da denúncia <span className="text-red-500">*</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Selecione um motivo</option>
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição detalhada <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Descreva o problema em detalhes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Forneça o máximo de detalhes possível para nos ajudar a analisar sua denúncia.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Denúncias falsas podem resultar em penalidades</li>
                    <li>Nossa equipe analisará sua denúncia em até 24 horas</li>
                    <li>Você será notificado sobre o resultado da análise</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !reportType || !description.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar Denúncia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportForm
