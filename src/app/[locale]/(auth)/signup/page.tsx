import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { SignupForm } from "@/app/[locale]/(auth)/signup/_components/SignupForm"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.signup" })

  return {
    title: t("pageTitle"),
  }
}

export default function SignupPage() {
  return <SignupForm />
}
