"use client"

import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"

import {
  Zap,
  Leaf,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

interface HistoryItem {
  kwh: number
  company?: string
  date?: string
}

interface StatsData {
  totalKwh: number
  totalEmissions: number
  avgDaily: number
  trend: "up" | "down" | "stable"
}

interface Props {
  refreshTrigger: number
  selectedCompany?: string
}

export function EnergyStats({
  refreshTrigger,
  selectedCompany,
}: Props) {

  const [stats, setStats] =
    useState<StatsData>({
      totalKwh: 0,
      totalEmissions: 0,
      avgDaily: 0,
      trend: "stable",
    })

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {

    const controller =
      new AbortController()

    const fetchStats = async () => {

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

        // =========================
        // QUERY PARAMS
        // =========================

        const params =
          new URLSearchParams()

        if (selectedCompany) {
          params.append(
            "company",
            selectedCompany
          )
        }

        const qs = params.toString()

        const url =
          `${process.env.NEXT_PUBLIC_API_BASE}/history${
            qs ? `?${qs}` : ""
          }`

        // =========================
        // FETCH HISTORY
        // =========================

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(
            `Failed to fetch stats (${res.status})`
          )
        }

        const data: HistoryItem[] =
          await res.json()

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid history response"
          )
        }

        // =========================
        // EMPTY STATE
        // =========================

        if (data.length === 0) {

          setStats({
            totalKwh: 0,
            totalEmissions: 0,
            avgDaily: 0,
            trend: "stable",
          })

          return
        }

        // =========================
        // TOTAL ENERGY
        // =========================

        const totalKwh =
          data.reduce(
            (sum, item) =>
              sum + Number(item.kwh || 0),
            0
          )

        // =========================
        // EMISSIONS
        // =========================

        let totalEmissions =
          totalKwh * 0.42

        try {

          const emissionResponse =
            await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE}/calculate-emission`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  kwh: totalKwh,
                }),

                signal: controller.signal,
              }
            )

          if (emissionResponse.ok) {

            const emissionData =
              await emissionResponse.json()

            totalEmissions =
              Number(
                emissionData.co2_kg
              ) || totalEmissions
          }

        } catch (emissionError) {

          console.warn(
            "Emission API failed:",
            emissionError
          )
        }

        // =========================
        // TREND CALCULATION
        // =========================

        const mid =
          Math.floor(data.length / 2)

        const firstHalfData =
          data.slice(0, mid)

        const secondHalfData =
          data.slice(mid)

        // FIXED DIVIDE BY ZERO

        const firstHalfAvg =
          firstHalfData.length > 0
            ? firstHalfData.reduce(
                (sum, item) =>
                  sum +
                  Number(item.kwh || 0),
                0
              ) / firstHalfData.length
            : 0

        const secondHalfAvg =
          secondHalfData.length > 0
            ? secondHalfData.reduce(
                (sum, item) =>
                  sum +
                  Number(item.kwh || 0),
                0
              ) / secondHalfData.length
            : 0

        let trend:
          | "up"
          | "down"
          | "stable" = "stable"

        if (
          secondHalfAvg >
          firstHalfAvg * 1.1
        ) {
          trend = "up"
        } else if (
          secondHalfAvg <
          firstHalfAvg * 0.9
        ) {
          trend = "down"
        }

        // =========================
        // FINAL STATE
        // =========================

        setStats({
          totalKwh: Number(
            totalKwh.toFixed(2)
          ),

          totalEmissions: Number(
            totalEmissions.toFixed(2)
          ),

          avgDaily: Number(
            (
              totalKwh / data.length
            ).toFixed(2)
          ),

          trend,
        })

      } catch (err: any) {

        if (
          err?.name !== "AbortError"
        ) {

          console.error(err)

          setError(
            err?.message ||
            "Failed to load stats"
          )
        }

      } finally {

        setLoading(false)
      }
    }

    fetchStats()

    return () => {
      controller.abort()
    }

  }, [
    refreshTrigger,
    selectedCompany,
  ])

  // =========================
  // ICONS + COLORS
  // =========================

  const statCards = [
    {
      icon: Zap,
      label: "Total Energy",
      value: `${stats.totalKwh} kWh`,
      color: "text-yellow-500",
    },

    {
      icon: Leaf,
      label: "CO₂ Emissions",
      value: `${stats.totalEmissions} kg`,
      color: "text-green-500",
    },

    {
      icon: BarChart3,
      label: "Daily Average",
      value: `${stats.avgDaily} kWh`,
      color: "text-blue-500",
    },

    {
      icon:
        stats.trend === "up"
          ? TrendingUp
          : stats.trend === "down"
          ? TrendingDown
          : Minus,

      label: "Trend",

      value:
        stats.trend
          .charAt(0)
          .toUpperCase() +
        stats.trend.slice(1),

      // FIXED STABLE COLOR
      color:
        stats.trend === "down"
          ? "text-green-600"
          : stats.trend === "up"
          ? "text-red-600"
          : "text-gray-500",
    },
  ]

  // =========================
  // ERROR UI
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
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

      {statCards.map(
        (stat, index) => {

          const Icon = stat.icon

          return (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>

                  <p className="text-2xl font-bold">
                    {loading
                      ? "—"
                      : stat.value}
                  </p>
                </div>

                <Icon
                  className={`w-8 h-8 ${stat.color}`}
                />
              </div>
            </Card>
          )
        }
      )}
    </div>
  )
}