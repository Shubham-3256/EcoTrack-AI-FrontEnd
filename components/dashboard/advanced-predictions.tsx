"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Button } from "@/components/ui/button"

interface Prediction {
  date: string
  kwh: number | null
}

interface PredictionData {
  predictions: Prediction[]
  model_type: string
}

export function AdvancedPredictions({ selectedCompany }: { selectedCompany?: string }) {
  const [days, setDays] = useState(7)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [modelType, setModelType] = useState("baseline")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Missing auth token")

        const res = await fetch("/api/predict-trend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            days,
            company: selectedCompany || null,
          }),
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`)
        }

        const data: PredictionData = await res.json()
        setPredictions(data.predictions || [])
        setModelType(data.model_type || "baseline")

        console.log("[AdvancedPredictions] response:", data)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Failed to load predictions")
        setPredictions([])
        setModelType("none")
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [days, selectedCompany])

  const chartData = useMemo(
    () =>
      predictions.map((p) => ({
        date: new Date(p.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        kwh: p.kwh ?? 0,
      })),
    [predictions]
  )

  const stats = useMemo(() => {
    if (!predictions.length) return null

    const valid = predictions.filter((p) => p.kwh != null)
    if (!valid.length) return null

    const values = valid.map((p) => p.kwh as number)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length

    return {
      count: predictions.length,
      firstDate: predictions[0].date,
      lastDate: predictions[predictions.length - 1].date,
      min,
      max,
      avg,
    }
  }, [predictions])

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Advanced predictions</h2>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Loading predictions...
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 space-y-2">
        <h2 className="text-lg font-semibold">Advanced predictions</h2>
        <p className="text-sm text-destructive">Error: {error}</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Header + controls */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-lg font-semibold">Advanced predictions</h2>
          <p className="text-sm text-muted-foreground">
            Model: <span className="font-medium">{modelType}</span>
            {selectedCompany ? ` · Company: ${selectedCompany}` : " · All companies"}
          </p>
          <p className="text-xs text-muted-foreground">
            Forecast horizon: {days} days ahead
          </p>
        </div>

        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              onClick={() => setDays(d)}
              variant={days === d ? "default" : "outline"}
              size="sm"
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            stroke="var(--muted-foreground)"
            style={{ fontSize: "0.8rem" }}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            style={{ fontSize: "0.8rem" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
            }}
            formatter={(value: any) => [
              `${Number(value).toFixed(2)} kWh`,
              "Predicted usage",
            ]}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
          <Line
            type="monotone"
            name="Predicted kWh"
            dataKey="kwh"
            stroke="var(--primary)"
            dot={{ fill: "var(--primary)", r: 4 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary section */}
      {stats && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Points: {stats.count}</div>
          <div>
            Range:{" "}
            {new Date(stats.firstDate).toLocaleDateString()} →{" "}
            {new Date(stats.lastDate).toLocaleDateString()}
          </div>
          <div>
            kWh · min: {stats.min.toFixed(2)} · max:{" "}
            {stats.max.toFixed(2)} · avg: {stats.avg.toFixed(2)}
          </div>
        </div>
      )}
    </Card>
  )
}
