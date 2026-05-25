"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Target, Pencil, Check, X } from "lucide-react"

interface GoalData {
  id: number
  month: string
  kwh_target: number | null
  co2_target_kg: number | null
  actual_kwh: number
  actual_co2_kg: number
  kwh_pct: number | null
  co2_pct: number | null
}

interface Props {
  refreshTrigger: number
}

function RadialRing({
  pct,
  label,
  value,
  target,
  unit,
}: {
  pct: number | null
  label: string
  value: number
  target: number | null
  unit: string
}) {
  const r = 38
  const circ = 2 * Math.PI * r
  const filled = pct !== null ? Math.min(pct / 100, 1) : 0
  const dash = filled * circ

  const ringColor =
    pct === null
      ? "var(--color-border-secondary)"
      : pct > 100
      ? "#ef4444"
      : pct > 80
      ? "#f59e0b"
      : "#22c55e"

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-border-tertiary)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text
          x="50"
          y="46"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="var(--color-text-primary)"
        >
          {pct !== null ? `${Math.round(pct)}%` : "—"}
        </text>
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="8"
          fill="var(--color-text-secondary)"
        >
          {label}
        </text>
      </svg>
      <div className="text-center">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {value.toFixed(1)} {unit}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {target !== null ? `of ${target.toFixed(0)} ${unit}` : "No target set"}
        </p>
      </div>
    </div>
  )
}

export function GoalsCard({ refreshTrigger }: Props) {
  const [goal, setGoal] = useState<GoalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kwhInput, setKwhInput] = useState("")
  const [co2Input, setCo2Input] = useState("")

  const thisMonth = new Date().toISOString().slice(0, 7)

  // =========================
  // FETCH GOAL
  // =========================
  const fetchGoal = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiFetch<{ goal?: GoalData }>(`/goals?month=${thisMonth}`)
      const fetchedGoal = data.goal || null
      setGoal(fetchedGoal)

      if (fetchedGoal) {
        setKwhInput(fetchedGoal.kwh_target?.toString() || "")
        setCo2Input(fetchedGoal.co2_target_kg?.toString() || "")
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to load goals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoal()
  }, [refreshTrigger])

  // =========================
  // SAVE
  // =========================
  const save = async () => {
    try {
      setSaving(true)
      setError(null)

      await apiFetch("/goals", {
        method: "POST",
        body: JSON.stringify({
          month: thisMonth,
          kwh_target: kwhInput ? parseFloat(kwhInput) : null,
          co2_target_kg: co2Input ? parseFloat(co2Input) : null,
        }),
      })

      setEditing(false)
      await fetchGoal()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to save goal")
    } finally {
      setSaving(false)
    }
  }

  const monthLabel = new Date(thisMonth + "-01").toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Loading goals...
        </div>
      </Card>
    )
  }

  if (error) {
    return <Card className="p-6 text-red-500">{error}</Card>
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          <h2 className="text-base font-semibold">Sustainability Goals</h2>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{monthLabel}</span>

          {!editing ? (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={save} disabled={saving}>
                <Check className="w-3.5 h-3.5 text-green-500" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Inputs */}
      {editing && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="kWh target"
            value={kwhInput}
            onChange={(e) => setKwhInput(e.target.value)}
          />
          <Input
            type="number"
            placeholder="CO₂ target"
            value={co2Input}
            onChange={(e) => setCo2Input(e.target.value)}
          />
        </div>
      )}

      {/* Rings */}
      <div className="grid grid-cols-2 gap-6">
        <RadialRing
          pct={goal?.kwh_pct ?? null}
          label="Energy"
          value={goal?.actual_kwh ?? 0}
          target={goal?.kwh_target ?? null}
          unit="kWh"
        />
        <RadialRing
          pct={goal?.co2_pct ?? null}
          label="CO₂"
          value={goal?.actual_co2_kg ?? 0}
          target={goal?.co2_target_kg ?? null}
          unit="kg"
        />
      </div>
    </Card>
  )
}
