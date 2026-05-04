import "server-only"

import { and, asc, count, desc, eq, ilike, isNull, ne, or } from "drizzle-orm"

import type { PrimaryUserRole } from "@/lib/effective-role"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { universityMember } from "@/server/db/schema/university-memberships"

interface ListUniversityUsersParams {
  universityId: string
  limit?: number
  offset?: number
  searchValue?: string
  searchField?: "email" | "name"
  searchOperator?: "contains" | "starts_with" | "ends_with"
  sortBy?: "email" | "name" | "role" | "createdAt"
  sortDirection?: "asc" | "desc"
  filterField?: "email" | "name" | "role" | "id" | "banned"
  filterValue?: string | number | boolean
  filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
}

function buildSearchPattern(
  value: string,
  operator: "contains" | "starts_with" | "ends_with",
) {
  const escaped = value.replace(/[%_\\]/g, "\\$&")
  if (operator === "starts_with") return `${escaped}%`
  if (operator === "ends_with") return `%${escaped}`
  return `%${escaped}%`
}

export async function listUniversityUsers(params: ListUniversityUsersParams) {
  const conditions = [eq(user.universityId, params.universityId)]
  const roleFilterValue =
    params.filterField === "role" && typeof params.filterValue === "string"
      ? params.filterValue
      : undefined
  const shouldJoinMembership =
    roleFilterValue === "department_head" || roleFilterValue === "university_admin"

  if (params.searchValue) {
    const searchField = params.searchField ?? "email"
    const searchOperator = params.searchOperator ?? "contains"
    const pattern = buildSearchPattern(params.searchValue, searchOperator)
    if (searchField === "name") {
      conditions.push(ilike(user.name, pattern))
    } else {
      conditions.push(ilike(user.email, pattern))
    }
  }

  if (params.filterField && params.filterValue !== undefined) {
    const filterOperator = params.filterOperator ?? "eq"

    if (
      params.filterField === "banned" &&
      typeof params.filterValue === "boolean"
    ) {
      conditions.push(
        filterOperator === "ne"
          ? ne(user.banned, params.filterValue)
          : eq(user.banned, params.filterValue),
      )
    }

    if (params.filterField === "id" && typeof params.filterValue === "string") {
      conditions.push(
        filterOperator === "ne"
          ? ne(user.id, params.filterValue)
          : eq(user.id, params.filterValue),
      )
    }

    if (
      params.filterField === "role" &&
      typeof params.filterValue === "string"
    ) {
      if (params.filterValue === "department_head") {
        conditions.push(
          filterOperator === "ne"
            ? ne(universityMember.role, "department_head")
            : eq(universityMember.role, "department_head"),
        )
      } else if (
        params.filterValue === "university_admin" &&
        filterOperator === "eq"
      ) {
        const primaryUniversityAdminCondition = or(
          isNull(universityMember.role),
          ne(universityMember.role, "department_head"),
        )

        conditions.push(eq(user.role, "university_admin"))
        if (primaryUniversityAdminCondition) {
          conditions.push(primaryUniversityAdminCondition)
        }
      } else {
        conditions.push(
          filterOperator === "ne"
            ? ne(user.role, params.filterValue as PrimaryUserRole)
            : eq(user.role, params.filterValue as PrimaryUserRole),
        )
      }
    }

    if (
      params.filterField === "email" &&
      typeof params.filterValue === "string"
    ) {
      conditions.push(
        filterOperator === "ne"
          ? ne(user.email, params.filterValue)
          : eq(user.email, params.filterValue),
      )
    }

    if (
      params.filterField === "name" &&
      typeof params.filterValue === "string"
    ) {
      conditions.push(
        filterOperator === "ne"
          ? ne(user.name, params.filterValue)
          : eq(user.name, params.filterValue),
      )
    }
  }

  const sortBy = params.sortBy ?? "createdAt"
  const sortDirection = params.sortDirection ?? "desc"
  const sortColumn =
    sortBy === "email"
      ? user.email
      : sortBy === "name"
        ? user.name
        : sortBy === "role"
          ? user.role
          : user.createdAt

  const whereClause = and(...conditions)
  const countQuery = db.select({ value: count() }).from(user).$dynamic()

  if (shouldJoinMembership) {
    countQuery.leftJoin(universityMember, eq(user.id, universityMember.userId))
  }

  const [totalRow] = await countQuery.where(whereClause)

  const usersQuery = db
    .select({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      universityId: user.universityId,
      departmentId: user.departmentId,
      onboardingCompleted: user.onboardingCompleted,
      name: user.name,
      image: user.image,
      twoFactorEnabled: user.twoFactorEnabled,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      universityMembershipRole: universityMember.role,
      departmentName: department.name,
    })
    .from(user)

  usersQuery.leftJoin(universityMember, eq(user.id, universityMember.userId))

  const users = await usersQuery
    .leftJoin(department, eq(universityMember.departmentId, department.id))
    .where(whereClause)
    .orderBy(sortDirection === "asc" ? asc(sortColumn) : desc(sortColumn))
    .limit(params.limit ?? 20)
    .offset(params.offset ?? 0)

  return {
    users,
    total: totalRow?.value ?? 0,
    limit: params.limit ?? 20,
    offset: params.offset ?? 0,
  }
}
