"use cache"

import "server-only"

import { eq } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { CACHE_PROFILES, CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { skillCategory } from "@/server/db/schema"

export interface SkillCategory {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  status: "active" | "deprecated"
  createdAt: Date
  updatedAt: Date
}

export async function listSkillCategories(): Promise<SkillCategory[]> {
  CACHE_PROFILES.REFERENCE()
  cacheTag(CACHE_TAGS.SKILLS)

  const categories = await db
    .select()
    .from(skillCategory)
    .where(eq(skillCategory.status, "active"))
    .orderBy(skillCategory.name)

  return categories as SkillCategory[]
}
