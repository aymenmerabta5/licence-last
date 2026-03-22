import type { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { ResetPasswordVerifySkeleton } from "@/app/[locale]/(auth)/_components/AuthLoadingSkeletons"
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
  return <ResetPasswordVerifySkeleton />
}

export default function ResetPasswordVerifyPage() {
  return (
    <Suspense fallback={<ResetPasswordVerifyFallback />}>
      <ResetPasswordVerifyForm />
    </Suspense>
  )
}
