"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { BarChart3, Trophy } from "lucide-react"

interface Benchmark {
  company: string
  total_kwh: number
  co2_kg: number
  avg_daily_kwh: number
  pct_of_total: number
  days: number
}

const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899"]

export function BenchmarksCard({
  dateFrom, dateTo, refreshTrigger,
}: {
  dateFrom: string | null
  dateTo: string | null
  refreshTrigger: number
}) {
  const [data, setData]       = useState<Benchmark[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [metric, setMetric]   = useState<"total_kwh" | "co2_kg" | "avg_daily_kwh">("total_kwh")

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true)
      try {
        const token  = localStorage.getItem("token")
        const params = new URLSearchParams()
        if (dateFrom) params.set("from", dateFrom)
        if (dateTo)   params.set("to",   dateTo)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/benchmarks?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const json = await res.json()
        setData(json.benchmarks || [])
        setTotal(json.total_kwh || 0)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetch_()
  }, [dateFrom, dateTo, refreshTrigger])

  const metricLabel = {
    total_kwh:    "Total kWh",
    co2_kg:       "CO₂ (kg)",
    avg_daily_kwh:"Avg daily kWh",
  }[metric]

  const topEmitter = data[0]

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-semibold">Company benchmarking</h2>
        </div>
        <div className="flex gap-1">
          {(["total_kwh","co2_kg","avg_daily_kwh"] as const).map(m => (
            <button key={m}
              onClick={() => setMetric(m)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                metric === m
                  ? "bg-[var(--color-background-info)] text-[var(--color-text-info)] border-[var(--color-border-info)]"
                  : "border-[var(--color-border-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"
              }`}>
              {metricLabel === metricLabel && {
                total_kwh:"Total kWh", co2_kg:"CO₂", avg_daily_kwh:"Daily avg"
              }[m]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-52 flex items-center justify-center text-sm text-[var(--color-text-secondary)]">Loading…</div>
      ) : data.length === 0 ? (
        <p className="text-sm text-center text-[var(--color-text-secondary)] py-8">
          No data yet — add energy records to see benchmarks.
        </p>
      ) : (
        <>
          {topEmitter && (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900">
              <Trophy className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-red-600 dark:text-red-400">
                <strong>{topEmitter.company}</strong> is your top emitter —{" "}
                {topEmitter.pct_of_total}% of total usage
              </span>
            </div>
          )}

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
              <XAxis dataKey="company" style={{ fontSize: "0.7rem" }}
                stroke="var(--color-text-secondary)" tick={{ fill: "var(--color-text-secondary)" }} />
              <YAxis style={{ fontSize: "0.7rem" }}
                stroke="var(--color-text-secondary)" tick={{ fill: "var(--color-text-secondary)" }} />
              <Tooltip
                contentStyle={{ background:"var(--color-background-primary)", border:"1px solid var(--color-border-secondary)", borderRadius:"0.5rem", fontSize:"0.75rem" }}
                formatter={(v: any) => [`${Number(v).toFixed(2)}`, metricLabel]}
              />
              <Bar dataKey={metric} radius={[4,4,0,0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#ef4444" : COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border-tertiary)]">
                  {["Company","Total kWh","CO₂ kg","Daily avg","Share"].map(h => (
                    <th key={h} className="text-left py-1.5 pr-3 font-medium text-[var(--color-text-secondary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.company} className="border-b border-[var(--color-border-tertiary)] last:border-0">
                    <td className="py-1.5 pr-3 font-medium" style={{ color: i === 0 ? "#ef4444" : undefined }}>
                      {i === 0 && "🔴 "}{row.company}
                    </td>
                    <td className="py-1.5 pr-3">{row.total_kwh.toFixed(1)}</td>
                    <td className="py-1.5 pr-3">{row.co2_kg.toFixed(1)}</td>
                    <td className="py-1.5 pr-3">{row.avg_daily_kwh.toFixed(1)}</td>
                    <td className="py-1.5">{row.pct_of_total}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  )
}
