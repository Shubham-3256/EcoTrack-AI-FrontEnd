"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

import { TrendingUp } from "lucide-react"

interface Prediction {
  date: string
  kwh: number | null
  kwh_lower?: number | null
  kwh_upper?: number | null
}

interface Props {
  selectedCompany?: string
}

const MODEL_LABELS: Record<string, string> = {
  ensemble: "Ensemble (Prophet + XGBoost)",
  prophet: "Prophet",
  legacy: "Linear Regression",
  baseline: "Baseline",
  none: "Unavailable",
}

const MODEL_COLORS: Record<string, string> = {
  ensemble: "#22c55e",
  prophet: "#3b82f6",
  legacy: "#f59e0b",
  baseline: "#94a3b8",
}

export function AdvancedPredictions({ selectedCompany }: Props) {
  const [days, setDays] = useState(7)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [modelType, setModelType] = useState("baseline")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // =========================
  // FETCH
  // =========================
  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await apiFetch<{ predictions?: Prediction[]; model_type?: string }>(
          "/predict-trend",
          {
            method: "POST",
            body: JSON.stringify({ days, company: selectedCompany || null }),
            signal: controller.signal,
          }
        )

        setPredictions(Array.isArray(data.predictions) ? data.predictions : [])
        setModelType(data.model_type || "baseline")
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error(err)
          setError(err?.message || "Failed to load predictions")
          setPredictions([])
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [days, selectedCompany])

  // =========================
  // CHART DATA
  // =========================
  const chartData = useMemo(
    () =>
      predictions.map((p) => ({
        date: new Date(p.date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        kwh: Number(p.kwh) || 0,
        lower: Number(p.kwh_lower) || Number(p.kwh) || 0,
        upper: Number(p.kwh_upper) || Number(p.kwh) || 0,
        band: [
          Number(p.kwh_lower) || Number(p.kwh) || 0,
          Number(p.kwh_upper) || Number(p.kwh) || 0,
        ] as [number, number],
      })),
    [predictions]
  )

  const hasConfidenceBand = predictions.some(
    (p) => p.kwh_lower != null && p.kwh_upper != null && p.kwh_lower !== p.kwh
  )

  const lineColor = MODEL_COLORS[modelType] || "#94a3b8"

  // =========================
  // STATS
  // =========================
  const stats = useMemo(() => {
    const values = predictions.filter((p) => p.kwh != null).map((p) => Number(p.kwh))
    if (!values.length) return null
    return {
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
    }
  }, [predictions])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      </Card>
    )
  }

  if (error) {
    return <Card className="p-6 text-red-500">{error}</Card>
  }

  if (predictions.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center py-10">
          No prediction data available.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: lineColor }} />
            <h2 className="text-base font-semibold">Energy Forecast</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="font-medium" style={{ color: lineColor }}>
              {MODEL_LABELS[modelType] || modelType}
            </span>
            {selectedCompany ? ` · ${selectedCompany}` : " · All companies"}
          </p>
        </div>

        {/* Day selector */}
        <div className="flex gap-1.5">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? "default" : "outline"}
              onClick={() => setDays(d)}
              className="h-7 px-2.5 text-xs"
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            stroke="var(--muted-foreground)"
            style={{ fontSize: "0.75rem" }}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            style={{ fontSize: "0.75rem" }}
          />
          <Tooltip
            formatter={(value: any) => [
              `${Number(value).toFixed(2)} kWh`,
              "Prediction",
            ]}
          />
          <Legend />

          {hasConfidenceBand && (
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill={lineColor}
              fillOpacity={0.1}
            />
          )}

          <Line
            type="monotone"
            dataKey="kwh"
            stroke={lineColor}
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Min</p>
            <p className="font-semibold">{stats.min} kWh</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg</p>
            <p className="font-semibold">{stats.avg} kWh</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max</p>
            <p className="font-semibold">{stats.max} kWh</p>
          </div>
        </div>
      )}
    </Card>
  )
}
