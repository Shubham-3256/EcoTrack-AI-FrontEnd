"use client"

import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface DailyPoint {
  day: string
  actual: number
  predicted: number | null
}

export function DailyComparisonChart({ data }: { data: DailyPoint[] }) {
  const safeData = data ?? []

  return (
    <Card className="p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Daily Usage Trend</h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={safeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

          <XAxis
            dataKey="day"
            stroke="var(--muted-foreground)"
            style={{ fontSize: "0.7rem" }}
          />

          <YAxis
            stroke="var(--muted-foreground)"
            style={{ fontSize: "0.7rem" }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
            }}
            formatter={(value: any, name: any) => {
              const label = name === "actual" ? "Actual" : "Predicted"
              if (name === "predicted" && (value === null || value === 0)) {
                return ["—", label]
              }
              return [`${Number(value).toFixed(2)} kWh`, label]
            }}
          />

          <Legend
            wrapperStyle={{ fontSize: "0.75rem" }}
            formatter={(value) =>
              value === "actual" ? "Actual" : "Predicted"
            }
          />

          <Line
            type="monotone"
            name="actual"
            dataKey="actual"
            stroke="hsl(142, 76%, 36%)"
            strokeWidth={3}
            dot={{ r: 3 }}
          />

          <Line
            type="monotone"
            name="predicted"
            dataKey="predicted"
            stroke="hsl(215, 15%, 65%)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
