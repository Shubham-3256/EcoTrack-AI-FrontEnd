"use client"

import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Bell,
  BellOff,
  Check,
} from "lucide-react"

interface User {
  alert_email_enabled?: boolean
  alert_threshold_kwh?: number | null
}

interface Props {
  user: User | null
}

export function AlertSettingsCard({
  user,
}: Props) {

  const [enabled, setEnabled] =
    useState(false)

  const [threshold, setThreshold] =
    useState("")

  const [saving, setSaving] =
    useState(false)

  const [saved, setSaved] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  // =========================
  // INITIALIZE FROM USER
  // =========================

  useEffect(() => {

    if (user) {

      setEnabled(
        user.alert_email_enabled ?? false
      )

      setThreshold(
        user.alert_threshold_kwh?.toString() || ""
      )
    }

  }, [user])

  // =========================
  // SAVE
  // =========================

  const save =
    async () => {

      try {

        setSaving(true)
        setError(null)
        setSaved(false)

        const token =
          localStorage.getItem("token")

        if (!token) {
          throw new Error(
            "Authentication token missing"
          )
        }

        const parsedThreshold =
          threshold.trim()
            ? parseFloat(threshold)
            : null

        if (
          parsedThreshold !== null &&
          Number.isNaN(parsedThreshold)
        ) {
          throw new Error(
            "Threshold must be a valid number"
          )
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/user/settings`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              alert_email_enabled:
                enabled,

              alert_threshold_kwh:
                parsedThreshold,
            }),
          }
        )

        if (!res.ok) {

          let message =
            "Failed to save settings"

          try {

            const data =
              await res.json()

            message =
              data.error ||
              message

          } catch {}

          throw new Error(message)
        }

        setSaved(true)

        setTimeout(() => {
          setSaved(false)
        }, 2000)

      } catch (err: any) {

        console.error(err)

        setError(
          err?.message ||
          "Failed to save settings"
        )

      } finally {

        setSaving(false)
      }
    }

  // =========================
  // UI
  // =========================

  return (
    <Card className="p-5 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">

        {enabled ? (

          <Bell className="w-4 h-4 text-amber-500" />

        ) : (

          <BellOff className="w-4 h-4 text-muted-foreground" />
        )}

        <h2 className="text-sm font-semibold">
          Email Alerts
        </h2>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-2">

        <button
          onClick={() =>
            setEnabled(!enabled)
          }

          className={`relative w-9 h-5 rounded-full transition-colors ${
            enabled
              ? "bg-green-500"
              : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              enabled
                ? "translate-x-4"
                : ""
            }`}
          />
        </button>

        <span className="text-xs text-muted-foreground">

          {enabled
            ? "Alerts enabled"
            : "Alerts disabled"}
        </span>
      </div>

      {/* Threshold */}
      {enabled && (

        <div className="space-y-1">

          <label className="text-xs font-medium text-muted-foreground">
            Alert when monthly usage exceeds (kWh)
          </label>

          <Input
            type="number"

            placeholder="e.g. 600"

            value={threshold}

            onChange={(e) =>
              setThreshold(
                e.target.value
              )
            }

            className="h-8 text-sm"
          />
        </div>
      )}

      {/* Error */}
      {error && (

        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Success */}
      {saved && (

        <div className="flex items-center gap-2 text-sm text-green-600">

          <Check className="w-4 h-4" />

          Settings saved successfully
        </div>
      )}

      {/* Save button */}
      <Button
        onClick={save}

        disabled={saving}

        className="w-full"
      >
        {saving
          ? "Saving..."
          : "Save Settings"}
      </Button>
    </Card>
  )
}