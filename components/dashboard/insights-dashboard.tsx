"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { AlertCircle, TrendingUp, BarChart3, Leaf, Factory } from "lucide-react"

interface CompanyStats {
  company: string
  totalKwh: number
  avgDaily: number
  emissions: number
}

export function InsightsDashboard({
  selectedCompany,
  dateFrom,
  dateTo,
}: {
  selectedCompany?: string | null
  dateFrom?: string | null
  dateTo?: string | null
  refreshTrigger?: number
}) {
  const [insights, setInsights] = useState<CompanyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<string[]>([])

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem("token")
        const url = new URL("http://localhost:5000/history")
        if (selectedCompany) url.searchParams.append("company", selectedCompany)
        if (dateFrom) url.searchParams.append("from", dateFrom)
        if (dateTo) url.searchParams.append("to", dateTo)

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()

        // Group by company
        const grouped: Record<string, any[]> = {}
        data.forEach((item: any) => {
          if (!grouped[item.company]) grouped[item.company] = []
          grouped[item.company].push(item)
        })

        const stats: CompanyStats[] = Object.entries(grouped).map(
          ([company, items]: [string, any[]]) => {
            const totalKwh = items.reduce((sum, i) => sum + i.kwh, 0)
            return {
              company,
              totalKwh: Number(totalKwh.toFixed(2)),
              avgDaily: Number((totalKwh / items.length).toFixed(2)),
              emissions: Number((totalKwh * 0.42).toFixed(2)),
            }
          }
        )

        setInsights(stats)

        // Generate recommendations
        const recs: string[] = []
        if (stats.length > 0) {
          const maxUsage = Math.max(...stats.map((s) => s.avgDaily))
          const minUsage = Math.min(...stats.map((s) => s.avgDaily))

          if (maxUsage > minUsage * 1.5) {
            const cheapest = stats.find((s) => s.avgDaily === minUsage)
            if (cheapest) {
              recs.push(
                `Consider shifting more load to ${cheapest.company} — it has the lowest average daily usage.`
              )
            }
          }

          const totalEmissions = stats.reduce(
            (sum, s) => sum + s.emissions,
            0
          )
          if (totalEmissions > 100) {
            recs.push(
              "Your carbon footprint is significant. Explore renewable energy contracts or efficiency upgrades."
            )
          }

          if (data.length > 0) {
            const dates = data.map((d: any) => new Date(d.date).getTime())
            const daysSpan =
              (Math.max(...dates) - Math.min(...dates)) /
              (1000 * 60 * 60 * 24)
            if (daysSpan > 0) {
              const avgDaily =
                data.reduce((sum: number, d: any) => sum + d.kwh, 0) /
                daysSpan
              recs.push(
                `Your average daily consumption over this period is ${avgDaily.toFixed(
                  2
                )} kWh.`
              )
            }
          }
        }
        setRecommendations(recs)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [selectedCompany, dateFrom, dateTo])

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Insights & recommendations
        </h2>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Loading insights...
        </div>
      </Card>
    )
  }

  const totalKwh = insights.reduce((sum, s) => sum + s.totalKwh, 0)
  const totalEmissions = insights.reduce((sum, s) => sum + s.emissions, 0)

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Factory className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Companies</p>
            <p className="text-lg font-semibold">{insights.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total usage</p>
            <p className="text-lg font-semibold">
              {totalKwh.toFixed(1)} kWh
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estimated CO₂</p>
            <p className="text-lg font-semibold">
              {totalEmissions.toFixed(1)} kg
            </p>
          </div>
        </Card>
      </div>

      {/* Company comparison */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Company comparison
        </h2>
        {insights.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={insights}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="company"
                stroke="var(--muted-foreground)"
                style={{ fontSize: "0.875rem" }}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                style={{ fontSize: "0.875rem" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: any) => [
                  `${Number(value).toFixed(2)} kWh`,
                  "Avg daily",
                ]}
              />
              <Legend />
              <Bar
                dataKey="avgDaily"
                fill="var(--primary)"
                name="Avg daily (kWh)"
              />
            </ReBarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-sm">
            No data to display for the selected filters.
          </p>
        )}
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Recommendations
        </h2>
        <div className="space-y-2">
          {recommendations.length > 0 ? (
            recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex gap-2 p-3 bg-secondary/30 rounded-lg"
              >
                <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">{rec}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No recommendations at this time — add more data or extend the
              date range.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
