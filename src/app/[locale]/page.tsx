import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { Navbar } from "@/components/Navbar"
import { MarqueeRibbon } from "./_components/MarqueeRibbon"
import { HeroSection } from "./_components/HeroSection"
import { StatsBar } from "./_components/StatsBar"
import { HowItWorksSection } from "./_components/HowItWorksSection"
import { Footer } from "@/components/Footer"
import { auth } from "@/lib/auth"
import { getPostLoginRedirectPath } from "@/lib/post-login-redirect"
import { getMe } from "@/server/services/users/get-me"

type Params = Promise<{ locale: string }>

export default async function Home({ params }: { params: Params }) {
  const [{ locale }, headersList] = await Promise.all([params, headers()])
  const session = await auth.api.getSession({ headers: headersList })

  if (session) {
    const me = await getMe({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
      onboardingCompleted: session.user.onboardingCompleted,
    })

    const redirectPath = getPostLoginRedirectPath(me)
    redirect(
      `/${locale}${redirectPath === "/" ? "/dashboard" : redirectPath}`,
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <HeroSection />
      <StatsBar />
      <HowItWorksSection />
      <Footer />
    </main>
  )
}

