import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function removeUser(userId: string) {
  const result = await auth.api.removeUser({
    headers: await headers(),
    body: { userId },
  })

  return result
}
