"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Leaf, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError]     = useState("")

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setError("Please enter your email address.")
      return
    }

    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, trimmed, {
        // After the user resets their password, Firebase redirects here
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false,
      })

      setMessage(
        "Reset email sent! Check your inbox (and spam folder). Redirecting to login…"
      )

      setTimeout(() => router.push("/auth/login"), 4000)
    } catch (err: unknown) {
      // Map Firebase error codes to readable messages
      const code = (err as { code?: string })?.code ?? ""

      if (code === "auth/user-not-found") {
        // Don't reveal account existence — show the same success message
        setMessage(
          "Reset email sent! Check your inbox (and spam folder). Redirecting to login…"
        )
        setTimeout(() => router.push("/auth/login"), 4000)
      } else if (code === "auth/invalid-email") {
        setError("That doesn't look like a valid email address.")
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.")
      } else {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">EcoTrack</span>
          </Link>
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground mt-2">
            Firebase will send a reset link to your inbox
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!message}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !!message}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </Button>

          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}