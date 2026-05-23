"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { TrendingUp } from "lucide-react"

interface Prediction {
  date: string
  kwh: number | null
  kwh_lower?: number | null
  kwh_upper?: number | null
}

const MODEL_LABELS: Record<string, string> = {
  ensemble: "Ensemble (Prophet + XGBoost)",
  prophet:  "Prophet",
  legacy:   "Linear regression",
  baseline: "Baseline",
  none:     "Unavailable",
}

const MODEL_COLORS: Record<string, string> = {
  ensemble: "#22c55e",
  prophet:  "#3b82f6",
  legacy:   "#f59e0b",
  baseline: "#94a3b8",
}

export function AdvancedPredictions({ selectedCompany }: { selectedCompany?: string }) {
  const [days, setDays]             = useState(7)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [modelType, setModelType]   = useState("baseline")
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Missing auth token")
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/predict-trend`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ days, company: selectedCompany || null }),
          }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setPredictions(data.predictions || [])
        setModelType(data.model_type || "baseline")
      } catch (e: any) {
        setError(e.message)
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [days, selectedCompany])

  const chartData = useMemo(() =>
    predictions.map(p => ({
      date: new Date(p.date + "T00:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric" }),
      kwh:   p.kwh       ?? 0,
      lower: p.kwh_lower ?? p.kwh ?? 0,
      upper: p.kwh_upper ?? p.kwh ?? 0,
      band:  [p.kwh_lower ?? p.kwh ?? 0, p.kwh_upper ?? p.kwh ?? 0] as [number, number],
    })),
    [predictions]
  )

  const hasConfidenceBand = predictions.some(
    p => p.kwh_lower !== null && p.kwh_upper !== null && p.kwh_lower !== p.kwh
  )

  const lineColor = MODEL_COLORS[modelType] ?? "#94a3b8"
  const stats = useMemo(() => {
    const vals = predictions.filter(p => p.kwh != null).map(p => p.kwh as number)
    if (!vals.length) return null
    return {
      min: Math.min(...vals).toFixed(2),
      max: Math.max(...vals).toFixed(2),
      avg: (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2),
    }
  }, [predictions])

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: lineColor }} />
            <h2 className="text-base font-semibold">Energy forecast</h2>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            <span className="font-medium" style={{ color: lineColor }}>
              {MODEL_LABELS[modelType] ?? modelType}
            </span>
            {selectedCompany ? ` · ${selectedCompany}` : " · All companies"}
          </p>
        </div>
        <div className="flex gap-1.5">
          {[7, 14, 30].map(d => (
            <Button key={d} size="sm" variant={days === d ? "default" : "outline"}
              onClick={() => setDays(d)} className="h-7 px-2.5 text-xs">
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">Error: {error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top:4, right:4, left:-8, bottom:4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
            <XAxis dataKey="date" style={{ fontSize:"0.72rem" }}
              tick={{ fill:"var(--color-text-secondary)" }} />
            <YAxis style={{ fontSize:"0.72rem" }}
              tick={{ fill:"var(--color-text-secondary)" }} />
            <Tooltip
              contentStyle={{ background:"var(--color-background-primary)", border:"1px solid var(--color-border-secondary)", borderRadius:"0.5rem", fontSize:"0.75rem" }}
              formatter={(val: any, name: string) => {
                if (name === "Confidence band") return null
                return [`${Number(val).toFixed(2)} kWh`, name]
              }}
            />
            <Legend wrapperStyle={{ fontSize:"0.72rem" }} />
            {hasConfidenceBand && (
              <Area
                type="monotone"
                dataKey="band"
                name="Confidence band"
                fill={lineColor}
                fillOpacity={0.12}
                stroke="none"
              />
            )}
            <Line
              type="monotone"
              dataKey="kwh"
              name="Predicted kWh"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={{ fill: lineColor, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-3 pt-1">
          {[["Min",stats.min],["Avg",stats.avg],["Max",stats.max]].map(([l,v]) => (
            <div key={l} className="text-center p-2 rounded-lg bg-[var(--color-background-secondary)]">
              <p className="text-[10px] text-[var(--color-text-secondary)]">{l}</p>
              <p className="text-sm font-semibold">{v} kWh</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
