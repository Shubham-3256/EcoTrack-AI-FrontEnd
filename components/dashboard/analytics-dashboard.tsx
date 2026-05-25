"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

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

interface Props {
  selectedCompany?: string | null
  dateFrom?: string | null
  dateTo?: string | null
  refreshTrigger: number
}

export function AnalyticsDashboard({
  selectedCompany,
  dateFrom,
  dateTo,
  refreshTrigger,
}: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [predictionDays, setPredictionDays] = useState(7)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        // =========================
        // HISTORY FETCH
        // =========================
        const historyParams = new URLSearchParams()
        if (selectedCompany) historyParams.append("company", selectedCompany)
        if (dateFrom) historyParams.append("from", dateFrom)
        if (dateTo) historyParams.append("to", dateTo)
        const historyQs = historyParams.toString()

        const history = await apiFetch<any[]>(
          `/history${historyQs ? `?${historyQs}` : ""}`
        )

        if (!Array.isArray(history)) throw new Error("Invalid history response")

        // =========================
        // PROCESS DATA
        // =========================
        const consumptionByCompany: Record<string, number> = {}
        const dailyMap: Record<string, { actual: number; predicted: number | null }> = {}
        const costBreakdown: Record<string, number> = {}
        let totalEmission = 0

        history.forEach((record: any) => {
          const company = record.company || "Unknown"
          const kwh = Number(record.kwh || 0)

          consumptionByCompany[company] = (consumptionByCompany[company] || 0) + kwh
          costBreakdown[company] = (costBreakdown[company] || 0) + kwh * 0.12

          const label = new Date(record.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })

          if (!dailyMap[label]) dailyMap[label] = { actual: 0, predicted: null }
          dailyMap[label].actual += kwh
          totalEmission += kwh * 0.4
        })

        // =========================
        // PREDICTIONS
        // =========================
        let predictions: Prediction[] = []

        try {
          const predJson = await apiFetch<{ predictions?: Prediction[] }>(
            "/predict-trend",
            {
              method: "POST",
              body: JSON.stringify({ days: predictionDays, company: selectedCompany || null }),
            }
          )
          predictions = predJson.predictions || []
        } catch (predictionError) {
          console.warn("Prediction fetch failed:", predictionError)
        }

        // =========================
        // MERGE PREDICTIONS
        // =========================
        predictions.forEach((p) => {
          if (p.kwh == null) return
          const label = new Date(p.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
          if (!dailyMap[label]) dailyMap[label] = { actual: 0, predicted: null }
          dailyMap[label].predicted = p.kwh
        })

        const dailyComparison = Object.entries(dailyMap).map(([day, vals]) => ({
          day,
          actual: vals.actual,
          predicted: vals.predicted,
        }))

        setData({
          consumptionByCompany: Object.entries(consumptionByCompany).map(
            ([company, kwh]) => ({ company, kwh })
          ),
          dailyComparison,
          currentEmission: totalEmission,
          costBreakdown: Object.entries(costBreakdown).map(([company, cost]) => ({
            company,
            cost,
          })),
        })
      } catch (err: any) {
        console.error(err)
        setError(err?.message || "Failed to load analytics")
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

  if (error) {
    return <Card className="p-8 text-center text-red-500">{error}</Card>
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No analytics data available.</p>
      </Card>
    )
  }

  const totalKwh = data.consumptionByCompany.reduce((sum, item) => sum + item.kwh, 0)

  return (
    <div className="space-y-6">
      {/* Prediction buttons */}
      <div className="flex gap-2">
        {[7, 14, 30].map((d) => (
          <Button
            key={d}
            size="sm"
            variant={predictionDays === d ? "default" : "outline"}
            onClick={() => setPredictionDays(d)}
          >
            {d} days
          </Button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ConsumptionByCompanyChart data={data.consumptionByCompany} />
        <EmissionGaugeChart emission={data.currentEmission} />
        <DailyComparisonChart data={data.dailyComparison} />
        <CostBreakdownChart data={data.costBreakdown} />
      </div>

      {/* Footer */}
      <Card className="p-4 text-sm text-muted-foreground">
        Total consumption tracked:
        <span className="font-semibold ml-2">{totalKwh.toFixed(2)} kWh</span>
      </Card>
    </div>
  )
}
