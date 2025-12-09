"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Prediction {
  date: string
  kwh: number | null
}

export function TrendChart() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/predict-trend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ days: 7 }),
        })
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setPredictions(data.predictions)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">7-Day Trend</h2>
        <div className="h-64 flex items-center justify-center text-muted-foreground">Loading predictions...</div>
      </Card>
    )
  }

  const data = predictions.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    kwh: p.kwh || 0,
  }))

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">7-Day Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" style={{ fontSize: "0.875rem" }} />
          <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "0.875rem" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
            }}
            formatter={(value: any) => [`${value.toFixed(2)} kWh`, "Usage"]}
          />
          <Line
            type="monotone"
            dataKey="kwh"
            stroke="var(--primary)"
            dot={{ fill: "var(--primary)", r: 4 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
