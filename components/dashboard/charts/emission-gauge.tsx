"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf } from "lucide-react"

export function EmissionGaugeChart({ emission }: { emission: number }) {
  const maxEmission = 100
  const percentage = (emission / maxEmission) * 100

  const getColor = (percent: number) => {
    if (percent < 30) return "hsl(142, 76%, 46%)"
    if (percent < 60) return "hsl(38, 92%, 55%)"
    return "hsl(0, 84%, 60%)"
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Current Emissions</CardTitle>
        <CardDescription>Real-time CO₂ output estimate</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(
                ${getColor(percentage)} 0deg ${percentage * 3.6}deg,
                #e5e5e5 ${percentage * 3.6}deg 360deg
              )`,
              }}
            >
              <div className="bg-background rounded-full w-40 h-40 flex flex-col items-center justify-center shadow-inner">
                <Leaf className="w-10 h-10 text-green-600 mb-2" />
                <p className="text-3xl font-bold">{emission.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg CO₂</p>
              </div>
            </div>
          </div>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {percentage < 30
              ? "Excellent — low emissions"
              : percentage < 60
              ? "Moderate emissions"
              : "High emissions — consider reduction strategies"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
