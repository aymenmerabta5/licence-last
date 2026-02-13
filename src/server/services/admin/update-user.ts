import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface UpdateUserData {
  name?: string
  email?: string
  role?: "student" | "company_admin" | "dept_head" | "university_admin" | "super_admin"
}

export async function updateUser(userId: string, data: UpdateUserData) {
  const result = await auth.api.adminUpdateUser({
    headers: await headers(),
    body: { userId, data },
  })

  return result
}
