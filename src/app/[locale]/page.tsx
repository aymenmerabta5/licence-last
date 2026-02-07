import { Navbar } from "@/components/Navbar"
import { MarqueeRibbon } from "./_components/MarqueeRibbon"
import { HeroSection } from "./_components/HeroSection"
import { StatsBar } from "./_components/StatsBar"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <HeroSection />
      <StatsBar />
      <Footer />
    </main>
  )
}
