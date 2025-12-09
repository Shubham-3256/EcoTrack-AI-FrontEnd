"use client"

import { Card } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

type ConsumptionByCompanyPoint = {
  company: string
  kwh: number
}

type ChartItem = {
  name: string
  value: number
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

export function ConsumptionByCompanyChart({
  data,
}: {
  data: ConsumptionByCompanyPoint[]
}) {
  // Map domain data → chart-friendly shape
  const chartData: ChartItem[] = data.map((d) => ({
    name: d.company,
    value: d.kwh,
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Consumption by Company</h2>
          <p className="text-sm text-muted-foreground">
            Distribution of total kWh usage
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold">{total.toFixed(2)} kWh</p>
        </div>
      </div>

      <div className="flex-1 min-h-[260px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, _name, _props) => [
                  `${Number(value).toFixed(2)} kWh`,
                  "Consumption",
                ]}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  fontSize: "0.8rem",
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "0.75rem" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
