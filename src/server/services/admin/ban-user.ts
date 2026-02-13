import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface BanUserData {
  userId: string
  banReason?: string
  banExpiresIn?: number
}

export async function banUser(data: BanUserData) {
  const result = await auth.api.banUser({
    headers: await headers(),
    body: {
      userId: data.userId,
      ...(data.banReason && { banReason: data.banReason }),
      ...(data.banExpiresIn && { banExpiresIn: data.banExpiresIn }),
    },
  })

  return result
}

export async function unbanUser(userId: string) {
  const result = await auth.api.unbanUser({
    headers: await headers(),
    body: { userId },
  })

  return result
}
