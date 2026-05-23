"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCw, Leaf } from "lucide-react"

export function AiTipsCard({ refreshTrigger }: { refreshTrigger: number }) {
  const [tips, setTips]         = useState<string[]>([])
  const [loading, setLoading]   = useState(true)
  const [cached, setCached]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const fetchTips = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/tips`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to load tips")
      }
      const data = await res.json()
      setTips(data.tips || [])
      setCached(data.cached ?? false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTips() }, [refreshTrigger])

  const tipIcons = ["🌱", "⚡", "♻️"]

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold">AI eco tips</h2>
          {cached && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]">
              cached
            </span>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={fetchTips} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-[var(--color-background-secondary)] flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-[var(--color-background-secondary)] rounded w-full" />
                <div className="h-3 bg-[var(--color-background-secondary)] rounded w-4/5" />
              </div>
            </div>
          ))}
          <p className="text-xs text-center text-[var(--color-text-secondary)] pt-1">
            Claude is analysing your usage…
          </p>
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 space-y-2">
          <p>{error === "ANTHROPIC_API_KEY not configured"
            ? "Add ANTHROPIC_API_KEY to your backend environment variables to enable AI tips."
            : `Error: ${error}`}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-lg flex-shrink-0 mt-0.5">{tipIcons[i] ?? <Leaf />}</span>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{tip}</p>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && (
        <p className="text-[10px] text-[var(--color-text-secondary)] border-t border-[var(--color-border-tertiary)] pt-3">
          Based on your last 30 days of energy data · refreshes daily
        </p>
      )}
    </Card>
  )
}
