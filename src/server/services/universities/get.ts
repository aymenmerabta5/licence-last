import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { university } from "@/server/db/schema/universities"

export async function getUniversityById(id: string) {
  const [row] = await db
    .select({
      id: university.id,
      name: university.name,
      abbreviation: university.abbreviation,
      city: university.city,
    })
    .from(university)
    .where(eq(university.id, id))
    .limit(1)

  return row ?? null
}
