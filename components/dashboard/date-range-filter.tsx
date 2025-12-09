"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface DateRangeFilterProps {
  onFilter: (from: string | null, to: string | null) => void
}

export function DateRangeFilter({ onFilter }: DateRangeFilterProps) {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleFilter = () => {
    onFilter(fromDate || null, toDate || null)
  }

  const handleReset = () => {
    setFromDate("")
    setToDate("")
    onFilter(null, null)
  }

  return (
    <Card className="p-6">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center gap-2 text-left font-semibold">
        <Calendar className="w-5 h-5 text-primary" />
        <span>Date Range Filter</span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm border-input bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm border-input bg-background"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleFilter} size="sm" className="flex-1">
              Apply Filter
            </Button>
            <Button onClick={handleReset} size="sm" variant="outline" className="flex-1 bg-transparent">
              Reset
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
