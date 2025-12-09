"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ConsumptionData {
  company: string
  kwh: number
}

export function ConsumptionByCompanyChart({ data }: { data: ConsumptionData[] }) {
  const colors = [
    "hsl(142, 76%, 36%)",
    "hsl(142, 76%, 46%)",
    "hsl(142, 76%, 58%)",
    "hsl(142, 76%, 72%)",
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Energy Distribution</CardTitle>
        <CardDescription>Breakdown of total consumption by company</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={290}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ company, percent }) =>
                `${company} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={110}
              dataKey="kwh"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
              formatter={(value: any) => [`${value.toFixed(2)} kWh`, "Usage"]}
            />

            <Legend
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
