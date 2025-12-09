import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"
import { Leaf } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">EcoTrack</span>
          </Link>
          <h1 className="text-2xl font-bold">Get Started</h1>
          <p className="text-muted-foreground mt-2">Create an account to start tracking</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
