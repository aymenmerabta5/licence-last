import { Suspense } from "react"

import { Navbar } from "@/components/Navbar"
import { MarqueeRibbon } from "./_components/MarqueeRibbon"
import { HeroSection } from "./_components/HeroSection"
import { StatsBar } from "./_components/StatsBar"
import { HowItWorksSection } from "./_components/HowItWorksSection"
import { Footer } from "@/components/Footer"
import { AuthRedirect } from "./_components/AuthRedirect"

type Params = Promise<{ locale: string }>

export default async function Home({ params }: { params: Params }) {
  const { locale } = await params

  return (
    <>
      {/* Auth check with redirect - wrapped in Suspense for cacheComponents compatibility */}
      <Suspense fallback={null}>
        <AuthRedirect locale={locale} />
      </Suspense>

      <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <Navbar />
        <MarqueeRibbon />
        <HeroSection />
        <StatsBar />
        <HowItWorksSection />
        <Footer />
      </main>
    </>
  )
}

