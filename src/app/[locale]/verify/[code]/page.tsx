import { Suspense } from "react"
import { VerificationResultPageContent } from "@/app/[locale]/verify/[code]/_components/VerificationResultPageContent"
import { VerificationResultSkeleton } from "@/app/[locale]/verify/[code]/_components/VerificationResultSkeleton"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

type Params = Promise<{ code: string }>

function decodeVerificationCode(code: string) {
  try {
    return decodeURIComponent(code)
  } catch {
    return code
  }
}

export default async function VerifyResultPage({ params }: { params: Params }) {
  const { code } = await params
  const decodedCode = decodeVerificationCode(code)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <Suspense fallback={<VerificationResultSkeleton />}>
          <VerificationResultPageContent code={decodedCode} />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
