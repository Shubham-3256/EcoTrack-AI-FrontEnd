"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"

export function RegisterForm() {
  const [email, setEmail]               = useState("")
  const [name, setName]                 = useState("")
  const [password, setPassword]         = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState("")
  const [loading, setLoading]           = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)

    try {
      // 1. Create Firebase user
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      )

      // 2. Save display name
      if (name.trim()) {
        await updateProfile(credential.user, {
          displayName: name.trim(),
        })
      }

      // 3. Force-fetch the ID token so Firebase auth state is fully
      //    committed before we navigate. Without this, the dashboard
      //    auth guard sees no user and bounces back to login.
      await credential.user.getIdToken(true)

      // 4. Now it is safe to navigate
      router.push("/dashboard")

    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ""

      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try signing in instead.")
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 8 characters.")
      } else {
        setError(
          err instanceof Error ? err.message : "Registration failed. Please try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : "Create Account"}
        </Button>

      </form>
    </Card>
  )
}