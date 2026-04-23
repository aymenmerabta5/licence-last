import "server-only"

import { eq, inArray } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/server/db"
import { user as userTable } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { universityMember } from "@/server/db/schema/university-memberships"
import { university } from "@/server/db/schema/universities"

interface ListUsersParams {
  limit?: number
  offset?: number
  searchValue?: string
  searchField?: "email" | "name"
  searchOperator?: "contains" | "starts_with" | "ends_with"
  sortBy?: string
  sortDirection?: "asc" | "desc"
  filterField?: string
  filterValue?: string | number | boolean
  filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
}

type RequestHeaders = Awaited<ReturnType<typeof headers>>

interface ListUsersAuthApi {
  listUsers(input: {
    headers: RequestHeaders
    query: {
      limit: number
      offset: number
      searchValue?: string
      searchField?: "email" | "name"
      searchOperator?: "contains" | "starts_with" | "ends_with"
      sortBy?: string
      sortDirection?: "asc" | "desc"
      filterField?: string
      filterValue?: string | number | boolean
      filterOperator?: "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
    }
  }): Promise<{
    users: Array<{
      id: string
      name: string | null
      email: string
      role?: string
      banned?: boolean | null
      banReason?: string | null
      createdAt: string | Date
      image?: string | null
    }>
    total: number
    limit?: number
    offset?: number
  }>
}

type AuthApiGlobal = typeof globalThis & { __authApi?: ListUsersAuthApi }

const getAuthApi = () => (globalThis as AuthApiGlobal).__authApi ?? auth.api

async function augmentUsersWithAffiliations(users: Array<{ id: string }>) {
  if (users.length === 0) return new Map<string, Record<string, unknown>>()

  const rows = await db
    .select({
      userId: userTable.id,
      universityMembershipRole: universityMember.role,
      universityName: university.name,
      departmentName: department.name,
    })
    .from(userTable)
    .leftJoin(universityMember, eq(userTable.id, universityMember.userId))
    .leftJoin(university, eq(userTable.universityId, university.id))
    .leftJoin(department, eq(universityMember.departmentId, department.id))
    .where(inArray(userTable.id, users.map((u) => u.id)))

  return new Map(rows.map((r) => [r.userId, r]))
}

type AugmentFn = typeof augmentUsersWithAffiliations

type ListUsersDeps = {
  authApi?: ListUsersAuthApi
  getHeaders?: typeof headers
  augmentUsers?: AugmentFn
}

export async function listUsers(
  params: ListUsersParams,
  deps: ListUsersDeps = {},
) {
  const api = deps.authApi ?? getAuthApi()
  const getHeaders = deps.getHeaders ?? headers
  const augment = deps.augmentUsers ?? augmentUsersWithAffiliations

  const limit = params.limit ?? 20
  const offset = params.offset ?? 0

  const result = await api.listUsers({
    headers: await getHeaders(),
    query: {
      limit,
      offset,
      ...(params.searchValue && {
        searchValue: params.searchValue,
        searchField: params.searchField ?? "email",
        searchOperator: params.searchOperator ?? "contains",
      }),
      ...(params.sortBy && {
        sortBy: params.sortBy,
        sortDirection: params.sortDirection ?? "asc",
      }),
      ...(params.filterField && {
        filterField: params.filterField,
        filterValue: params.filterValue,
        filterOperator: params.filterOperator ?? "eq",
      }),
    },
  })

  const lookup = await augment(result.users)

  return {
    users: result.users.map((u) => ({
      ...u,
      ...lookup.get(u.id),
    })),
    total: result.total,
    limit,
    offset,
  }
}
