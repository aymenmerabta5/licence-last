import { getTranslations } from "next-intl/server"
import { AssistantChat } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"

export default async function AssistantPage() {
  await requireApprovedCompanyAdmin()

  // Preload translations for client component
  await getTranslations("dashboard.assistant")

  return <AssistantChat />
}
