import "server-only"

import { and, asc, count, desc, eq, ilike, ne } from "drizzle-orm"

import type { PrimaryUserRole } from "@/lib/effective-role"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"

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
      conditions.push(
        filterOperator === "ne"
          ? ne(user.role, params.filterValue as PrimaryUserRole)
          : eq(user.role, params.filterValue as PrimaryUserRole),
      )
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
  const [totalRow] = await db
    .select({ value: count() })
    .from(user)
    .where(whereClause)

  const users = await db
    .select()
    .from(user)
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
