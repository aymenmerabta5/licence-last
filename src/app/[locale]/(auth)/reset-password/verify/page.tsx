import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ResetPasswordVerifyForm } from "./_components/ResetPasswordVerifyForm"

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

export default function ResetPasswordVerifyPage() {
  return <ResetPasswordVerifyForm />
}
