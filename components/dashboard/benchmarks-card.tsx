"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

import { Card } from "@/components/ui/card"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

import { BarChart3, Trophy } from "lucide-react"

interface Benchmark {
  company: string
  total_kwh: number
  co2_kg: number
  avg_daily_kwh: number
  pct_of_total: number
  days: number
}

interface Props {
  dateFrom: string | null
  dateTo: string | null
  refreshTrigger: number
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
]

export function BenchmarksCard({ dateFrom, dateTo, refreshTrigger }: Props) {
  const [data, setData] = useState<Benchmark[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metric, setMetric] = useState<"total_kwh" | "co2_kg" | "avg_daily_kwh">(
    "total_kwh"
  )

  useEffect(() => {
    const controller = new AbortController()

    const fetchBenchmarks = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (dateFrom) params.set("from", dateFrom)
        if (dateTo) params.set("to", dateTo)

        const json = await apiFetch<{ benchmarks?: any[]; total_kwh?: number }>(
          `/benchmarks?${params}`,
          { signal: controller.signal }
        )

        // =========================
        // SAFE NORMALIZATION
        // =========================
        const normalized = Array.isArray(json?.benchmarks)
          ? json.benchmarks.map((item: any) => ({
              company: String(item?.company || item?.name || "Unknown"),
              total_kwh: Number(item?.total_kwh || 0),
              co2_kg: Number(item?.co2_kg || item?.total_co2_kg || 0),
              avg_daily_kwh: Number(item?.avg_daily_kwh || 0),
              pct_of_total: Number(item?.pct_of_total || 0),
              days: Number(item?.days || 0),
            }))
          : []

        setData(normalized)
        setTotal(Number(json?.total_kwh || 0))
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error(err)
          setError(err?.message || "Failed to load benchmarks")
          setData([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBenchmarks()
    return () => controller.abort()
  }, [dateFrom, dateTo, refreshTrigger])

  const metricLabels = {
    total_kwh: "Total kWh",
    co2_kg: "CO₂ (kg)",
    avg_daily_kwh: "Avg Daily kWh",
  }

  const shortLabels = {
    total_kwh: "Total kWh",
    co2_kg: "CO₂",
    avg_daily_kwh: "Daily Avg",
  }

  const topEmitter = data.length > 0 ? data[0] : null

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
          Loading benchmarks...
        </div>
      </Card>
    )
  }

  if (error) {
    return <Card className="p-6 text-red-500">{error}</Card>
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-semibold">Company Benchmarking</h2>
        </div>

        <div className="flex gap-1">
          {(["total_kwh", "co2_kg", "avg_daily_kwh"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                metric === m
                  ? "bg-[var(--color-background-info)] text-[var(--color-text-info)] border-[var(--color-border-info)]"
                  : "border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"
              }`}
            >
              {shortLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-center text-muted-foreground py-8">
          No benchmark data available.
        </p>
      ) : (
        <>
          {topEmitter && (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900">
              <Trophy className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-red-600 dark:text-red-400">
                <strong>{String(topEmitter.company)}</strong> is your top emitter —{" "}
                {Number(topEmitter.pct_of_total).toFixed(1)}% of total usage
              </span>
            </div>
          )}

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-tertiary)"
              />
              <XAxis dataKey="company" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [
                  Number(value).toFixed(2),
                  metricLabels[metric],
                ]}
              />
              <Bar dataKey={metric} radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="text-xs text-muted-foreground border-t pt-3">
            Total tracked usage:
            <span className="font-semibold ml-1">{Number(total).toFixed(2)} kWh</span>
          </div>
        </>
      )}
    </Card>
  )
}
