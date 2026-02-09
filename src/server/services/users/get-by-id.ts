import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"

export interface UserPublicRecord {
  id: string
  name: string | null
  email: string
  role: string | null
  image: string | null
  universityId: string | null
  createdAt: Date
}

export async function getUserById(userId: string): Promise<UserPublicRecord | null> {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      universityId: user.universityId,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return row ?? null
}

