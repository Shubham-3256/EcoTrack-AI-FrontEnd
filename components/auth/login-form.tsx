
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

import Link from "next/link"

import {
  signInWithEmailAndPassword
} from "firebase/auth"

import { auth } from "@/lib/firebase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

import {
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react"

export function LoginForm() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] =
    useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault()

    setError("")
    setLoading(true)

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      router.push("/dashboard")

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Login failed"
      )

    } finally {

      setLoading(false)
    }
  }

  return (

    <Card className="p-6">

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        {error && (

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">

            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />

            <p className="text-sm text-destructive">
              {error}
            </p>

          </div>
        )}

        <div className="space-y-2">

          <label className="text-sm font-medium">
            Email
          </label>

          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

        </div>

        <div className="space-y-2">

          <div className="flex items-center justify-between">

            <label className="text-sm font-medium">
              Password
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          <div className="relative">

            <Input
              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="••••••••"

              value={password}

              onChange={(e) =>
                setPassword(e.target.value)
              }

              required

              className="pr-10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }

              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >

              {showPassword ? (

                <EyeOff className="w-4 h-4" />

              ) : (

                <Eye className="w-4 h-4" />

              )}

            </button>

          </div>

        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >

          {loading ? (

            <Loader2 className="w-4 h-4 animate-spin" />

          ) : (

            "Sign In"

          )}

        </Button>

      </form>

    </Card>
  )
}
