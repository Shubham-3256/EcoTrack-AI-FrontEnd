"use client"

import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  Calendar,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface DateRangeFilterProps {
  onFilter: (
    from: string | null,
    to: string | null
  ) => void
}

export function DateRangeFilter({
  onFilter,
}: DateRangeFilterProps) {

  const [fromDate, setFromDate] =
    useState("")

  const [toDate, setToDate] =
    useState("")

  const [isOpen, setIsOpen] =
    useState(false)

  const [error, setError] =
    useState("")

  // =========================
  // APPLY FILTER
  // =========================

  const handleFilter =
    () => {

      setError("")

      // Validate range
      if (
        fromDate &&
        toDate &&
        fromDate > toDate
      ) {

        setError(
          "From date cannot be after To date."
        )

        return
      }

      onFilter(
        fromDate || null,
        toDate || null
      )
    }

  // =========================
  // RESET
  // =========================

  const handleReset =
    () => {

      setFromDate("")
      setToDate("")
      setError("")

      onFilter(null, null)
    }

  // =========================
  // ACTIVE FILTER
  // =========================

  const hasActiveFilter =
    Boolean(
      fromDate || toDate
    )

  // =========================
  // UI
  // =========================

  return (
    <Card className="p-6">

      {/* Header */}
      <button
        onClick={() =>
          setIsOpen(!isOpen)
        }

        className="w-full flex items-center justify-between gap-2 text-left"
      >

        <div className="flex items-center gap-2">

          <Calendar className="w-5 h-5 text-primary" />

          <div>

            <h2 className="font-semibold">
              Date Range Filter
            </h2>

            <p className="text-xs text-muted-foreground">

              {hasActiveFilter
                ? `${fromDate || "Start"} → ${
                    toDate || "Latest"
                  }`
                : "No active date filter"}
            </p>
          </div>
        </div>

        {/* Active badge */}
        {hasActiveFilter && (

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            active
          </span>
        )}
      </button>

      {/* Content */}
      {isOpen && (

        <div className="mt-5 space-y-4">

          {/* From */}
          <div className="space-y-1.5">

            <label className="text-sm font-medium">
              From Date
            </label>

            <input
              type="date"

              value={fromDate}

              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }

              className="w-full px-3 py-2 border rounded-lg text-sm border-input bg-background"
            />
          </div>

          {/* To */}
          <div className="space-y-1.5">

            <label className="text-sm font-medium">
              To Date
            </label>

            <input
              type="date"

              value={toDate}

              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }

              className="w-full px-3 py-2 border rounded-lg text-sm border-input bg-background"
            />
          </div>

          {/* Error */}
          {error && (

            <div className="flex items-center gap-2 text-sm text-red-500">

              <AlertCircle className="w-4 h-4" />

              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">

            <Button
              onClick={
                handleFilter
              }

              size="sm"

              className="flex-1"
            >
              Apply Filter
            </Button>

            <Button
              onClick={
                handleReset
              }

              size="sm"

              variant="outline"

              className="flex-1 bg-transparent"
            >

              <XCircle className="w-4 h-4 mr-2" />

              Reset
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}