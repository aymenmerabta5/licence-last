import { setRequestLocale } from "next-intl/server"
import { VerificationResult } from "@/app/[locale]/verify/[code]/_components/VerificationResult"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import { orpcClient } from "@/server/orpc/client"

type Params = Promise<{ locale: string; code: string }>

export default async function VerifyResultPage({ params }: { params: Params }) {
  const { locale, code } = await params
  setRequestLocale(locale)

  const decodedCode = decodeURIComponent(code)
  const result = await orpcClient.documents.verify({ code: decodedCode })

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <VerificationResult result={result} code={decodedCode} />
      </div>
      <Footer />
    </main>
  )
}
