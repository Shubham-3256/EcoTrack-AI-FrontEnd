import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Leaf } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">EcoTrack</span>
          </Link>

          <h1 className="text-2xl font-bold">
            Forgot Password
          </h1>

          <p className="text-muted-foreground mt-2">
            Enter your email to reset password
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
          />

          <Button className="w-full">
            Send Reset Link
          </Button>
        </Card>
      </div>
    </div>
  )
}