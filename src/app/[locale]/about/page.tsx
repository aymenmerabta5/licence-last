import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { MarqueeRibbon } from "@/app/[locale]/_components/MarqueeRibbon"
import { AboutContent } from "@/app/[locale]/about/_components/AboutContent"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pages.about" })
  return { title: t("metadata.title"), description: t("metadata.description") }
}

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <AboutContent />
      <Footer />
    </main>
  )
}
