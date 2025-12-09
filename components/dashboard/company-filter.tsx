"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building2, RefreshCw } from "lucide-react"

interface CompanyFilterProps {
  onSelectCompany: (company: string | null) => void
  onRefresh: () => void
}

export function CompanyFilter({ onSelectCompany, onRefresh }: CompanyFilterProps) {
  const [companies, setCompanies] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/companies", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch companies")
      const data = await res.json()
      setCompanies(data || [])
    } catch (err) {
      console.error(err)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleSelect = (company: string | null) => {
    setSelected(company)
    onSelectCompany(company)
  }

  const handleRefreshClick = async () => {
    await loadCompanies()
    onRefresh()
  }

  return (
    <Card className="p-6 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">Filter by company</h2>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Loading companies..."
                : companies.length > 0
                ? `${companies.length} companies available`
                : "No companies yet – add usage records to see them here"}
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleRefreshClick}
          disabled={loading}
          className="h-8 w-8"
          title="Refresh companies"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => handleSelect(null)}
          variant={selected === null ? "default" : "outline"}
          size="sm"
        >
          All companies
        </Button>
        {companies.map((company) => (
          <Button
            key={company}
            onClick={() => handleSelect(company)}
            variant={selected === company ? "default" : "outline"}
            size="sm"
          >
            {company}
          </Button>
        ))}
      </div>
    </Card>
  )
}
