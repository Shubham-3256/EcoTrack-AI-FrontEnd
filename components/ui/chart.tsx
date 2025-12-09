"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Legend, Tooltip } from "recharts"

// -----------------------------------------
// Types
// -----------------------------------------

export type ChartConfig = Record<
  string,
  {
    label: string
    color?: string
  }
>

interface ChartContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

// -----------------------------------------
// ChartContainer
// -----------------------------------------

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  const style: React.CSSProperties = {
    ...(props.style || {}),
    ...Object.fromEntries(
      Object.entries(config).map(([key, value]) => [
        `--color-${key}`,
        value.color,
      ])
    ),
  }

  return (
    <div className={cn("space-y-2", className)} style={style} {...props}>
      {children}
    </div>
  )
}

// -----------------------------------------
// Tooltip wrapper
// -----------------------------------------

// super loose typing so Recharts can't break our build
export function ChartTooltip(props: any) {
  return <Tooltip {...props} />
}

type ChartTooltipContentProps = {
  active?: boolean
  payload?: Array<{
    dataKey?: string | number
    name?: string
    color?: string
    value?: number | string | null
    payload?: any
  }>
  label?: string | number
  className?: string
  indicator?: "dot" | "line"
  hideLabel?: boolean
  labelKey?: string
  labelFormatter?: (label: any) => React.ReactNode
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
  labelKey,
  labelFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const items = payload.filter((item) => item && item.value != null)
  if (items.length === 0) return null

  const displayLabel =
    labelFormatter?.(label) ??
    (typeof label === "string" || typeof label === "number"
      ? label
      : null)

  return (
    <div
      className={cn(
        "rounded-lg border bg-background px-3 py-2 text-xs shadow-sm",
        className
      )}
    >
      {!hideLabel && displayLabel && (
        <div className="mb-1 font-medium text-foreground">
          {displayLabel}
        </div>
      )}
      <div className="space-y-1">
        {items.map((item, index) => {
          const name =
            (labelKey && (item.payload as any)?.[labelKey]) ?? item.name

          return (
            <div
              key={index}
              className="flex items-center gap-2 text-muted-foreground"
            >
              {indicator === "dot" && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color ?? "var(--primary)" }}
                />
              )}
              {indicator === "line" && (
                <span
                  className="h-0.5 w-3 rounded-sm"
                  style={{ backgroundColor: item.color ?? "var(--primary)" }}
                />
              )}
              <span className="flex-1 truncate">{name}</span>
              <span className="font-medium text-foreground">
                {typeof item.value === "number"
                  ? item.value.toFixed(2)
                  : item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// -----------------------------------------
// Legend wrapper
// -----------------------------------------

export function ChartLegend(props: any) {
  return <Legend {...props} />
}

interface ChartLegendContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  payload?: any[]
}

export function ChartLegendContent({
  className,
  payload,
  ...props
}: ChartLegendContentProps) {
  if (!payload || payload.length === 0) return null

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color ?? "var(--primary)" }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}
