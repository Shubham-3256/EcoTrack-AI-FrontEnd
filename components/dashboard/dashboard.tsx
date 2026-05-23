"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import { DashboardHeader } from "./header"
import { EnergyStats } from "./energy-stats"
import { EnergyForm } from "./energy-form"
import { CompanyFilter } from "./company-filter"
import { AdvancedPredictions } from "./advanced-predictions"
import { DateRangeFilter } from "./date-range-filter"
import { EnergyHistoryAdvanced } from "./energy-history-advanced"
import { InsightsDashboard } from "./insights-dashboard"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { EnergyCsvUpload } from "./EnergyCsvUpload"
import { GoalsCard } from "./goals-card"
import { AiTipsCard } from "./ai-tips-card"
import { BenchmarksCard } from "./benchmarks-card"
import { ExportButtons } from "./export-buttons"
import { AlertSettingsCard } from "./alert-settings-card"

import { Card } from "@/components/ui/card"

import { AlertCircle } from "lucide-react"

interface User {
  name?: string
  email?: string

  alert_email_enabled?: boolean
  alert_threshold_kwh?: number | null
}

export function Dashboard() {

  const router = useRouter()

  const [loading, setLoading] =
    useState(true)

  const [user, setUser] =
    useState<User | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const [refreshTrigger, setRefreshTrigger] =
    useState(0)

  const [selectedCompany, setSelectedCompany] =
    useState<string | null>(null)

  const [dateFrom, setDateFrom] =
    useState<string | null>(null)

  const [dateTo, setDateTo] =
    useState<string | null>(null)

  // =========================
  // AUTH + USER FETCH
  // =========================

  useEffect(() => {

    const controller =
      new AbortController()

    const loadUser =
      async () => {

        try {

          setLoading(true)
          setError(null)

          const token =
            localStorage.getItem("token")

          // No token
          if (!token) {

            router.push("/auth/login")

            return
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/auth/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              signal:
                controller.signal,
            }
          )

          if (!res.ok) {

            if (
              res.status === 401
            ) {

              localStorage.removeItem(
                "token"
              )

              router.push(
                "/auth/login"
              )

              return
            }

            throw new Error(
              `Authentication failed (${res.status})`
            )
          }

          const data =
            await res.json()

          setUser(
            data.user || null
          )

        } catch (err: any) {

          if (
            err?.name !==
            "AbortError"
          ) {

            console.error(err)

            setError(
              err?.message ||
              "Failed to load dashboard"
            )
          }

        } finally {

          setLoading(false)
        }
      }

    loadUser()

    return () => {
      controller.abort()
    }

  }, [router])

  // =========================
  // REFRESH
  // =========================

  const refresh = () => {

    setRefreshTrigger(
      (prev) => prev + 1
    )
  }

  // =========================
  // CLEAR DATE FILTER
  // =========================

  const clearDateFilter =
    () => {

      setDateFrom(null)

      setDateTo(null)

      refresh()
    }

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">

        <div className="text-center">

          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />

          <p className="text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  // =========================
  // ERROR
  // =========================

  if (error) {

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">

        <Card className="p-6 max-w-md w-full">

          <div className="flex gap-3">

            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />

            <div>

              <h2 className="font-semibold text-red-500 mb-1">
                Dashboard Error
              </h2>

              <p className="text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <DashboardHeader user={user} />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Top stats */}
        <EnergyStats
          refreshTrigger={refreshTrigger}
          selectedCompany={
            selectedCompany || undefined
          }
        />

        {/* Goals + AI tips */}
        <section className="grid lg:grid-cols-2 gap-6">

          <GoalsCard
            refreshTrigger={refreshTrigger}
          />

          <AiTipsCard
            refreshTrigger={refreshTrigger}
          />
        </section>

        {/* Filters */}
        <div className="grid lg:grid-cols-2 gap-6">

          <CompanyFilter
            onSelectCompany={
              setSelectedCompany
            }

            onRefresh={refresh}
          />

          <DateRangeFilter
            onFilter={(
              from,
              to
            ) => {

              setDateFrom(from)

              setDateTo(to)
            }}
          />
        </div>

        {/* Filter summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">

          <span>

            <span className="font-medium">
              {selectedCompany ||
                "All companies"}
            </span>

            {dateFrom || dateTo
              ? ` · ${dateFrom || "start"} – ${
                  dateTo || "latest"
                }`
              : " · No date filter"}
          </span>

          {(dateFrom || dateTo) && (

            <button
              className="underline underline-offset-2 hover:text-foreground"

              onClick={
                clearDateFilter
              }
            >
              Clear date range
            </button>
          )}
        </div>

        {/* Data entry */}
        <section className="space-y-3">

          <h2 className="text-base font-semibold">
            Data Input
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">

            <EnergyForm
              onSuccess={refresh}
            />

            <EnergyCsvUpload
              onImportComplete={
                refresh
              }
            />
          </div>
        </section>

        {/* Predictions */}
        <AdvancedPredictions
          selectedCompany={
            selectedCompany || undefined
          }
        />

        {/* Analytics */}
        <AnalyticsDashboard
          selectedCompany={
            selectedCompany
          }

          dateFrom={dateFrom}

          dateTo={dateTo}

          refreshTrigger={
            refreshTrigger
          }
        />

        {/* Insights */}
        <InsightsDashboard
          selectedCompany={
            selectedCompany
          }

          dateFrom={dateFrom}

          dateTo={dateTo}
        />

        {/* Benchmarks */}
        <BenchmarksCard
          dateFrom={dateFrom}
          dateTo={dateTo}
          refreshTrigger={
            refreshTrigger
          }
        />

        {/* Export + Alerts */}
        <section className="grid lg:grid-cols-2 gap-6">

          <ExportButtons />

          <AlertSettingsCard
            user={user}
          />
        </section>

        {/* History */}
        <EnergyHistoryAdvanced
          refreshTrigger={
            refreshTrigger
          }

          selectedCompany={
            selectedCompany
          }

          dateFrom={dateFrom}

          dateTo={dateTo}
        />
      </main>
    </div>
  )
}