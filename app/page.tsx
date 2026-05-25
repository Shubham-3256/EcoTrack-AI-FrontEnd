import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, TrendingDown, BarChart3, Zap } from "lucide-react"

const impactImages = [
  {
    src: "/eco/green-valley.png",
    alt: "Green valley with a lake, wind turbine, and solar panels",
    title: "Renewable Forecasts",
    description: "Plan around clean-energy availability and peak demand patterns.",
  },
  {
    src: "/eco/planet-home.png",
    alt: "Eco home with solar panels on a forested planet landscape",
    title: "Carbon Context",
    description: "Turn household and company energy data into readable carbon impact.",
  },
  {
    src: "/eco/solar-cottage-wide.png",
    alt: "Solar powered eco cottage surrounded by gardens and wind turbines",
    title: "Smarter Facilities",
    description: "Compare electricity usage across sites, teams, and operating periods.",
  },
]

const galleryImages = [
  {
    src: "/eco/solar-cottage-close.png",
    alt: "Close view of an eco-friendly house with rooftop solar panels",
  },
  {
    src: "/eco/forest-restoration.png",
    alt: "People planting a tree in a forest restoration project",
  },
  {
    src: "/eco/eco-neighborhood.png",
    alt: "Walkable eco neighborhood with solar roofs and green buildings",
  },
  {
    src: "/eco/solar-farm.png",
    alt: "Large solar farm in a rural landscape",
  },
  {
    src: "/eco/green-city.png",
    alt: "Green city street with solar rooftops, cyclists, and transit",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
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
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <Image
          src="/eco/regeneration-hands.png"
          alt="Hands holding a young plant in a green renewable-energy landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 min-h-[calc(100vh-4rem)] flex items-center">
          <div className="max-w-2xl text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Track Your Energy, Reduce Your Footprint
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/85 mb-8 text-balance">
              Monitor electricity consumption in real time and visualize your carbon emissions with AI-powered
              predictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="secondary">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 rounded-lg">
            <Zap className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">Energy Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Log energy usage from multiple companies and get instant CO2 emission calculations.
            </p>
          </Card>
          <Card className="p-6 rounded-lg">
            <BarChart3 className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Visualize historical energy consumption patterns and emissions trends.
            </p>
          </Card>
          <Card className="p-6 rounded-lg">
            <TrendingDown className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">AI Predictions</h3>
            <p className="text-sm text-muted-foreground">
              Get AI-powered forecasts of future energy usage and carbon impact.
            </p>
          </Card>
          <Card className="p-6 rounded-lg">
            <Leaf className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">Eco Insights</h3>
            <p className="text-sm text-muted-foreground">
              Track progress toward sustainability goals and benchmark your impact.
            </p>
          </Card>
        </div>
      </section>

      {/* Impact Imagery */}
      <section className="bg-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">See energy data in the real world</h2>
            <p className="text-muted-foreground text-lg">
              EcoTrack connects daily electricity decisions to larger sustainability outcomes, from homes and offices to
              renewable infrastructure.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {impactImages.map((image) => (
              <article key={image.src} className="overflow-hidden rounded-lg border bg-card">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-2">{image.title}</h3>
                  <p className="text-sm text-muted-foreground">{image.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Built for cleaner operations</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Use the landing page imagery to reinforce the product story across solar adoption, forest restoration,
              efficient communities, and low-carbon cities.
            </p>
            <Link href="/auth/register">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={image.src}
                className={`relative overflow-hidden rounded-lg border bg-muted ${
                  index === 0 || index === 4 ? "sm:col-span-2 aspect-[16/7]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="benefits" className="bg-primary text-primary-foreground px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Start Tracking Today</h2>
        <p className="text-primary-foreground/80 mb-8">Join thousands reducing their carbon footprint.</p>
        <Link href="/auth/register">
          <Button size="lg" variant="secondary">
            Create Free Account
          </Button>
        </Link>
      </section>
    </div>
  )
}
