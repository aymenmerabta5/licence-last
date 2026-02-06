import { Navbar } from "@/components/Navbar"
import { MarqueeRibbon } from "./_components/MarqueeRibbon"
import { HeroSection } from "./_components/HeroSection"
import { StatsBar } from "./_components/StatsBar"

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
