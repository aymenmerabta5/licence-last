import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

interface BanUserData {
  userId: string
  banReason?: string
  banExpiresIn?: number
}

type RequestHeaders = Awaited<ReturnType<typeof headers>>

interface BanUserDeps {
  authApi?: {
    banUser(input: {
      headers: RequestHeaders
      body: {
        userId: string
        banReason?: string
        banExpiresIn?: number
      }
    }): Promise<unknown>
    unbanUser(input: {
      headers: RequestHeaders
      body: {
        userId: string
      }
    }): Promise<unknown>
  }
  getHeaders?: typeof headers
}

export async function banUser(data: BanUserData, deps: BanUserDeps = {}) {
  const api = deps.authApi ?? auth.api
  const getHeaders = deps.getHeaders ?? headers

  const result = await api.banUser({
    headers: await getHeaders(),
    body: {
      userId: data.userId,
      ...(data.banReason && { banReason: data.banReason }),
      ...(data.banExpiresIn && { banExpiresIn: data.banExpiresIn }),
    },
  })

  return result
}

export async function unbanUser(userId: string, deps: BanUserDeps = {}) {
  const api = deps.authApi ?? auth.api
  const getHeaders = deps.getHeaders ?? headers

  const result = await api.unbanUser({
    headers: await getHeaders(),
    body: { userId },
  })

  return result
}
