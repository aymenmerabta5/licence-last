import { MarqueeRibbon } from "./_components/MarqueeRibbon"
import { HeroSection } from "./_components/HeroSection"
import { StatsBar } from "./_components/StatsBar"
import { HowItWorksSection } from "./_components/HowItWorksSection"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <MarqueeRibbon />
      <HeroSection />
      <StatsBar />
      <HowItWorksSection />
    </div>
  )
}

