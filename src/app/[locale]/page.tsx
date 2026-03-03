import { Suspense } from "react"
import { AuthRedirect } from "@/app/[locale]/_components/AuthRedirect"
import { HeroSection } from "@/app/[locale]/_components/HeroSection"
import { HowItWorksSection } from "@/app/[locale]/_components/HowItWorksSection"
import { MarqueeRibbon } from "@/app/[locale]/_components/MarqueeRibbon"
import { StatsBar } from "@/app/[locale]/_components/StatsBar"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

type Params = Promise<{ locale: string }>

export default async function Home({ params }: { params: Params }) {
  const { locale } = await params

  return (
    <>
      {/* Auth check with redirect - wrapped in Suspense for cacheComponents compatibility */}
      <Suspense fallback={null}>
        <AuthRedirect locale={locale} />
      </Suspense>

      <main className="min-h-screen overflow-x-clip bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
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
