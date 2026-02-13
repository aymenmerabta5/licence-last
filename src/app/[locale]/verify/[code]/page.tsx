import { setRequestLocale } from "next-intl/server"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { verifyDocument } from "@/server/services/documents/verify"
import { VerificationResult } from "./_components/VerificationResult"

type Params = Promise<{ locale: string; code: string }>

export default async function VerifyResultPage({ params }: { params: Params }) {
  const { locale, code } = await params
  setRequestLocale(locale)

  const decodedCode = decodeURIComponent(code)
  const result = await verifyDocument(decodedCode)

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
