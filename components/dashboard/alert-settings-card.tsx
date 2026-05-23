"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, BellOff, Check } from "lucide-react"

export function AlertSettingsCard({ user }: { user: any }) {
  const [enabled, setEnabled]   = useState(false)
  const [threshold, setThreshold] = useState("")
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    if (user) {
      setEnabled(user.alert_email_enabled ?? false)
      setThreshold(user.alert_threshold_kwh?.toString() ?? "")
    }
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/user/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          alert_email_enabled: enabled,
          alert_threshold_kwh: threshold ? parseFloat(threshold) : null,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        {enabled
          ? <Bell className="w-4 h-4 text-amber-500" />
          : <BellOff className="w-4 h-4 text-[var(--color-text-secondary)]" />}
        <h2 className="text-sm font-semibold">Email alerts</h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-[var(--color-border-secondary)]"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-4" : ""}`} />
        </button>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {enabled ? "Alerts enabled" : "Alerts disabled"}
        </span>
      </div>

      {enabled && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            Alert when monthly usage exceeds (kWh)
          </label>
          <Input
            type="number"
            placeholder="e.g. 600"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      )}

      <Button size="sm" className="w-full gap-2" onClick={save} disabled={saving}>
        {saved
          ? <><Check className="w-3.5 h-3.5" /> Saved</>
          : "Save alert settings"}
      </Button>

      <p className="text-[10px] text-[var(--color-text-secondary)]">
        Requires RESEND_API_KEY on the backend · email sent to {user?.email}
      </p>
    </Card>
  )
}
