import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

type UserRole = "student" | "company_admin" | "dept_head" | "university_admin" | "super_admin"

const getAuthApi = () => (globalThis as any).__authApi ?? auth.api
type SetRoleDeps = { authApi?: typeof auth.api; getHeaders?: typeof headers }

export async function setUserRole(userId: string, role: UserRole, deps: SetRoleDeps = {}) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const result = await api.setRole({
    headers: await getHeaders(),
    body: { userId, role },
  })

  return result
}
