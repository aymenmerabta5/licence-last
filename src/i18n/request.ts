import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import { mergeMessagesWithFallback } from "@/i18n/messages"
import { routing } from "@/i18n/routing"

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const localeMessages = (await import(`@/messages/${locale}.json`)).default
  const fallbackMessages =
    locale === routing.defaultLocale
      ? localeMessages
      : (await import(`@/messages/${routing.defaultLocale}.json`)).default

  return {
    locale,
    messages: mergeMessagesWithFallback(localeMessages, fallbackMessages),
  }
})
