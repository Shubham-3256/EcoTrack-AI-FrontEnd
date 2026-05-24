"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const sendOTP = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/send-reset-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP")
      }

      setMessage("OTP sent to your email")
      setStep(2)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/verify-reset-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            password,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Reset failed")
      }

      setMessage("Password reset successful")

setTimeout(() => {
  router.push("/auth/login")
}, 1500)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold">
          Forgot Password
        </h1>

        {message && (
          <p className="text-green-600 text-sm">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-600 text-sm">
            {error}
          </p>
        )}

        {step === 1 && (
          <>
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <Button
              className="w-full"
              onClick={sendOTP}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
            />

<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    placeholder="New Password"
    value={password}
    onChange={(e) =>
      setPassword(e.target.value)
    }
    className="pr-10"
  />

  <button
    type="button"
    onClick={() =>
      setShowPassword(!showPassword)
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


            <Button
              className="w-full"
              onClick={resetPassword}
              disabled={loading}
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
