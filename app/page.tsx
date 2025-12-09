import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, TrendingDown, BarChart3, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">EcoTrack</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-sm hover:text-primary transition">
              Features
            </Link>
            <Link href="#benefits" className="text-sm hover:text-primary transition">
              Benefits
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-balance">Track Your Energy, Reduce Your Footprint</h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Monitor electricity consumption in real-time and visualize your carbon emissions with AI-powered predictions
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <Card className="p-6">
            <Zap className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">Energy Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Log energy usage from multiple companies and get instant CO₂ emission calculations
            </p>
          </Card>
          <Card className="p-6">
            <BarChart3 className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Visualize historical energy consumption patterns and emissions trends
            </p>
          </Card>
          <Card className="p-6">
            <TrendingDown className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">AI Predictions</h3>
            <p className="text-sm text-muted-foreground">
              Get AI-powered forecasts of future energy usage and carbon impact
            </p>
          </Card>
          <Card className="p-6">
            <Leaf className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">Eco Insights</h3>
            <p className="text-sm text-muted-foreground">
              Track progress toward sustainability goals and benchmark your impact
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section id="benefits" className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Start Tracking Today</h2>
        <p className="text-muted-foreground mb-8">Join thousands reducing their carbon footprint</p>
        <Link href="/auth/register">
          <Button size="lg">Create Free Account</Button>
        </Link>
      </section>
    </div>
  )
}
