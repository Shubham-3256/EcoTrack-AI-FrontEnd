"use client"

import type React from "react"

import { useState } from "react"
import { postJson } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

import {
  AlertCircle,
  Loader2,
  Zap,
  CheckCircle2,
} from "lucide-react"

interface EnergyFormProps {
  onSuccess: () => void
}

export function EnergyForm({
  onSuccess,
}: EnergyFormProps) {

  const [company, setCompany] =
    useState("")

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    )

  const [kwh, setKwh] =
    useState("")

  const [notes, setNotes] =
    useState("")

  const [error, setError] =
    useState("")

  const [success, setSuccess] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault()

      if (loading) return

      setError("")
      setSuccess(false)
      setLoading(true)

      try {

        const trimmedCompany =
          company.trim()

        const trimmedNotes =
          notes.trim()

        if (!trimmedCompany) {
          throw new Error(
            "Company name is required"
          )
        }

        if (!date) {
          throw new Error(
            "Date is required"
          )
        }

        const parsedKwh =
          Number.parseFloat(kwh)

        if (
          Number.isNaN(parsedKwh)
        ) {
          throw new Error(
            "Energy usage must be a valid number"
          )
        }

        if (parsedKwh <= 0) {
          throw new Error(
            "Energy usage must be greater than 0"
          )
        }

        await postJson("/save-energy-usage", {
          company:
            trimmedCompany,

          date,

          kwh:
            parsedKwh,

          notes:
            trimmedNotes || "",
        })

        // =========================
        // RESET
        // =========================

        setCompany("")
        setKwh("")
        setNotes("")

        setDate(
          new Date()
            .toISOString()
            .split("T")[0]
        )

        setSuccess(true)

        // Refresh dashboard
        onSuccess()

        // Auto-hide success
        setTimeout(() => {
          setSuccess(false)
        }, 3000)

      } catch (err: any) {

        console.error(err)

        setError(
          err?.message ||
          "An unexpected error occurred"
        )

      } finally {

        setLoading(false)
      }
    }

  // =========================
  // UI
  // =========================

  return (
    <Card className="p-6">

      <h2 className="text-lg font-semibold mb-4">
        Log Energy Usage
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        {/* Error */}
        {error && (

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">

            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />

            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        )}

        {/* Success */}
        {success && (

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex gap-2">

            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />

            <p className="text-sm text-green-600">
              Energy usage logged successfully.
            </p>
          </div>
        )}

        {/* Row 1 */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Company */}
          <div className="space-y-2">

            <label className="text-sm font-medium">
              Company
            </label>

            <Input
              placeholder="e.g. City Power"

              value={company}

              onChange={(e) =>
                setCompany(
                  e.target.value
                )
              }

              required

              disabled={loading}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">

            <label className="text-sm font-medium">
              Date
            </label>

            <Input
              type="date"

              value={date}

              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }

              required

              disabled={loading}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* kWh */}
          <div className="space-y-2">

            <label className="text-sm font-medium">
              Energy Usage (kWh)
            </label>

            <Input
              type="number"

              placeholder="0.00"

              step="0.01"

              min="0"

              value={kwh}

              onChange={(e) =>
                setKwh(
                  e.target.value
                )
              }

              required

              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">

            <label className="text-sm font-medium">
              Notes (optional)
            </label>

            <Input
              placeholder="Add notes..."

              value={notes}

              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }

              disabled={loading}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"

          className="w-full"

          disabled={loading}
        >

          {loading ? (

            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />

              Saving...
            </>

          ) : (

            <>
              <Zap className="w-4 h-4 mr-2" />

              Log Usage
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
