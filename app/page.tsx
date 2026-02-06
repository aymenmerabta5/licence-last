import { Navbar } from "@/components/Navbar"
import { MarqueeRibbon } from "@/app/_components/MarqueeRibbon"
import { HeroSection } from "@/app/_components/HeroSection"
import { StatsBar } from "@/app/_components/StatsBar"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground ed-smooth">
      <Navbar />
      <MarqueeRibbon />
      <HeroSection />
      <StatsBar />
    </main>
  )
}
