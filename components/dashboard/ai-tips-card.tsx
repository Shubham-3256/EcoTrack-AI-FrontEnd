"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Sparkles, RefreshCw, Leaf } from "lucide-react"

interface Props {
  refreshTrigger: number
}

export function AiTipsCard({ refreshTrigger }: Props) {
  const [tips, setTips] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [cached, setCached] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =========================
  // FETCH TIPS
  // =========================
  const fetchTips = async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiFetch<{ tips?: string[]; cached?: boolean }>(
        "/tips",
        { signal }
      )

      setTips(Array.isArray(data.tips) ? data.tips : [])
      setCached(Boolean(data.cached))
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error(err)
        setError(err?.message || "Failed to load tips")
        setTips([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchTips(controller.signal)
    return () => controller.abort()
  }, [refreshTrigger])

  const tipIcons = ["🌱", "⚡", "♻️", "💡", "🌍"]

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold">AI Eco Tips</h2>
          {cached && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]">
              cached
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => fetchTips()}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-[var(--color-background-secondary)] flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-[var(--color-background-secondary)] rounded w-full" />
                <div className="h-3 bg-[var(--color-background-secondary)] rounded w-4/5" />
              </div>
            </div>
          ))}
          <p className="text-xs text-center text-[var(--color-text-secondary)] pt-1">
            AI is analysing your energy usage…
          </p>
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 space-y-2">
          <p>
            {error === "OPENAI_API_KEY not configured"
              ? "Add OPENAI_API_KEY to your backend environment variables to enable AI tips."
              : error}
          </p>
        </div>
      ) : tips.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6">
          No AI tips available yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex gap-3 items-start">
              <span className="text-lg flex-shrink-0 mt-0.5">
                {tipIcons[index] || <Leaf className="w-4 h-4 text-green-500" />}
              </span>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {tip}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      {!loading && !error && (
        <p className="text-[10px] text-[var(--color-text-secondary)] border-t border-[var(--color-border-tertiary)] pt-3">
          Based on your recent energy usage · refreshes daily
        </p>
      )}
    </Card>
  )
}
