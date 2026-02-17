import { getTranslations } from "next-intl/server"

import { requireRole } from "@/lib/auth-guards"

import { AssistantChat } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat"

export default async function AssistantPage() {
  await requireRole(["company_admin"])

  // Preload translations for client component
  await getTranslations("dashboard.assistant")

  return <AssistantChat />
}
