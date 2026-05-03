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
    <main className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 start-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute top-1/3 -start-24 h-72 w-72 rounded-full bg-primary/[0.02] blur-3xl" />
        <div className="absolute bottom-0 end-0 h-96 w-96 rounded-full bg-primary/[0.025] blur-3xl" />
      </div>

      <Navbar />

      <div className="relative mx-auto max-w-xl px-4 sm:px-6 py-20 sm:py-28">
        <Suspense fallback={<VerificationResultSkeleton />}>
          <VerificationResultPageContent code={decodedCode} />
        </Suspense>
      </div>

      <Footer />
    </main>
  )
}
