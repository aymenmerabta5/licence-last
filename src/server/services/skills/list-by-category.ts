"use cache"

import "server-only"

import { and, asc, eq, ilike, inArray } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { CACHE_PROFILES, CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { skillCategory, skillTag } from "@/server/db/schema/skills"
import { getEffectiveDepartmentSkillIds } from "@/server/services/departments/get-effective-skills"

const DEFAULT_CATEGORY_LIMIT = 5
const MAX_CATEGORY_LIMIT = 15

export interface SkillItem {
  id: string
  name: string
  slug: string
  category: string | null
}

export interface SkillCategoryGroup {
  id: number
  name: string
  slug: string
  isRecommended: boolean
  skills: SkillItem[]
}

export interface ListSkillsByCategoryInput {
  query?: string
  cursor?: number | null
  limit?: number
  departmentId?: string
}

export interface ListSkillsByCategoryResult {
  categories: SkillCategoryGroup[]
  nextCursor: number | null
  hasMore: boolean
}

export async function listSkillsByCategory(
  input?: ListSkillsByCategoryInput,
): Promise<ListSkillsByCategoryResult> {
  CACHE_PROFILES.REFERENCE()
  cacheTag(CACHE_TAGS.SKILLS)
  if (input?.departmentId) {
    cacheTag(`department-${input.departmentId}`)
  }

  const limit = Math.min(
    input?.limit ?? DEFAULT_CATEGORY_LIMIT,
    MAX_CATEGORY_LIMIT,
  )
  const query = input?.query?.trim().toLowerCase() ?? ""

  // Step 1: Determine recommended categories when departmentId is provided
  let recommendedCategoryIds: number[] = []
  if (input?.departmentId) {
    const deptSkillIds = await getEffectiveDepartmentSkillIds(input.departmentId)
    if (deptSkillIds.length > 0) {
      const deptSkillRows = await db
        .selectDistinct({ categoryId: skillTag.categoryId })
        .from(skillTag)
        .where(inArray(skillTag.id, deptSkillIds))
      recommendedCategoryIds = deptSkillRows.map((r) => r.categoryId)
    }
  }
  const recommendedSet = new Set(recommendedCategoryIds)

  // Step 2: Build the ordered list of category IDs
  let orderedCategoryIds: number[]

  if (query) {
    const matchingCategoryRows = await db
      .selectDistinct({ categoryId: skillTag.categoryId })
      .from(skillTag)
      .where(
        and(
          eq(skillTag.status, "active"),
          ilike(skillTag.name, `%${query}%`),
        ),
      )
      .orderBy(asc(skillTag.categoryId))

    orderedCategoryIds = matchingCategoryRows.map((r) => r.categoryId)
  } else {
    const categoryRows = await db
      .select({ id: skillCategory.id })
      .from(skillCategory)
      .where(eq(skillCategory.status, "active"))
      .orderBy(asc(skillCategory.name))

    orderedCategoryIds = categoryRows.map((r) => r.id)
  }

  // Step 3: Reorder: recommended categories first (alphabetically), then others
  if (recommendedCategoryIds.length > 0) {
    const recommended = orderedCategoryIds.filter((id) => recommendedSet.has(id))
    const others = orderedCategoryIds.filter((id) => !recommendedSet.has(id))
    orderedCategoryIds = [...recommended, ...others]
  }

  // Step 4: Apply cursor pagination
  const cursor = input?.cursor ?? null
  const startIndex = cursor
    ? orderedCategoryIds.indexOf(cursor) + 1
    : 0

  if (startIndex <= -1 || startIndex >= orderedCategoryIds.length) {
    return { categories: [], nextCursor: null, hasMore: false }
  }

  const pageCategoryIds = orderedCategoryIds.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < orderedCategoryIds.length

  if (pageCategoryIds.length === 0) {
    return { categories: [], nextCursor: null, hasMore: false }
  }

  // Step 5: Fetch category details
  const categoriesResult = await db
    .select({
      id: skillCategory.id,
      name: skillCategory.name,
      slug: skillCategory.slug,
    })
    .from(skillCategory)
    .where(inArray(skillCategory.id, pageCategoryIds))

  // Preserve page order using a map
  const categoryMap = new Map(
    categoriesResult.map((c) => [c.id, c]),
  )
  const orderedCategories = pageCategoryIds
    .map((id) => categoryMap.get(id))
    .filter(Boolean) as Array<{
    id: number
    name: string
    slug: string
  }>

  // Step 6: Fetch all active skills for these categories
  const skillsResult = await db
    .select({
      id: skillTag.id,
      name: skillTag.name,
      slug: skillTag.slug,
      category: skillTag.category,
      categoryId: skillTag.categoryId,
    })
    .from(skillTag)
    .where(
      and(
        inArray(skillTag.categoryId, pageCategoryIds),
        eq(skillTag.status, "active"),
      ),
    )
    .orderBy(asc(skillTag.name))

  // Step 7: Assemble groups preserving category order
  const categories: SkillCategoryGroup[] = orderedCategories.map((cat) => ({
    ...cat,
    isRecommended: recommendedSet.has(cat.id),
    skills: skillsResult
      .filter((s) => s.categoryId === cat.id)
      .map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category,
      })),
  }))

  const nextCursor =
    categories.length > 0 ? categories[categories.length - 1].id : null

  return {
    categories,
    nextCursor,
    hasMore,
  }
}
