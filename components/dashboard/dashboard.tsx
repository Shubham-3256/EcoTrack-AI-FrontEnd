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
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { EnergyCsvUpload } from "./EnergyCsvUpload"

export function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<string | null>(null)
  const [dateTo, setDateTo] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch user")
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        console.error(err)
        localStorage.removeItem("token")
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const clearDateFilter = () => {
    setDateFrom(null)
    setDateTo(null)
    setRefreshTrigger((r) => r + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {error && (
          <Card className="mb-2 p-4 bg-destructive/10 border-destructive/20 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </Card>
        )}

        {/* Top stats */}
        <EnergyStats
          refreshTrigger={refreshTrigger}
          selectedCompany={selectedCompany ?? undefined}
        />

        {/* Filters */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CompanyFilter
            onSelectCompany={setSelectedCompany}
            onRefresh={() => setRefreshTrigger((r) => r + 1)}
          />
          <DateRangeFilter
            onFilter={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
          />
        </div>

        {/* Filter summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <div>
            <span className="font-medium">
              {selectedCompany || "All companies"}
            </span>
            {dateFrom || dateTo ? (
              <>
                {" · "}
                <span>
                  Range: {dateFrom || "start"} – {dateTo || "latest"}
                </span>
              </>
            ) : (
              <span className="ml-1">· No date filter</span>
            )}
          </div>
          {(dateFrom || dateTo) && (
            <button
              className="underline underline-offset-2 hover:text-foreground"
              onClick={clearDateFilter}
            >
              Clear date range
            </button>
          )}
        </div>

        {/* Data entry + CSV import */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Data input</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <EnergyForm onSuccess={() => setRefreshTrigger((r) => r + 1)} />
            <EnergyCsvUpload
              onImportComplete={() => setRefreshTrigger((r) => r + 1)}
            />
          </div>
        </section>

        {/* Analytics */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Advanced analytics</h2>
          <AnalyticsDashboard
            selectedCompany={selectedCompany}
            dateFrom={dateFrom}
            dateTo={dateTo}
            refreshTrigger={refreshTrigger}
          />
        </section>

        {/* Predictions + history */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdvancedPredictions
              selectedCompany={selectedCompany ?? undefined}
            />
          </div>
          <div>
            <EnergyHistoryAdvanced
              refreshTrigger={refreshTrigger}
              selectedCompany={selectedCompany}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          </div>
        </section>

        {/* Insights */}
        <section>
          <InsightsDashboard
            selectedCompany={selectedCompany}
            dateFrom={dateFrom}
            dateTo={dateTo}
            refreshTrigger={refreshTrigger}
          />
        </section>
      </main>
    </div>
  )
}
