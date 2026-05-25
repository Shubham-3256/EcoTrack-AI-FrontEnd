"use client"

import { useState } from "react"
import { apiFetchBlob } from "@/lib/api"

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
  const [loadingCsv, setLoadingCsv] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const download = async (type: "csv" | "pdf") => {
    const setter = type === "csv" ? setLoadingCsv : setLoadingPdf

    try {
      setter(true)
      setError(null)
      setSuccess(null)

      const blob = await apiFetchBlob(`/export/${type}`)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = type === "csv" ? "ecotrack_history.csv" : "ecotrack_report.pdf"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setSuccess(`${type.toUpperCase()} export downloaded successfully`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || `Failed to export ${type.toUpperCase()}`)
    } finally {
      setter(false)
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Export Data</h2>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => download("csv")}
          disabled={loadingCsv || loadingPdf}
        >
          {loadingCsv ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          CSV
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => download("pdf")}
          disabled={loadingPdf || loadingCsv}
        >
          {loadingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          PDF Report
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground border-t pt-3">
        CSV: full energy history. PDF: summarized analytics report.
      </p>
    </Card>
  )
}
