"use client"

import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"

interface ParsedRow {
  date: string
  kwh: number
  company: string
  notes?: string
}

interface EnergyCsvUploadProps {
  onImportComplete?: () => void
}

export function EnergyCsvUpload({
  onImportComplete,
}: EnergyCsvUploadProps) {

  const [fileName, setFileName] =
    useState<string | null>(null)

  const [parsedRows, setParsedRows] =
    useState<ParsedRow[]>([])

  const [errors, setErrors] =
    useState<string[]>([])

  const [uploading, setUploading] =
    useState(false)

  const [successCount, setSuccessCount] =
    useState(0)

  const [uploadProgress, setUploadProgress] =
    useState(0)

  // =========================
  // FILE CHANGE
  // =========================

  const handleFileChange =
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {

      const file =
        e.target.files?.[0]

      if (!file) return

      // Reset
      setErrors([])
      setParsedRows([])
      setSuccessCount(0)
      setUploadProgress(0)

      // Validate type
      if (
        !file.name
          .toLowerCase()
          .endsWith(".csv")
      ) {

        setErrors([
          "Please upload a valid CSV file.",
        ])

        return
      }

      setFileName(file.name)

      const reader =
        new FileReader()

      reader.onload =
        (event) => {

          const text = String(
            event.target?.result || ""
          )

          parseCsv(text)
        }

      reader.onerror =
        () => {

          setErrors([
            "Failed to read CSV file.",
          ])
        }

      reader.readAsText(file)
    }

  // =========================
  // CSV PARSER
  // =========================

  const parseCsv =
    (text: string) => {

      const lines =
        text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)

      if (lines.length <= 1) {

        setErrors([
          "CSV appears empty or missing rows.",
        ])

        return
      }

      const header =
        lines[0]
          .split(",")
          .map((h) =>
            h.trim().toLowerCase()
          )

      const dateIdx =
        header.indexOf("date")

      const kwhIdx =
        header.indexOf("kwh")

      const companyIdx =
        header.indexOf("company")

      const notesIdx =
        header.indexOf("notes")

      const parseErrors: string[] =
        []

      if (
        dateIdx === -1 ||
        kwhIdx === -1 ||
        companyIdx === -1
      ) {

        setErrors([
          "CSV must include date, kwh, and company columns.",
        ])

        return
      }

      const rows: ParsedRow[] =
        []

      lines
        .slice(1)
        .forEach(
          (line, index) => {

            const cols =
              line
                .split(",")
                .map((c) =>
                  c.trim()
                )

            const rowNumber =
              index + 2

            const rawDate =
              cols[dateIdx]

            const rawKwh =
              cols[kwhIdx]

            const rawCompany =
              cols[companyIdx]

            const rawNotes =
              notesIdx !== -1
                ? cols[notesIdx]
                : ""

            // Required validation
            if (
              !rawDate ||
              !rawKwh ||
              !rawCompany
            ) {

              parseErrors.push(
                `Row ${rowNumber}: missing required values`
              )

              return
            }

            // Date validation
            if (
              !/^\d{4}-\d{2}-\d{2}$/.test(
                rawDate
              )
            ) {

              parseErrors.push(
                `Row ${rowNumber}: invalid date format`
              )

              return
            }

            // kWh validation
            const parsedKwh =
              Number(rawKwh)

            if (
              Number.isNaN(
                parsedKwh
              )
            ) {

              parseErrors.push(
                `Row ${rowNumber}: invalid kWh value`
              )

              return
            }

            if (parsedKwh <= 0) {

              parseErrors.push(
                `Row ${rowNumber}: kWh must be greater than 0`
              )

              return
            }

            rows.push({
              date: rawDate,

              kwh: parsedKwh,

              company:
                rawCompany,

              notes:
                rawNotes || undefined,
            })
          }
        )

      setParsedRows(rows)
      setErrors(parseErrors)
    }

  // =========================
  // UPLOAD
  // =========================

  const handleUpload =
    async () => {

      if (
        uploading ||
        parsedRows.length === 0
      ) {
        return
      }

      try {

        setUploading(true)
        setErrors([])
        setSuccessCount(0)
        setUploadProgress(0)

        const token =
          localStorage.getItem("token")

        if (!token) {
          throw new Error(
            "Authentication token missing"
          )
        }

        let success = 0

        const uploadErrors: string[] =
          []

        for (
          let i = 0;
          i < parsedRows.length;
          i++
        ) {

          const row =
            parsedRows[i]

          try {

            const res =
              await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/save-energy-usage`,
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",

                    Authorization:
                      `Bearer ${token}`,
                  },

                  body: JSON.stringify({
                    company:
                      row.company,

                    date:
                      row.date,

                    kwh:
                      row.kwh,

                    notes:
                      row.notes,
                  }),
                }
              )

            if (!res.ok) {

              let body: any = {}

              try {

                body =
                  await res.json()

              } catch {}

              uploadErrors.push(
                `Row ${i + 2}: ${
                  body.error ||
                  `failed (${res.status})`
                }`
              )

            } else {

              success++
            }

          } catch (err: any) {

            uploadErrors.push(
              `Row ${i + 2}: ${
                err?.message ||
                "upload failed"
              }`
            )
          }

          // Progress
          setUploadProgress(
            Math.round(
              ((i + 1) /
                parsedRows.length) *
                100
            )
          )
        }

        setSuccessCount(success)
        setErrors(uploadErrors)

        if (
          success > 0 &&
          onImportComplete
        ) {

          onImportComplete()
        }

      } catch (err: any) {

        console.error(err)

        setErrors([
          err?.message ||
            "Upload failed",
        ])

      } finally {

        setUploading(false)
      }
    }

  // =========================
  // UI
  // =========================

  return (
    <Card className="p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">

        <Upload className="w-5 h-5 text-primary" />

        <div>

          <h2 className="text-lg font-semibold">
            Bulk CSV Import
          </h2>

          <p className="text-sm text-muted-foreground">
            Upload CSV with:
            {" "}
            <code>
              date,kwh,company,notes
            </code>
          </p>
        </div>
      </div>

      {/* File input */}
      <div className="flex items-center gap-3">

        <Input
          type="file"

          accept=".csv"

          onChange={
            handleFileChange
          }

          disabled={uploading}
        />

        {fileName && (

          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">

            <FileText className="w-3 h-3" />

            {fileName}
          </div>
        )}
      </div>

      {/* Parsed rows */}
      {parsedRows.length > 0 && (

        <div className="text-sm text-muted-foreground">

          Parsed{" "}

          <span className="font-semibold">
            {parsedRows.length}
          </span>

          {" "}valid rows.
        </div>
      )}

      {/* Upload progress */}
      {uploading && (

        <div className="space-y-2">

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">

            <div
              className="h-full bg-primary transition-all"

              style={{
                width:
                  `${uploadProgress}%`,
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground text-right">
            {uploadProgress}%
          </p>
        </div>
      )}

      {/* Success */}
      {successCount > 0 && (

        <div className="flex items-center gap-2 text-sm text-green-600">

          <CheckCircle2 className="w-4 h-4" />

          Successfully uploaded{" "}

          <strong>
            {successCount}
          </strong>

          {" "}rows.
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (

        <div className="border border-destructive/30 rounded-lg bg-destructive/5 p-3 max-h-40 overflow-y-auto space-y-1">

          <div className="flex items-center gap-2 text-sm text-destructive font-medium">

            <AlertCircle className="w-4 h-4" />

            Upload Issues
          </div>

          {errors.map(
            (err, index) => (

              <div
                key={index}
                className="text-xs text-destructive"
              >
                • {err}
              </div>
            )
          )}
        </div>
      )}

      {/* Upload button */}
      <div className="flex justify-end">

        <Button
          onClick={
            handleUpload
          }

          disabled={
            uploading ||
            parsedRows.length === 0
          }
        >

          {uploading ? (

            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />

              Uploading...
            </>

          ) : (

            <>
              <Upload className="w-4 h-4 mr-2" />

              Upload to Backend
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}