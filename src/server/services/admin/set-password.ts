import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function setUserPassword(userId: string, newPassword: string) {
  const result = await auth.api.setUserPassword({
    headers: await headers(),
    body: { userId, newPassword },
  })

  return result
}
