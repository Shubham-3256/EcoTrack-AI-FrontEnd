"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Zap, Leaf, BarChart3, TrendingDown } from "lucide-react"

interface StatsData {
  totalKwh: number
  totalEmissions: number
  avgDaily: number
  trend: "up" | "down" | "stable"
}

export function EnergyStats({
  refreshTrigger,
  selectedCompany,
}: {
  refreshTrigger: number
  selectedCompany?: string
}) {
  const [stats, setStats] = useState<StatsData>({
    totalKwh: 0,
    totalEmissions: 0,
    avgDaily: 0,
    trend: "stable",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const url = new URL("http://localhost:5000/history")
        if (selectedCompany) url.searchParams.append("company", selectedCompany)

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()

        if (data.length === 0) {
          setStats({ totalKwh: 0, totalEmissions: 0, avgDaily: 0, trend: "stable" })
          setLoading(false)
          return
        }

        const totalKwh = data.reduce((sum: number, item: any) => sum + item.kwh, 0)

        // Calculate emissions using average factor (0.42 kg CO2/kWh)
        const emissionResponse = await fetch("http://localhost:5000/calculate-emission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kwh: totalKwh }),
        })

        let totalEmissions = totalKwh * 0.42
        if (emissionResponse.ok) {
          const emissionData = await emissionResponse.json()
          totalEmissions = emissionData.co2_kg
        }

        // Calculate trend by comparing first half vs second half
        const mid = Math.floor(data.length / 2)
        const firstHalf = data.slice(0, mid).reduce((sum: number, item: any) => sum + item.kwh, 0) / mid || 0
        const secondHalf =
          data.slice(mid).reduce((sum: number, item: any) => sum + item.kwh, 0) / (data.length - mid) || 0

        let trend: "up" | "down" | "stable" = "stable"
        if (secondHalf > firstHalf * 1.1) trend = "up"
        if (secondHalf < firstHalf * 0.9) trend = "down"

        setStats({
          totalKwh: Number(totalKwh.toFixed(2)),
          totalEmissions: Number(totalEmissions.toFixed(2)),
          avgDaily: data.length > 0 ? Number((totalKwh / data.length).toFixed(2)) : 0,
          trend,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    // re-run whenever refreshTrigger or selectedCompany changes
    fetchStats()
  }, [refreshTrigger, selectedCompany])

  const statCards = [
    { icon: Zap, label: "Total Energy", value: `${stats.totalKwh} kWh`, color: "text-accent" },
    { icon: Leaf, label: "CO₂ Emissions", value: `${stats.totalEmissions} kg`, color: "text-primary" },
    { icon: BarChart3, label: "Daily Average", value: `${stats.avgDaily} kWh`, color: "text-secondary" },
    {
      icon: TrendingDown,
      label: "Trend",
      value: stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1),
      color: stats.trend === "down" ? "text-green-600" : "text-red-600",
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{loading ? "—" : stat.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
