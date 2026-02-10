import { requireRole } from "@/lib/auth-guards"

import { AssistantChat } from "./_components/AssistantChat"

export default async function AssistantPage() {
  await requireRole(["company_admin"])

  return <AssistantChat />
}
