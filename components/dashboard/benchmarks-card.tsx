"use client"

import { useEffect, useState } from "react"

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

import {
  BarChart3,
  Trophy,
} from "lucide-react"

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

export function BenchmarksCard({
  dateFrom,
  dateTo,
  refreshTrigger,
}: Props) {

  const [data, setData] =
    useState<Benchmark[]>([])

  const [total, setTotal] =
    useState(0)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [metric, setMetric] =
    useState<
      | "total_kwh"
      | "co2_kg"
      | "avg_daily_kwh"
    >("total_kwh")

  useEffect(() => {

    const fetchBenchmarks =
      async () => {

        try {

          setLoading(true)
          setError(null)

          const token =
            localStorage.getItem("token")

          if (!token) {
            throw new Error(
              "Authentication token missing"
            )
          }

          const params =
            new URLSearchParams()

          if (dateFrom) {
            params.set(
              "from",
              dateFrom
            )
          }

          if (dateTo) {
            params.set(
              "to",
              dateTo
            )
          }

          const url =
            `${process.env.NEXT_PUBLIC_API_BASE}/benchmarks?${params}`

          const res = await fetch(
            url,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

          if (!res.ok) {
            throw new Error(
              `Benchmark API failed (${res.status})`
            )
          }

          const json =
            await res.json()

          setData(
            Array.isArray(
              json.benchmarks
            )
              ? json.benchmarks
              : []
          )

          setTotal(
            Number(
              json.total_kwh
            ) || 0
          )

        } catch (err: any) {

          console.error(err)

          setError(
            err?.message ||
            "Failed to load benchmarks"
          )

          setData([])

        } finally {

          setLoading(false)
        }
      }

    fetchBenchmarks()

  }, [
    dateFrom,
    dateTo,
    refreshTrigger,
  ])

  // =========================
  // LABELS
  // =========================

  const metricLabels = {
    total_kwh:
      "Total kWh",

    co2_kg:
      "CO₂ (kg)",

    avg_daily_kwh:
      "Avg Daily kWh",
  }

  const shortLabels = {
    total_kwh:
      "Total kWh",

    co2_kg:
      "CO₂",

    avg_daily_kwh:
      "Daily Avg",
  }

  const topEmitter =
    data.length > 0
      ? data[0]
      : null

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Card className="p-6">

        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
          Loading benchmarks...
        </div>
      </Card>
    )
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <Card className="p-6 text-red-500">
        {error}
      </Card>
    )
  }

  // =========================
  // UI
  // =========================

  return (
    <Card className="p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">

        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />

          <h2 className="text-base font-semibold">
            Company Benchmarking
          </h2>
        </div>

        {/* Metric buttons */}
        <div className="flex gap-1">

          {(
            [
              "total_kwh",
              "co2_kg",
              "avg_daily_kwh",
            ] as const
          ).map((m) => (

            <button
              key={m}

              onClick={() =>
                setMetric(m)
              }

              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                metric === m
                  ? "bg-[var(--color-background-info)] text-[var(--color-text-info)] border-[var(--color-border-info)]"
                  : "border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"
              }`}
            >
              {/* FIXED BUG */}
              {shortLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {data.length === 0 ? (

        <p className="text-sm text-center text-muted-foreground py-8">
          No benchmark data available.
        </p>

      ) : (

        <>
          {/* Top emitter */}
          {topEmitter && (

            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900">

              <Trophy className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />

              <span className="text-red-600 dark:text-red-400">

                <strong>
                  {topEmitter.company}
                </strong>

                {" "}is your top emitter —{" "}

                {topEmitter.pct_of_total}%
                {" "}of total usage
              </span>
            </div>
          )}

          {/* Chart */}
          <ResponsiveContainer
            width="100%"
            height={240}
          >

            <BarChart
              data={data}
              margin={{
                top: 4,
                right: 8,
                left: -8,
                bottom: 4,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-tertiary)"
              />

              <XAxis
                dataKey="company"
                stroke="var(--color-text-secondary)"
                tick={{
                  fill:
                    "var(--color-text-secondary)",
                }}
                style={{
                  fontSize: "0.7rem",
                }}
              />

              <YAxis
                stroke="var(--color-text-secondary)"
                tick={{
                  fill:
                    "var(--color-text-secondary)",
                }}
                style={{
                  fontSize: "0.7rem",
                }}
              />

              <Tooltip
                contentStyle={{
                  background:
                    "var(--color-background-primary)",

                  border:
                    "1px solid var(--color-border-secondary)",

                  borderRadius:
                    "0.5rem",

                  fontSize:
                    "0.75rem",
                }}

                formatter={(value: any) => [

                  Number(value).toFixed(2),

                  metricLabels[metric],
                ]}
              />

              <Bar
                dataKey={metric}
                radius={[6, 6, 0, 0]}
              >

                {data.map(
                  (_, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Footer */}
          <div className="text-xs text-muted-foreground border-t pt-3">

            Total tracked usage:
            <span className="font-semibold ml-1">
              {total.toFixed(2)} kWh
            </span>
          </div>
        </>
      )}
    </Card>
  )
}