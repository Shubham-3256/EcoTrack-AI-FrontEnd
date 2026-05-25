"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiFetch } from "@/lib/api"

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

  // Firebase auth state from context — loading=true until Firebase
  // has restored the session, user=null if not signed in
  const { user: firebaseUser, loading: authLoading } = useAuth()

  const [dbUser, setDbUser]               = useState<User | null>(null)
  const [userLoading, setUserLoading]     = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [dateFrom, setDateFrom]           = useState<string | null>(null)
  const [dateTo, setDateTo]               = useState<string | null>(null)

  // ── Auth guard + user fetch ──────────────────────────────────────────────
  useEffect(() => {
    // Still waiting for Firebase to restore session — do nothing yet
    if (authLoading) return

    // Firebase confirmed: no user → redirect to login
    if (!firebaseUser) {
      router.push("/auth/login")
      return
    }

    // Firebase user exists — fetch the DB profile via backend
    const controller = new AbortController()

    const loadUser = async () => {
      try {
        setUserLoading(true)
        setError(null)

        // apiFetch automatically attaches the Firebase Bearer token
        const data = await apiFetch<{ user: User }>("/auth/me", {
          signal: controller.signal,
        })
        setDbUser(data.user ?? null)
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error(err)
          setError(err?.message || "Failed to load dashboard")
        }
      } finally {
        setUserLoading(false)
      }
    }

    loadUser()
    return () => controller.abort()

  }, [authLoading, firebaseUser, router])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const refresh = () => setRefreshTrigger((n) => n + 1)

  const clearDateFilter = () => {
    setDateFrom(null)
    setDateTo(null)
    refresh()
  }

  // ── Loading states ───────────────────────────────────────────────────────
  // Show spinner while Firebase restores session OR while fetching DB user
  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-6 max-w-md w-full">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-red-500 mb-1">Dashboard Error</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      <DashboardHeader user={dbUser} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        <EnergyStats
          refreshTrigger={refreshTrigger}
          selectedCompany={selectedCompany || undefined}
        />

        <section className="grid lg:grid-cols-2 gap-6">
          <GoalsCard refreshTrigger={refreshTrigger} />
          <AiTipsCard refreshTrigger={refreshTrigger} />
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <CompanyFilter
            onSelectCompany={setSelectedCompany}
            onRefresh={refresh}
          />
          <DateRangeFilter
            onFilter={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <span>
            <span className="font-medium">
              {selectedCompany || "All companies"}
            </span>
            {dateFrom || dateTo
              ? ` · ${dateFrom || "start"} – ${dateTo || "latest"}`
              : " · No date filter"}
          </span>
          {(dateFrom || dateTo) && (
            <button
              className="underline underline-offset-2 hover:text-foreground"
              onClick={clearDateFilter}
            >
              Clear date range
            </button>
          )}
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">Data Input</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <EnergyForm onSuccess={refresh} />
            <EnergyCsvUpload onImportComplete={refresh} />
          </div>
        </section>

        <AdvancedPredictions selectedCompany={selectedCompany || undefined} />

        <AnalyticsDashboard
          selectedCompany={selectedCompany}
          dateFrom={dateFrom}
          dateTo={dateTo}
          refreshTrigger={refreshTrigger}
        />

        <InsightsDashboard
          selectedCompany={selectedCompany}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />

        <BenchmarksCard
          dateFrom={dateFrom}
          dateTo={dateTo}
          refreshTrigger={refreshTrigger}
        />

        <section className="grid lg:grid-cols-2 gap-6">
          <ExportButtons />
          <AlertSettingsCard user={dbUser} />
        </section>

        <EnergyHistoryAdvanced
          refreshTrigger={refreshTrigger}
          selectedCompany={selectedCompany}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />

      </main>
    </div>
  )
}