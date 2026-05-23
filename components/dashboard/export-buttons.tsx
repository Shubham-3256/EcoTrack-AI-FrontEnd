"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, FileText, Loader2 } from "lucide-react"

export function ExportButtons() {
  const [loadingCsv, setLoadingCsv] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const download = async (type: "csv" | "pdf") => {
    const setter = type === "csv" ? setLoadingCsv : setLoadingPdf
    setter(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/export/${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href     = url
      a.download = type === "csv" ? "ecotrack_history.csv" : "ecotrack_report.pdf"
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
    finally { setter(false) }
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-[var(--color-text-secondary)]" />
        <h2 className="text-sm font-semibold">Export data</h2>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 gap-2"
          onClick={() => download("csv")} disabled={loadingCsv}>
          {loadingCsv
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Download className="w-3.5 h-3.5" />}
          CSV
        </Button>
        <Button size="sm" variant="outline" className="flex-1 gap-2"
          onClick={() => download("pdf")} disabled={loadingPdf}>
          {loadingPdf
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <FileText className="w-3.5 h-3.5" />}
          PDF report
        </Button>
      </div>
      <p className="text-[10px] text-[var(--color-text-secondary)]">
        CSV: full history table · PDF: summary report with totals
      </p>
    </Card>
  )
}
