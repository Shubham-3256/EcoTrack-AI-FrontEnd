"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

import { Card } from "@/components/ui/card"

import { Trash2, Edit2, Check, X } from "lucide-react"

interface EnergyUsage {
  id: number
  company: string
  date: string
  kwh: number
  notes: string
  created_at: string
}

interface Props {
  refreshTrigger: number
  selectedCompany?: string | null
  dateFrom?: string | null
  dateTo?: string | null
}

export function EnergyHistoryAdvanced({
  refreshTrigger,
  selectedCompany,
  dateFrom,
  dateTo,
}: Props) {
  const [history, setHistory] = useState<EnergyUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<EnergyUsage>>({})

  // =========================
  // FETCH HISTORY
  // =========================
  useEffect(() => {
    const controller = new AbortController()

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (selectedCompany) params.append("company", selectedCompany)
        if (dateFrom) params.append("from", dateFrom)
        if (dateTo) params.append("to", dateTo)
        const qs = params.toString()

        const data = await apiFetch<EnergyUsage[]>(
          `/history${qs ? `?${qs}` : ""}`,
          { signal: controller.signal }
        )

        if (!Array.isArray(data)) throw new Error("Invalid history response")

        setHistory(
          data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        )
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error(err)
          setError(err?.message || "Failed to load history")
          setHistory([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
    return () => controller.abort()
  }, [refreshTrigger, selectedCompany, dateFrom, dateTo])

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return

    try {
      await apiFetch("/delete-energy-usage", {
        method: "POST",
        body: JSON.stringify({ id }),
      })
      setHistory(history.filter((h) => h.id !== id))
    } catch (err: any) {
      console.error(err)
      alert(err?.message || "Failed to delete record")
    }
  }

  // =========================
  // EDIT
  // =========================
  const handleEdit = (item: EnergyUsage) => {
    setEditingId(item.id)
    setEditData({ ...item })
  }

  // =========================
  // SAVE EDIT
  // =========================
  const handleSaveEdit = async (id: number) => {
    try {
      const updated = await apiFetch<{ updated: EnergyUsage }>(
        "/update-energy-usage",
        {
          method: "POST",
          body: JSON.stringify({ id, ...editData, kwh: Number(editData.kwh) || 0 }),
        }
      )
      setHistory(history.map((h) => (h.id === id ? updated.updated : h)))
      setEditingId(null)
      setEditData({})
    } catch (err: any) {
      console.error(err)
      alert(err?.message || "Failed to update record")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-sm text-muted-foreground">Loading history...</div>
      </Card>
    )
  }

  if (error) {
    return <Card className="p-6 text-red-500">{error}</Card>
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Energy Usage History</h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records found.</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 space-y-2 text-sm">
              {editingId === item.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editData.company || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, company: e.target.value })
                      }
                      placeholder="Company"
                      className="px-2 py-1 border rounded text-xs border-input bg-background"
                    />
                    <input
                      type="date"
                      value={editData.date || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, date: e.target.value })
                      }
                      className="px-2 py-1 border rounded text-xs border-input bg-background"
                    />
                    <input
                      type="number"
                      value={editData.kwh || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, kwh: Number(e.target.value) || 0 })
                      }
                      placeholder="kWh"
                      className="px-2 py-1 border rounded text-xs border-input bg-background"
                    />
                  </div>
                  <input
                    type="text"
                    value={editData.notes || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, notes: e.target.value })
                    }
                    placeholder="Notes"
                    className="w-full px-2 py-1 border rounded text-xs border-input bg-background"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.company}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {Number(item.kwh).toFixed(2)} kWh
                    </span>
                    {item.notes && (
                      <span className="text-xs text-muted-foreground">{item.notes}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
