"use client"

import { useEffect, useState } from "react"
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

function RadialRing({
  pct,
  label,
  value,
  target,
  unit,
  color,
}: {
  pct: number | null
  label: string
  value: number
  target: number | null
  unit: string
  color: string
}) {
  const r = 38
  const circ = 2 * Math.PI * r
  const filled = pct !== null ? Math.min(pct / 100, 1) : 0
  const dash = filled * circ
  const ringColor =
    pct === null ? "var(--color-border-secondary)" :
    pct > 100    ? "#ef4444" :
    pct > 80     ? "#f59e0b" : "#22c55e"

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* track */}
        <circle cx="50" cy="50" r={r} fill="none"
          stroke="var(--color-border-tertiary)" strokeWidth="8" />
        {/* filled arc */}
        <circle cx="50" cy="50" r={r} fill="none"
          stroke={ringColor} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        {/* percentage text */}
        <text x="50" y="46" textAnchor="middle"
          fontSize="14" fontWeight="bold" fill="var(--color-text-primary)">
          {pct !== null ? `${Math.round(pct)}%` : "—"}
        </text>
        <text x="50" y="60" textAnchor="middle"
          fontSize="8" fill="var(--color-text-secondary)">
          {label}
        </text>
      </svg>
      <div className="text-center">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {value.toFixed(1)} {unit}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {target !== null ? `of ${target.toFixed(0)} ${unit}` : "no target set"}
        </p>
      </div>
    </div>
  )
}

export function GoalsCard({ refreshTrigger }: { refreshTrigger: number }) {
  const [goal, setGoal]       = useState<GoalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [kwhInput, setKwhInput] = useState("")
  const [co2Input, setCo2Input] = useState("")
  const [saving, setSaving]   = useState(false)

  const thisMonth = new Date().toISOString().slice(0, 7)

  const fetchGoal = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/goals?month=${thisMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      setGoal(data.goal)
      if (data.goal) {
        setKwhInput(data.goal.kwh_target?.toString() ?? "")
        setCo2Input(data.goal.co2_target_kg?.toString() ?? "")
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchGoal() }, [refreshTrigger])

  const save = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          month: thisMonth,
          kwh_target:    kwhInput ? parseFloat(kwhInput) : null,
          co2_target_kg: co2Input ? parseFloat(co2Input) : null,
        }),
      })
      setEditing(false)
      await fetchGoal()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const monthLabel = new Date(thisMonth + "-01").toLocaleString("default", {
    month: "long", year: "numeric",
  })

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[var(--color-text-success)]" />
          <h2 className="text-base font-semibold">Sustainability goals</h2>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--color-text-secondary)]">{monthLabel}</span>
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
                <Check className="w-3.5 h-3.5 text-[var(--color-text-success)]" />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[var(--color-background-secondary)]">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">kWh target</label>
            <Input type="number" placeholder="e.g. 500" value={kwhInput}
              onChange={e => setKwhInput(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">CO₂ target (kg)</label>
            <Input type="number" placeholder="e.g. 200" value={co2Input}
              onChange={e => setCo2Input(e.target.value)} className="h-8 text-sm" />
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-32 flex items-center justify-center text-sm text-[var(--color-text-secondary)]">
          Loading...
        </div>
      ) : (
        <div className="flex justify-around py-2">
          <RadialRing
            pct={goal?.kwh_pct ?? null}
            label="kWh"
            value={goal?.actual_kwh ?? 0}
            target={goal?.kwh_target ?? null}
            unit="kWh"
            color="blue"
          />
          <RadialRing
            pct={goal?.co2_pct ?? null}
            label="CO₂"
            value={goal?.actual_co2_kg ?? 0}
            target={goal?.co2_target_kg ?? null}
            unit="kg"
            color="green"
          />
        </div>
      )}

      {goal && (goal.kwh_pct ?? 0) > 100 && (
        <p className="text-xs text-red-500 text-center font-medium">
          ⚠ Monthly target exceeded — consider reducing usage
        </p>
      )}
      {(!goal || (goal.kwh_target === null && goal.co2_target_kg === null)) && !editing && (
        <p className="text-xs text-center text-[var(--color-text-secondary)]">
          Click <Pencil className="inline w-3 h-3" /> to set your monthly targets
        </p>
      )}
    </Card>
  )
}
