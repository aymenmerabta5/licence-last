import { ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { ErrorShell } from "@/components/error/ErrorShell"

export default async function NotFoundPage() {
  const t = await getTranslations("notFound")

  return (
    <ErrorShell
      variant="full-page"
      statusCode="404"
      edition={t("edition")}
      headline={t("headline")}
      description={t("description")}
      primaryAction={{
        label: t("returnHome"),
        href: "/",
        icon: <ArrowRight className="h-4 w-4" />,
      }}
      suggestion={t("suggestion")}
      showNavbar
    />
  )
}
