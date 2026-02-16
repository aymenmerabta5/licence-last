import "server-only"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface CreateUserData {
  email: string
  password: string
  name: string
  role: "student" | "company_admin" | "dept_head" | "university_admin" | "super_admin"
}

export async function createUser(data: CreateUserData) {
  const result = await auth.api.createUser({
    headers: await headers(),
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      data: {
        emailVerified: true,
      },
    },
  })

  return result
}
