import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

interface UpdateUserData {
  name?: string
  email?: string
  role?: "student" | "company_admin" | "dept_head" | "university_admin" | "super_admin"
}

const getAuthApi = () => (globalThis as any).__authApi ?? auth.api
type UpdateUserDeps = { authApi?: typeof auth.api; getHeaders?: typeof headers }

export async function updateUser(userId: string, data: UpdateUserData, deps: UpdateUserDeps = {}) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.adminUpdateUser({
    headers: await getHeaders(),
    body: { userId, data },
  })

  return result
}
