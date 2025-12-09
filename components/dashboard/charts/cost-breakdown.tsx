"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CostData {
  company: string
  cost: number
}

export function CostBreakdownChart({ data }: { data: CostData[] }) {
  const colors = [
    "hsl(142, 76%, 36%)",
    "hsl(142, 76%, 46%)",
    "hsl(142, 76%, 58%)",
    "hsl(142, 76%, 72%)",
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Cost Breakdown</CardTitle>
        <CardDescription>Total billing by company</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="company" style={{ fontSize: "0.8rem" }} />
            <YAxis style={{ fontSize: "0.8rem" }} />

            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
              formatter={(value: any) => [`$${value.toFixed(2)}`, "Cost"]}
            />

            <Bar dataKey="cost" name="Cost">
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
