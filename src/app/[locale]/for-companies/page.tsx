import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ForCompaniesContent } from "@/app/[locale]/for-companies/_components/ForCompaniesContent"
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
  const t = await getTranslations({ locale, namespace: "pages.forCompanies" })
  return { title: t("metadata.title"), description: t("metadata.description") }
}

export default async function ForCompaniesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <ForCompaniesContent />
      <Footer />
    </main>
  )
}
