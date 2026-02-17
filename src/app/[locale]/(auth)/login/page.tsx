import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LoginForm } from "@/app/[locale]/(auth)/login/_components/LoginForm"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth.login" })

  return {
    title: t("pageTitle"),
  }
}

export default function LoginPage() {
  return <LoginForm />
}
