import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { DiscoverContent } from "@/app/[locale]/discover/_components/DiscoverContent"
import { MarqueeRibbon } from "@/app/[locale]/_components/MarqueeRibbon"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pages.discover" })
  return { title: t("metadata.title"), description: t("metadata.description") }
}

export default async function DiscoverPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <DiscoverContent />
      <Footer />
    </main>
  )
}
