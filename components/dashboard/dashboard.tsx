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

export function Dashboard() {
  const [loading, setLoading]               = useState(true)
  const [user, setUser]                     = useState<any>(null)
  const [error, setError]                   = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [dateFrom, setDateFrom]             = useState<string | null>(null)
  const [dateTo, setDateTo]                 = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/auth/login"); return }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error("Unauthorized"); return r.json() })
      .then(d => setUser(d.user))
      .catch(() => { localStorage.removeItem("token"); router.push("/auth/login") })
      .finally(() => setLoading(false))
  }, [router])

  const refresh = () => setRefreshTrigger(r => r + 1)
  const clearDateFilter = () => { setDateFrom(null); setDateTo(null); refresh() }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive/20 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* ── Top stats ─────────────────────────────────────────────────── */}
        <EnergyStats refreshTrigger={refreshTrigger} selectedCompany={selectedCompany ?? undefined} />

        {/* ── Goals + AI tips ───────────────────────────────────────────── */}
        <section className="grid lg:grid-cols-2 gap-6">
          <GoalsCard refreshTrigger={refreshTrigger} />
          <AiTipsCard refreshTrigger={refreshTrigger} />
        </section>

        {/* ── Filters ───────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CompanyFilter onSelectCompany={setSelectedCompany} onRefresh={refresh} />
          <DateRangeFilter onFilter={(from, to) => { setDateFrom(from); setDateTo(to) }} />
        </div>

        {/* filter summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <span>
            <span className="font-medium">{selectedCompany || "All companies"}</span>
            {dateFrom || dateTo
              ? ` · ${dateFrom || "start"} – ${dateTo || "latest"}`
              : " · No date filter"}
          </span>
          {(dateFrom || dateTo) && (
            <button className="underline underline-offset-2 hover:text-foreground" onClick={clearDateFilter}>
              Clear date range
            </button>
          )}
        </div>

        {/* ── Data entry ────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Data input</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <EnergyForm onSuccess={refresh} />
            <EnergyCsvUpload onImportComplete={refresh} />
          </div>
        </section>

        {/* ── Company benchmarking ──────────────────────────────────────── */}
        <section>
          <BenchmarksCard dateFrom={dateFrom} dateTo={dateTo} refreshTrigger={refreshTrigger} />
        </section>

        {/* ── Analytics ─────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold">Advanced analytics</h2>
          <AnalyticsDashboard
            selectedCompany={selectedCompany}
            dateFrom={dateFrom}
            dateTo={dateTo}
            refreshTrigger={refreshTrigger}
          />
        </section>

        {/* ── Forecast + history ────────────────────────────────────────── */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdvancedPredictions selectedCompany={selectedCompany ?? undefined} />
          </div>
          <EnergyHistoryAdvanced
            refreshTrigger={refreshTrigger}
            selectedCompany={selectedCompany}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </section>

        {/* ── Insights ──────────────────────────────────────────────────── */}
        <InsightsDashboard
          selectedCompany={selectedCompany}
          dateFrom={dateFrom}
          dateTo={dateTo}
          refreshTrigger={refreshTrigger}
        />

        {/* ── Settings + Export ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold mb-4">Account &amp; export</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AlertSettingsCard user={user} />
            <ExportButtons />
          </div>
        </section>

      </main>
    </div>
  )
}
