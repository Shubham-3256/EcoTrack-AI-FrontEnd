"use client"

import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Prediction {
  date: string
  kwh: number | null
}

export function TrendChart() {

  const [predictions, setPredictions] =
    useState<Prediction[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {

    const controller =
      new AbortController()

    const fetchPredictions =
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

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/predict-trend`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                days: 7,
              }),

              signal:
                controller.signal,
            }
          )

          if (!res.ok) {
            throw new Error(
              `Prediction API failed (${res.status})`
            )
          }

          const data =
            await res.json()

          // FIXED CRASH
          setPredictions(
            Array.isArray(
              data.predictions
            )
              ? data.predictions
              : []
          )

        } catch (err: any) {

          if (
            err?.name !==
            "AbortError"
          ) {

            console.error(err)

            setError(
              err?.message ||
              "Failed to fetch predictions"
            )
          }

        } finally {

          setLoading(false)
        }
      }

    fetchPredictions()

    return () => {
      controller.abort()
    }

  }, [])

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Card className="p-6">

        <h2 className="text-lg font-semibold mb-4">
          7-Day Trend
        </h2>

        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Loading predictions...
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
  // EMPTY
  // =========================

  if (predictions.length === 0) {
    return (
      <Card className="p-6">

        <h2 className="text-lg font-semibold mb-4">
          7-Day Trend
        </h2>

        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No prediction data available.
        </div>
      </Card>
    )
  }

  // =========================
  // FORMAT DATA
  // =========================

  const data = predictions.map(
    (p) => ({
      date: new Date(
        p.date
      ).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        }
      ),

      kwh:
        Number(p.kwh) || 0,
    })
  )

  // =========================
  // UI
  // =========================

  return (
    <Card className="p-6">

      <h2 className="text-lg font-semibold mb-4">
        7-Day Trend
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <LineChart data={data}>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
          />

          <XAxis
            dataKey="date"
            stroke="var(--muted-foreground)"
            style={{
              fontSize: "0.875rem",
            }}
          />

          <YAxis
            stroke="var(--muted-foreground)"
            style={{
              fontSize: "0.875rem",
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor:
                "var(--card)",

              border:
                "1px solid var(--border)",

              borderRadius:
                "0.5rem",
            }}

            formatter={(value: any) => [
              `${Number(value).toFixed(2)} kWh`,
              "Predicted Usage",
            ]}
          />

          <Line
            type="monotone"
            dataKey="kwh"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{
              r: 4,
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}