"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import {
  Download,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export function ExportButtons() {

  const [loadingCsv, setLoadingCsv] =
    useState(false)

  const [loadingPdf, setLoadingPdf] =
    useState(false)

  const [success, setSuccess] =
    useState<string | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  // =========================
  // DOWNLOAD
  // =========================

  const download =
    async (
      type: "csv" | "pdf"
    ) => {

      const setter =
        type === "csv"
          ? setLoadingCsv
          : setLoadingPdf

      try {

        setter(true)

        setError(null)
        setSuccess(null)

        const token =
          localStorage.getItem("token")

        if (!token) {
          throw new Error(
            "Authentication token missing"
          )
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/export/${type}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) {

          let body: any = {}

          try {

            body =
              await res.json()

          } catch {}

          throw new Error(
            body.error ||
            `Failed to export ${type.toUpperCase()}`
          )
        }

        const blob =
          await res.blob()

        if (
          !blob ||
          blob.size === 0
        ) {

          throw new Error(
            "Downloaded file is empty"
          )
        }

        // =========================
        // CREATE DOWNLOAD
        // =========================

        const url =
          window.URL.createObjectURL(
            blob
          )

        const a =
          document.createElement("a")

        a.href = url

        a.download =
          type === "csv"
            ? "ecotrack_history.csv"
            : "ecotrack_report.pdf"

        document.body.appendChild(a)

        a.click()

        // Cleanup
        a.remove()

        window.URL.revokeObjectURL(
          url
        )

        setSuccess(
          `${
            type.toUpperCase()
          } export downloaded successfully`
        )

        // Auto clear
        setTimeout(() => {
          setSuccess(null)
        }, 3000)

      } catch (err: any) {

        console.error(err)

        setError(
          err?.message ||
          `Failed to export ${type.toUpperCase()}`
        )

      } finally {

        setter(false)
      }
    }

  // =========================
  // UI
  // =========================

  return (
    <Card className="p-5 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">

        <Download className="w-4 h-4 text-muted-foreground" />

        <h2 className="text-sm font-semibold">
          Export Data
        </h2>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">

        {/* CSV */}
        <Button
          size="sm"

          variant="outline"

          className="flex-1 gap-2"

          onClick={() =>
            download("csv")
          }

          disabled={
            loadingCsv ||
            loadingPdf
          }
        >

          {loadingCsv ? (

            <Loader2 className="w-3.5 h-3.5 animate-spin" />

          ) : (

            <Download className="w-3.5 h-3.5" />
          )}

          CSV
        </Button>

        {/* PDF */}
        <Button
          size="sm"

          variant="outline"

          className="flex-1 gap-2"

          onClick={() =>
            download("pdf")
          }

          disabled={
            loadingPdf ||
            loadingCsv
          }
        >

          {loadingPdf ? (

            <Loader2 className="w-3.5 h-3.5 animate-spin" />

          ) : (

            <FileText className="w-3.5 h-3.5" />
          )}

          PDF Report
        </Button>
      </div>

      {/* Success */}
      {success && (

        <div className="flex items-center gap-2 text-sm text-green-600">

          <CheckCircle2 className="w-4 h-4" />

          {success}
        </div>
      )}

      {/* Error */}
      {error && (

        <div className="flex items-center gap-2 text-sm text-red-500">

          <AlertCircle className="w-4 h-4" />

          {error}
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground border-t pt-3">

        CSV: full energy history
        {" · "}
        PDF: summarized analytics report
      </p>
    </Card>
  )
}