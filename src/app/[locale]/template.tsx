import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"

interface LocaleTemplateProps {
  children: React.ReactNode
}

function LocaleTemplateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" aria-busy="true" aria-live="polite">
      <div className="w-full max-w-4xl space-y-6">
        <Skeleton className="h-3 w-44 mx-auto" />
        <Skeleton className="h-12 w-80 max-w-full mx-auto" />
        <Skeleton className="h-4 w-[36rem] max-w-full mx-auto" />
      </div>
    </div>
  )
}

export default function LocaleTemplate({ children }: LocaleTemplateProps) {
  return <Suspense fallback={<LocaleTemplateFallback />}>{children}</Suspense>
}
