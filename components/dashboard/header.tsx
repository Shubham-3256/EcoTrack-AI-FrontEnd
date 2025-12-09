"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Leaf, LogOut } from "lucide-react"

export function DashboardHeader({ user }: { user: any }) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  const initials =
    (user?.name || user?.email || "?")
      .toString()
      .trim()
      .charAt(0)
      .toUpperCase() || "?"

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand + subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-tight">EcoTrack</span>
            <span className="text-xs text-muted-foreground">
              Smart energy & emissions dashboard
            </span>
          </div>
        </div>

        {/* User section */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-medium">
              {user?.name || user?.email || "User"}
            </p>
            {user?.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>

          {/* Simple avatar */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-xs font-semibold">
            {initials}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
