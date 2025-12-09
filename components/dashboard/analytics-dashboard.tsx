"use client"

import { useEffect, useState } from "react"
import { ConsumptionByCompanyChart } from "./charts/consumption-by-company"
import { DailyComparisonChart } from "./charts/daily-comparison"
import { EmissionGaugeChart } from "./charts/emission-gauge"
import { CostBreakdownChart } from "./charts/cost-breakdown"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AnalyticsData {
  consumptionByCompany: Array<{ company: string; kwh: number }>
  dailyComparison: Array<{ day: string; actual: number; predicted: number | null }>
  currentEmission: number
  costBreakdown: Array<{ company: string; cost: number }>
}

interface Prediction {
  date: string
  kwh: number | null
}

export function AnalyticsDashboard({
  selectedCompany,
  dateFrom,
  dateTo,
  refreshTrigger,
}: {
  selectedCompany?: string | null
  dateFrom?: string | null
  dateTo?: string | null
  refreshTrigger: number
}) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [predictionDays, setPredictionDays] = useState(7)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Missing token")

        // 1) Fetch history (actual usage)
        const historyUrl = new URL("http://localhost:5000/history")
        if (selectedCompany) historyUrl.searchParams.append("company", selectedCompany)
        if (dateFrom) historyUrl.searchParams.append("from", dateFrom)
        if (dateTo) historyUrl.searchParams.append("to", dateTo)

        const historyRes = await fetch(historyUrl, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!historyRes.ok) throw new Error("Failed to fetch history")
        const history = await historyRes.json()

        const consumptionByCompany: Record<string, number> = {}
        const dailyMap: Record<string, { actual: number; predicted: number | null }> = {}
        const costBreakdown: Record<string, number> = {}
        let totalEmission = 0

        history.forEach((record: any) => {
          // company-wise consumption & cost
          consumptionByCompany[record.company] =
            (consumptionByCompany[record.company] || 0) + record.kwh
          costBreakdown[record.company] =
            (costBreakdown[record.company] || 0) + record.kwh * 0.12

          const label = new Date(record.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })

          if (!dailyMap[label]) {
            dailyMap[label] = { actual: 0, predicted: null }
          }
          dailyMap[label].actual += record.kwh

          totalEmission += record.kwh * 0.4
        })

        // 2) Fetch predictions
        let predictions: Prediction[] = []
        try {
          const predictRes = await fetch("http://localhost:5000/predict-trend", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              days: predictionDays,
              company: selectedCompany || null,
            }),
          })

          if (predictRes.ok) {
            const predJson = await predictRes.json()
            predictions = predJson.predictions || []
          } else {
            console.warn("predict-trend request failed with status", predictRes.status)
          }
        } catch (e) {
          console.warn("Failed to fetch predictions, continuing with actuals only", e)
        }

        // merge predictions into dailyMap (future days only, no forced 0)
        predictions.forEach((p) => {
          if (p.kwh == null) return
          const label = new Date(p.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
          if (!dailyMap[label]) {
            dailyMap[label] = { actual: 0, predicted: null }
          }
          dailyMap[label].predicted = p.kwh
        })

        const dailyComparison = Object.entries(dailyMap).map(([day, vals]) => ({
          day,
          actual: vals.actual,
          predicted: vals.predicted ?? null,
        }))

        setData({
          consumptionByCompany: Object.entries(consumptionByCompany).map(([company, kwh]) => ({
            company,
            kwh,
          })),
          dailyComparison,
          currentEmission: totalEmission,
          costBreakdown: Object.entries(costBreakdown).map(([company, cost]) => ({
            company,
            cost,
          })),
        })
      } catch (err) {
        console.error(err)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [refreshTrigger, selectedCompany, dateFrom, dateTo, predictionDays])

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading analytics...</p>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No data available for the selected filters.
        </p>
      </Card>
    )
  }

  const totalKwh = data.consumptionByCompany.reduce(
    (sum, c) => sum + c.kwh,
    0
  )

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="text-muted-foreground">
          <span className="font-medium">
            {selectedCompany || "All companies"}
          </span>
          {dateFrom || dateTo ? (
            <>
              {" · "}
              <span>
                Range:{" "}
                {dateFrom || "start"} – {dateTo || "latest"}
              </span>
            </>
          ) : (
            <span className="ml-1">· Full history</span>
          )}
        </div>
        <div className="text-muted-foreground">
          {data.consumptionByCompany.length} companies ·{" "}
          {totalKwh.toFixed(1)} kWh total
        </div>
      </div>

      {/* Top Row: Key Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <ConsumptionByCompanyChart data={data.consumptionByCompany} />
        <EmissionGaugeChart emission={data.currentEmission} />
      </div>

      {/* Second Row: Actual vs Predicted + Day Toggle */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <p className="text-sm text-muted-foreground">
            Daily actual vs predicted usage
          </p>
          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={predictionDays === d ? "default" : "outline"}
                onClick={() => setPredictionDays(d)}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>
        <DailyComparisonChart data={data.dailyComparison} />
      </div>

      {/* Third Row: Cost Breakdown */}
      <CostBreakdownChart data={data.costBreakdown} />
    </div>
  )
}
