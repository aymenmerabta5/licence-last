import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { MarqueeRibbon } from "@/app/[locale]/_components/MarqueeRibbon"
import { ForStudentsContent } from "@/app/[locale]/for-students/_components/ForStudentsContent"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pages.forStudents" })
  return { title: t("metadata.title"), description: t("metadata.description") }
}

export default async function ForStudentsPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <ForStudentsContent />
      <Footer />
    </main>
  )
}
