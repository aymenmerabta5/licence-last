import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { VerifyForm } from "@/app/[locale]/verify/_components/VerifyForm"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "verify" })

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function VerifyPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("verify")

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("description")}</p>
        </div>
        <VerifyForm />
      </div>
      <Footer />
    </main>
  )
}
