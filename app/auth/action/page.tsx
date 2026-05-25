"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Leaf, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ── Inner component (needs useSearchParams inside Suspense) ──────────────────

function ActionHandler() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const mode    = searchParams.get("mode")    ?? ""
  const oobCode = searchParams.get("oobCode") ?? ""

  // ── Reset Password state ───────────────────────────────────────────────────
  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [confirm, setConfirm]           = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [verifying, setVerifying]       = useState(true)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState("")
  const [success, setSuccess]           = useState(false)

  // ── On mount: verify the oobCode ──────────────────────────────────────────
  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or missing link. Please request a new one.")
      setVerifying(false)
      return
    }

    if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then((resolvedEmail) => {
          setEmail(resolvedEmail)
          setVerifying(false)
        })
        .catch(() => {
          setError("This link is invalid or has expired. Please request a new one.")
          setVerifying(false)
        })
    } else if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => {
          setSuccess(true)
          setVerifying(false)
          setTimeout(() => router.push("/auth/login"), 3000)
        })
        .catch(() => {
          setError("Email verification failed. The link may have already been used.")
          setVerifying(false)
        })
    } else {
      setError("Unknown action. Please check your link.")
      setVerifying(false)
    }
  }, [mode, oobCode, router])

  // ── Submit new password ───────────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess(true)
      setTimeout(() => router.push("/auth/login"), 3000)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ""
      if (code === "auth/expired-action-code") {
        setError("This link has expired. Please request a new password reset.")
      } else if (code === "auth/invalid-action-code") {
        setError("This link is already used or invalid. Please request a new one.")
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 8 characters.")
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Title per mode ────────────────────────────────────────────────────────
  const title = mode === "verifyEmail" ? "Verify Email" : "Set New Password"

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">EcoTrack</span>
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
          {email && mode === "resetPassword" && (
            <p className="text-muted-foreground mt-2 text-sm">
              Resetting password for <strong>{email}</strong>
            </p>
          )}
        </div>

        <Card className="p-6">

          {/* Verifying spinner */}
          {verifying && (
            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Verifying link…</span>
            </div>
          )}

          {/* Success */}
          {!verifying && success && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {mode === "verifyEmail"
                      ? "Email verified successfully!"
                      : "Password updated successfully!"}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Redirecting you to login…
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error with no form (bad/expired link) */}
          {!verifying && !success && error && !email && (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <Button
                className="w-full"
                onClick={() => router.push("/auth/forgot-password")}
              >
                Request New Reset Link
              </Button>
            </div>
          )}

          {/* Reset password form */}
          {!verifying && !success && mode === "resetPassword" && email && (
            <form onSubmit={handleReset} className="space-y-4">

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : "Update Password"}
              </Button>

            </form>
          )}

        </Card>

      </div>
    </div>
  )
}

// ── Page export (wraps in Suspense for useSearchParams) ──────────────────────

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ActionHandler />
    </Suspense>
  )
}