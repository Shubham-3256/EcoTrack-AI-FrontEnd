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

import {
  AlertCircle,
  TrendingUp,
  BarChart3,
  Leaf,
  Factory,
} from "lucide-react"

interface CompanyStats {
  company: string
  totalKwh: number
  avgDaily: number
  emissions: number
}

interface Props {
  selectedCompany?: string | null
  dateFrom?: string | null
  dateTo?: string | null
  refreshTrigger?: number
}

export function InsightsDashboard({
  selectedCompany,
  dateFrom,
  dateTo,
}: Props) {

  const [insights, setInsights] = useState<CompanyStats[]>([])

  const [loading, setLoading] = useState(true)

  const [recommendations, setRecommendations] =
    useState<string[]>([])

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {

    const fetchInsights = async () => {

      try {

        setLoading(true)
        setError(null)

        const token = localStorage.getItem("token")

        if (!token) {
          throw new Error("Authentication token missing")
        }

        // =========================
        // QUERY PARAMS
        // =========================

        const params = new URLSearchParams()

        if (selectedCompany) {
          params.append("company", selectedCompany)
        }

        if (dateFrom) {
          params.append("from", dateFrom)
        }

        if (dateTo) {
          params.append("to", dateTo)
        }

        const qs = params.toString()

        // FIXED API URL
        const url =
          `${process.env.NEXT_PUBLIC_API_BASE}/history${
            qs ? `?${qs}` : ""
          }`

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(
            `Failed to fetch insights (${res.status})`
          )
        }

        const data = await res.json()

        if (!Array.isArray(data)) {
          throw new Error("Invalid API response")
        }

        // =========================
        // GROUP BY COMPANY
        // =========================

        const grouped: Record<string, any[]> = {}

        data.forEach((item: any) => {

          const company =
            item.company || "Unknown"

          if (!grouped[company]) {
            grouped[company] = []
          }

          grouped[company].push(item)
        })

        // =========================
        // BUILD STATS
        // =========================

        const stats: CompanyStats[] =
          Object.entries(grouped).map(
            ([company, items]) => {

              const totalKwh =
                items.reduce(
                  (sum, i) => sum + Number(i.kwh || 0),
                  0
                )

              return {
                company,

                totalKwh: Number(
                  totalKwh.toFixed(2)
                ),

                avgDaily: Number(
                  (
                    totalKwh /
                    (items.length || 1)
                  ).toFixed(2)
                ),

                emissions: Number(
                  (totalKwh * 0.42).toFixed(2)
                ),
              }
            }
          )

        setInsights(stats)

        // =========================
        // RECOMMENDATIONS
        // =========================

        const recs: string[] = []

        if (stats.length > 0) {

          const avgValues =
            stats.map((s) => s.avgDaily)

          const maxUsage =
            Math.max(...avgValues)

          const minUsage =
            Math.min(...avgValues)

          // Large usage imbalance
          if (maxUsage > minUsage * 1.5) {

            const lowestUsageCompany =
              stats.find(
                (s) => s.avgDaily === minUsage
              )

            if (lowestUsageCompany) {

              recs.push(
                `Consider shifting more load to ${lowestUsageCompany.company} — it has the lowest average daily usage.`
              )
            }
          }

          // High emissions
          const totalEmissions =
            stats.reduce(
              (sum, s) => sum + s.emissions,
              0
            )

          if (totalEmissions > 100) {

            recs.push(
              "Your carbon footprint is high. Consider renewable energy contracts or efficiency upgrades."
            )
          }

          // Daily average over time range
          if (data.length > 1) {

            const timestamps =
              data.map((d: any) =>
                new Date(d.date).getTime()
              )

            const minDate =
              Math.min(...timestamps)

            const maxDate =
              Math.max(...timestamps)

            const daysSpan =
              (maxDate - minDate) /
              (1000 * 60 * 60 * 24)

            if (daysSpan > 0) {

              const totalUsage =
                data.reduce(
                  (sum: number, d: any) =>
                    sum + Number(d.kwh || 0),
                  0
                )

              const avgDaily =
                totalUsage / daysSpan

              recs.push(
                `Average daily usage across this period is ${avgDaily.toFixed(
                  2
                )} kWh.`
              )
            }
          }

          // Efficient companies
          const efficient =
            stats.filter(
              (s) => s.avgDaily < 50
            )

          if (efficient.length > 0) {

            recs.push(
              `${efficient.length} compan${
                efficient.length > 1
                  ? "ies are"
                  : "y is"
              } operating with relatively low daily energy usage.`
            )
          }
        }

        setRecommendations(recs)

      } catch (err: any) {

        console.error(err)

        setError(
          err?.message ||
          "Failed to load insights"
        )

      } finally {

        setLoading(false)
      }
    }

    fetchInsights()

  }, [selectedCompany, dateFrom, dateTo])

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Insights & Recommendations
        </h2>

        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Loading insights...
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
  // TOTALS
  // =========================

  const totalKwh =
    insights.reduce(
      (sum, s) => sum + s.totalKwh,
      0
    )

  const totalEmissions =
    insights.reduce(
      (sum, s) => sum + s.emissions,
      0
    )

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-6">

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Factory className="w-4 h-4 text-primary" />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Companies
            </p>

            <p className="text-lg font-semibold">
              {insights.length}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Total Usage
            </p>

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
            <p className="text-xs text-muted-foreground">
              Estimated CO₂
            </p>

            <p className="text-lg font-semibold">
              {totalEmissions.toFixed(1)} kg
            </p>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />

          <h2 className="text-lg font-semibold">
            Company Comparison
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <ReBarChart data={insights}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="company" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="totalKwh"
              name="Total kWh"
            />

            <Bar
              dataKey="emissions"
              name="CO₂ Emissions"
            />
          </ReBarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-500" />

          <h2 className="text-lg font-semibold">
            Recommendations
          </h2>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recommendations available yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="text-sm border rounded-lg p-3 bg-muted/30"
              >
                {rec}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}