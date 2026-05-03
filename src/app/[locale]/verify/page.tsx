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
    <main className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 start-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute top-1/3 -start-24 h-72 w-72 rounded-full bg-primary/[0.02] blur-3xl" />
        <div className="absolute bottom-0 end-0 h-96 w-96 rounded-full bg-primary/[0.025] blur-3xl" />
      </div>

      <Navbar />

      <div className="relative mx-auto max-w-xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-10 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t("kicker")}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        <VerifyForm />

        <p className="mt-8 text-center text-xs text-muted-foreground/70 max-w-sm mx-auto leading-relaxed">
          {t("securityNote")}
        </p>
      </div>

      <Footer />
    </main>
  )
}
