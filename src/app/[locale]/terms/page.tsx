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
  const t = await getTranslations({ locale, namespace: "pages.terms" })

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  }
}

export default async function TermsPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "pages.terms" })

  return (
    <LegalPageFrame
      kicker={t("kicker")}
      title={t("title")}
      updatedAt={t("updatedAt")}
      intro={t("intro")}
      sections={[
        {
          title: t("sections.accounts.title"),
          body: t("sections.accounts.body"),
        },
        {
          title: t("sections.conduct.title"),
          body: t("sections.conduct.body"),
        },
        {
          title: t("sections.documents.title"),
          body: t("sections.documents.body"),
        },
        {
          title: t("sections.support.title"),
          body: t("sections.support.body"),
        },
      ]}
    />
  )
}
