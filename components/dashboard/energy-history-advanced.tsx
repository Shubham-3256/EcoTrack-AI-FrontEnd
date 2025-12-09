"use client"

import { useEffect, useState } from "react"
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

export function EnergyHistoryAdvanced({
  refreshTrigger,
  selectedCompany,
  dateFrom,
  dateTo,
}: {
  refreshTrigger: number
  selectedCompany?: string | null
  dateFrom?: string | null
  dateTo?: string | null
}) {
  const [history, setHistory] = useState<EnergyUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<EnergyUsage>>({})

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token")
        const params = new URLSearchParams()
if (selectedCompany) params.append("company", selectedCompany)
if (dateFrom) params.append("from", dateFrom)
if (dateTo) params.append("to", dateTo)

const qs = params.toString()
const url = `/api/history${qs ? `?${qs}` : ""}`

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
})

        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setHistory(
          data.sort((a: EnergyUsage, b: EnergyUsage) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        )
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [refreshTrigger, selectedCompany, dateFrom, dateTo])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/delete-energy-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setHistory(history.filter((h) => h.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (item: EnergyUsage) => {
    setEditingId(item.id)
    setEditData({ ...item })
  }

  const handleSaveEdit = async (id: number) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/update-energy-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...editData }),
      })
      if (res.ok) {
        const updated = await res.json()
        setHistory(history.map((h) => (h.id === id ? updated.updated : h)))
        setEditingId(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Energy Usage History</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records found</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 space-y-2 text-sm">
              {editingId === item.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editData.company || ""}
                      onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      placeholder="Company"
                      className="px-2 py-1 border rounded text-xs border-input bg-background"
                    />
                    <input
                      type="date"
                      value={editData.date || ""}
                      onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                      className="px-2 py-1 border rounded text-xs border-input bg-background"
                    />
                    <input
                      type="number"
                      value={editData.kwh || ""}
                      onChange={(e) => setEditData({ ...editData, kwh: Number.parseFloat(e.target.value) })}
                      placeholder="kWh"
                      className="px-2 py-1 border rounded text-xs border-input bg-background"
                    />
                  </div>
                  <input
                    type="text"
                    value={editData.notes || ""}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Notes"
                    className="w-full px-2 py-1 border rounded text-xs border-input bg-background"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="flex-1 bg-primary text-primary-foreground px-2 py-1 rounded text-xs hover:bg-primary/90"
                    >
                      <Check className="w-3 h-3 inline mr-1" /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs hover:bg-secondary/80"
                    >
                      <X className="w-3 h-3 inline mr-1" /> Cancel
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
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary/80 p-1">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:text-destructive/80 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold text-primary">{item.kwh} kWh</p>
                  {item.notes && <p className="text-muted-foreground">{item.notes}</p>}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
