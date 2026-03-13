import type { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { ResetPasswordVerifyForm } from "@/app/[locale]/(auth)/reset-password/verify/_components/ResetPasswordVerifyForm"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.resetPassword" })

  return {
    title: t("verifyPageTitle"),
  }
}

function ResetPasswordVerifyFallback() {
  return (
    <div
      aria-label="Loading reset password verification form"
      className="h-[420px] w-full animate-pulse border-t-2 border-primary/20 bg-muted/5"
    />
  )
}

export default function ResetPasswordVerifyPage() {
  return (
    <Suspense fallback={<ResetPasswordVerifyFallback />}>
      <ResetPasswordVerifyForm />
    </Suspense>
  )
}
