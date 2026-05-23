"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import {
  Building2,
  RefreshCw,
} from "lucide-react"

interface CompanyFilterProps {
  onSelectCompany: (
    company: string | null
  ) => void

  onRefresh: () => void
}

export function CompanyFilter({
  onSelectCompany,
  onRefresh,
}: CompanyFilterProps) {

  const [companies, setCompanies] =
    useState<string[]>([])

  const [selected, setSelected] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  // =========================
  // LOAD COMPANIES
  // =========================

  const loadCompanies =
    async (
      signal?: AbortSignal
    ) => {

      try {

        setLoading(true)
        setError(null)

        const token =
          localStorage.getItem("token")

        if (!token) {
          throw new Error(
            "Authentication token missing"
          )
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/companies`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            signal,
          }
        )

        if (!res.ok) {
          throw new Error(
            `Company API failed (${res.status})`
          )
        }

        const data =
          await res.json()

        setCompanies(
          Array.isArray(data)
            ? data
            : []
        )

      } catch (err: any) {

        if (
          err?.name !==
          "AbortError"
        ) {

          console.error(err)

          setError(
            err?.message ||
            "Failed to load companies"
          )

          setCompanies([])
        }

      } finally {

        setLoading(false)
      }
    }

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {

    const controller =
      new AbortController()

    loadCompanies(
      controller.signal
    )

    return () => {
      controller.abort()
    }

  }, [])

  // =========================
  // SELECT
  // =========================

  const handleSelect = (
    company: string | null
  ) => {

    setSelected(company)

    onSelectCompany(company)
  }

  // =========================
  // REFRESH
  // =========================

  const handleRefreshClick =
    async () => {

      await loadCompanies()

      onRefresh()
    }

  // =========================
  // UI
  // =========================

  return (
    <Card className="p-6 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between gap-2">

        <div className="flex items-center gap-2">

          <Building2 className="w-5 h-5 text-primary" />

          <div>

            <h2 className="text-sm font-semibold">
              Filter by Company
            </h2>

            <p className="text-xs text-muted-foreground">

              {loading
                ? "Loading companies..."
                : error
                ? "Failed to load companies"
                : companies.length > 0
                ? `${companies.length} companies available`
                : "No companies found"}
            </p>
          </div>
        </div>

        {/* Refresh */}
        <Button
          size="icon"
          variant="ghost"

          onClick={
            handleRefreshClick
          }

          disabled={loading}

          className="h-8 w-8"

          title="Refresh companies"
        >

          <RefreshCw
            className={`w-4 h-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />
        </Button>
      </div>

      {/* Error */}
      {error && (

        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-2">

        {/* All companies */}
        <Button
          onClick={() =>
            handleSelect(null)
          }

          variant={
            selected === null
              ? "default"
              : "outline"
          }

          size="sm"
        >
          All Companies
        </Button>

        {/* Company list */}
        {companies.map(
  (company: any, index) => {

    const companyName =
      typeof company === "string"
        ? company
        : company?.name ||
          company?.company ||
          `Company-${index}`

    return (

      <Button
        key={`${companyName}-${index}`}

        onClick={() =>
          handleSelect(companyName)
        }

        variant={
          selected === companyName
            ? "default"
            : "outline"
        }

        size="sm"
      >
        {String(companyName)}
      </Button>
    )
  }
)}
      </div>
    </Card>
  )
}