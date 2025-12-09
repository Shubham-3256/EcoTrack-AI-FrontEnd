"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ParsedRow {
  date: string
  kwh: number
  company: string
  notes?: string
}

interface EnergyCsvUploadProps {
  onImportComplete?: () => void  // e.g. to trigger refresh in parent
}

export function EnergyCsvUpload({ onImportComplete }: EnergyCsvUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [successCount, setSuccessCount] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setErrors([])
    setParsedRows([])
    setSuccessCount(0)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = String(event.target?.result || "")
      parseCsv(text)
    }
    reader.onerror = () => {
      setErrors(["Failed to read file"])
    }

    reader.readAsText(file)
  }

  const parseCsv = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    if (lines.length <= 1) {
      setErrors(["CSV file seems empty or missing data rows"])
      return
    }

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const dateIdx = header.indexOf("date")
    const kwhIdx = header.indexOf("kwh")
    const companyIdx = header.indexOf("company")
    const notesIdx = header.indexOf("notes") // optional

    const newErrors: string[] = []
    if (dateIdx === -1 || kwhIdx === -1 || companyIdx === -1) {
      newErrors.push("CSV must have at least 'date', 'kwh', and 'company' columns in the header.")
      setErrors(newErrors)
      return
    }

    const rows: ParsedRow[] = []

    lines.slice(1).forEach((line, index) => {
      if (!line.trim()) return // skip empty lines

      const cols = line.split(",")
      const rowNumber = index + 2 // +2 to account for header row

      const rawDate = cols[dateIdx]?.trim()
      const rawKwh = cols[kwhIdx]?.trim()
      const rawCompany = cols[companyIdx]?.trim()
      const rawNotes = notesIdx !== -1 ? cols[notesIdx]?.trim() : ""

      if (!rawDate || !rawKwh || !rawCompany) {
        newErrors.push(`Row ${rowNumber}: Missing date, kwh, or company`)
        return
      }

      const kwhVal = Number(rawKwh)
      if (Number.isNaN(kwhVal)) {
        newErrors.push(`Row ${rowNumber}: kwh is not a valid number ("${rawKwh}")`)
        return
      }

      // Basic ISO date format check (backend will validate further)
      // You can add stricter validation if needed.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        newErrors.push(`Row ${rowNumber}: date must be in YYYY-MM-DD format ("${rawDate}")`)
        return
      }

      rows.push({
        date: rawDate,
        kwh: kwhVal,
        company: rawCompany,
        notes: rawNotes || undefined,
      })
    })

    setParsedRows(rows)
    setErrors(newErrors)
  }

  const handleUpload = async () => {
    if (!parsedRows.length) {
      setErrors(["No valid rows to upload."])
      return
    }

    setUploading(true)
    setErrors([])
    setSuccessCount(0)

    const token = localStorage.getItem("token")
    if (!token) {
      setErrors(["Missing auth token. Please log in again."])
      setUploading(false)
      return
    }

    let success = 0
    const rowErrors: string[] = []

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i]
      try {
        const res = await fetch("/api/save-energy-usage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company: row.company,
            date: row.date,
            kwh: row.kwh,
            notes: row.notes,
          }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          rowErrors.push(
            `Row ${i + 2}: failed to save (${res.status}) ${
              body.error ? `- ${body.error}` : ""
            }`
          )
        } else {
          success++
        }
      } catch (e: any) {
        rowErrors.push(`Row ${i + 2}: network/other error - ${e?.message || "unknown error"}`)
      }
    }

    setSuccessCount(success)
    setErrors(rowErrors)
    setUploading(false)

    if (success > 0 && onImportComplete) {
      onImportComplete()
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Bulk Import (CSV)</h2>
          <p className="text-sm text-muted-foreground">
            Upload a CSV with columns: <code>date,kwh,company,notes</code>.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
        {fileName && <span className="text-xs text-muted-foreground truncate">{fileName}</span>}
      </div>

      {parsedRows.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Parsed <span className="font-medium">{parsedRows.length}</span> valid rows.
        </div>
      )}

      {errors.length > 0 && (
        <div className="text-xs text-red-500 space-y-1 max-h-32 overflow-y-auto border border-destructive/30 rounded p-2 bg-destructive/5">
          {errors.map((err, idx) => (
            <div key={idx}>• {err}</div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {successCount > 0 && (
          <div className="text-xs text-emerald-600">
            Successfully uploaded <span className="font-semibold">{successCount}</span> rows.
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={uploading || parsedRows.length === 0}
          className="ml-auto"
        >
          {uploading ? "Uploading..." : "Upload to Backend"}
        </Button>
      </div>
    </Card>
  )
}
