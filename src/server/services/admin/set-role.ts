import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

type UserRole = "student" | "company_admin" | "dept_head" | "university_admin" | "super_admin"

export async function setUserRole(userId: string, role: UserRole) {
  const result = await auth.api.setRole({
    headers: await headers(),
    body: { userId, role },
  })

  return result
}
