"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface EnergyUsage {
  id: number
  company: string
  date: string
  kwh: number
  notes: string
  created_at: string
}

export function EnergyHistory({ refreshTrigger }: { refreshTrigger: number }) {
  const [history, setHistory] = useState<EnergyUsage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/history", {
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
  }, [refreshTrigger])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/delete-energy-usage", {
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

  return (
    <Card className="p-6 h-full">
      <h2 className="text-lg font-semibold mb-4">Recent Usage</h2>
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records yet</p>
        ) : (
          history.slice(0, 5).map((item) => (
            <div key={item.id} className="border rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.company}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="font-semibold text-primary">{item.kwh} kWh</p>
              {item.notes && <p className="text-muted-foreground">{item.notes}</p>}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
