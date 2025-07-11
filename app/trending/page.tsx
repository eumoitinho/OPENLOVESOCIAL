"use client"
import { useEffect, useState } from "react"

export default function TrendingPage() {
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/trending")
        if (!res.ok) throw new Error("Erro ao buscar trending topics")
        const json = await res.json()
        setTopics(json.data || [])
      } catch (err: any) {
        setError(err.message || "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }
    fetchTopics()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500 py-8 px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Trending Topics</h1>
      {loading && <div className="text-center text-gray-400 py-8">Carregando...</div>}
      {error && <div className="text-center text-red-500 py-8">{error}</div>}
      {!loading && !error && topics.length === 0 && (
        <div className="text-center text-gray-400 py-8">Nenhum trending encontrado.</div>
      )}
      <div className="max-w-2xl mx-auto space-y-4">
        {topics.map((topic, i) => (
          <div key={topic.id || i} className="bg-white dark:bg-slate-900 rounded-xl shadow p-4 flex flex-col gap-2">
            <span className="text-lg font-bold text-pink-600">#{topic.name}</span>
            <span className="text-xs text-gray-500">{topic.count} posts</span>
            {topic.description && <span className="text-sm text-muted-foreground">{topic.description}</span>}
          </div>
        ))}
      </div>
    </div>
  )
} 