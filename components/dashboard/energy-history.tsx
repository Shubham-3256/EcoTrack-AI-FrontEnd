"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

import { Card } from "@/components/ui/card"

import {
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react"

interface EnergyUsage {
  id: number
  company: string
  date: string
  kwh: number
  notes: string
  created_at: string
}

interface Props {
  refreshTrigger: number
}

export function EnergyHistory({
  refreshTrigger,
}: Props) {

  const [history, setHistory] =
    useState<EnergyUsage[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [deletingId, setDeletingId] =
    useState<number | null>(null)

  // =========================
  // FETCH HISTORY
  // =========================

  useEffect(() => {

    const controller =
      new AbortController()

    const fetchHistory =
      async () => {

        try {

          setLoading(true)
          setError(null)

          const data =
            await apiFetch<EnergyUsage[]>(
              "/history",
              {
                signal:
                  controller.signal,
              }
            )

          if (!Array.isArray(data)) {
            throw new Error(
              "Invalid history response"
            )
          }

          setHistory(
            data.sort(
              (
                a: EnergyUsage,
                b: EnergyUsage
              ) =>
                new Date(
                  b.date
                ).getTime() -
                new Date(
                  a.date
                ).getTime()
            )
          )

        } catch (err: any) {

          if (
            err?.name !==
            "AbortError"
          ) {

            console.error(err)

            setError(
              err?.message ||
              "Failed to load history"
            )

            setHistory([])
          }

        } finally {

          setLoading(false)
        }
      }

    fetchHistory()

    return () => {
      controller.abort()
    }

  }, [refreshTrigger])

  // =========================
  // DELETE
  // =========================

  const handleDelete =
    async (id: number) => {

      if (
        deletingId !== null
      ) {
        return
      }

      const confirmed =
        confirm(
          "Delete this energy usage record?"
        )

      if (!confirmed) {
        return
      }

      try {

        setDeletingId(id)

        await apiFetch(
          "/delete-energy-usage",
          {
            method: "POST",

            body: JSON.stringify({
              id,
            }),
          }
        )

        setHistory(
          history.filter(
            (h) => h.id !== id
          )
        )

      } catch (err: any) {

        console.error(err)

        alert(
          err?.message ||
          "Failed to delete record"
        )

      } finally {

        setDeletingId(null)
      }
    }

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <Card className="p-6 h-full">

        <div className="flex items-center gap-2 text-muted-foreground">

          <Loader2 className="w-4 h-4 animate-spin" />

          <span className="text-sm">
            Loading history...
          </span>
        </div>
      </Card>
    )
  }

  // =========================
  // ERROR
  // =========================

  if (error) {

    return (
      <Card className="p-6 h-full">

        <div className="flex items-start gap-2 text-red-500">

          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />

          <div>

            <p className="font-medium">
              Failed to load history
            </p>

            <p className="text-sm">
              {error}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // =========================
  // UI
  // =========================

  return (
    <Card className="p-6 h-full">

      <h2 className="text-lg font-semibold mb-4">
        Recent Usage
      </h2>

      <div className="space-y-3">

        {history.length === 0 ? (

          <p className="text-sm text-muted-foreground">
            No energy records found.
          </p>

        ) : (

          history
            .slice(0, 5)
            .map((item) => (

              <div
                key={item.id}
                className="border rounded-lg p-3 space-y-2 text-sm"
              >

                <div className="flex justify-between items-start gap-2">

                  <div>

                    <p className="font-medium">
                      {item.company}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        item.date
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() =>
                      handleDelete(
                        item.id
                      )
                    }

                    disabled={
                      deletingId ===
                      item.id
                    }

                    className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                  >

                    {deletingId ===
                    item.id ? (

                      <Loader2 className="w-4 h-4 animate-spin" />

                    ) : (

                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* kWh */}
                <p className="font-semibold text-primary">

                  {Number(
                    item.kwh
                  ).toFixed(2)}{" "}

                  kWh
                </p>

                {/* Notes */}
                {item.notes && (

                  <p className="text-muted-foreground text-xs leading-relaxed">

                    {item.notes}
                  </p>
                )}
              </div>
            ))
        )}
      </div>
    </Card>
  )
}
