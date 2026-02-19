import { getTranslations } from "next-intl/server"
import { AssistantChat } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat"
import { requireRole } from "@/lib/auth-guards"

export default async function AssistantPage() {
  await requireRole(["company_admin"])

  // Preload translations for client component
  await getTranslations("dashboard.assistant")

  return <AssistantChat />
}
