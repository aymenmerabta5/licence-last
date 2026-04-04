import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LegalPageFrame } from "@/app/[locale]/_components/LegalPageFrame"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pages.cookies" })

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  }
}

export default async function CookiesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "pages.cookies" })

  return (
    <LegalPageFrame
      kicker={t("kicker")}
      title={t("title")}
      updatedAt={t("updatedAt")}
      intro={t("intro")}
      sections={[
        {
          title: t("sections.essential.title"),
          body: t("sections.essential.body"),
        },
        {
          title: t("sections.preferences.title"),
          body: t("sections.preferences.body"),
        },
        {
          title: t("sections.analytics.title"),
          body: t("sections.analytics.body"),
        },
        {
          title: t("sections.contact.title"),
          body: t("sections.contact.body"),
        },
      ]}
    />
  )
}
