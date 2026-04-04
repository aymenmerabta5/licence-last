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
  const t = await getTranslations({ locale, namespace: "pages.privacy" })

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  }
}

export default async function PrivacyPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "pages.privacy" })

  return (
    <LegalPageFrame
      kicker={t("kicker")}
      title={t("title")}
      updatedAt={t("updatedAt")}
      intro={t("intro")}
      sections={[
        {
          title: t("sections.collection.title"),
          body: t("sections.collection.body"),
        },
        {
          title: t("sections.usage.title"),
          body: t("sections.usage.body"),
        },
        {
          title: t("sections.retention.title"),
          body: t("sections.retention.body"),
        },
        {
          title: t("sections.contact.title"),
          body: t("sections.contact.body"),
        },
      ]}
    />
  )
}
