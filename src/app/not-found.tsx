import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { routing } from "@/i18n/routing"

function parseAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return routing.defaultLocale

  const supportedLocales = routing.locales

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code] = lang.split(";")
      return code.trim().toLowerCase()
    })

  for (const lang of languages) {
    const shortCode = lang.split("-")[0]
    if (supportedLocales.includes(shortCode as (typeof routing.locales)[number])) {
      return shortCode
    }
    if (supportedLocales.includes(lang as (typeof routing.locales)[number])) {
      return lang
    }
  }

  return routing.defaultLocale
}

export default async function NotFound() {
  const headersList = await headers()
  const acceptLanguage = headersList.get("accept-language")
  const pathname = headersList.get("x-pathname") ?? "/"
  
  const detectedLocale = parseAcceptLanguage(acceptLanguage)
  
  redirect(`/${detectedLocale}${pathname}`)
}
