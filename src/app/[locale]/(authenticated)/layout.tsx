import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { Suspense } from "react"

import { AuthenticatedContent } from "@/app/[locale]/(authenticated)/_components/AuthenticatedContent"

/**
 * Authenticated layout with cacheComponents support.
 * Uses Suspense boundary to handle dynamic auth checks.
 */
export default async function AuthenticatedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages({ locale })

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthenticatedContent>{children}</AuthenticatedContent>
      </NextIntlClientProvider>
    </Suspense>
  )
}
