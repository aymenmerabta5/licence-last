import "server-only"

import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  ne,
  or,
} from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/server/db"
import { user as userTable } from "@/server/db/schema/auth"
import { company, companyMember } from "@/server/db/schema/companies"
import { department } from "@/server/db/schema/departments"
import { university } from "@/server/db/schema/universities"
import { universityMember } from "@/server/db/schema/university-memberships"
import { resolveMembershipAwareRoleFilter } from "@/server/services/admin/role-filtering"

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
      companyMemberRole: companyMember.role,
      companyName: company.name,
      onboardingCompleted: userTable.onboardingCompleted,
      emailVerified: userTable.emailVerified,
      companyStatus: company.status,
      universityStatus: university.status,
    })
    .from(userTable)
    .leftJoin(universityMember, eq(userTable.id, universityMember.userId))
    .leftJoin(university, eq(userTable.universityId, university.id))
    .leftJoin(department, eq(universityMember.departmentId, department.id))
    .leftJoin(companyMember, eq(userTable.id, companyMember.userId))
    .leftJoin(company, eq(companyMember.companyId, company.id))
    .where(
      inArray(
        userTable.id,
        users.map((u) => u.id),
      ),
    )

  return new Map(rows.map((r) => [r.userId, r]))
}

type AugmentFn = typeof augmentUsersWithAffiliations

type ListUsersDeps = {
  authApi?: ListUsersAuthApi
  getHeaders?: typeof headers
  augmentUsers?: AugmentFn
}

function buildSearchCondition(
  searchValue: string | undefined,
  searchField: "email" | "name" | undefined,
) {
  if (!searchValue) return undefined
  const pattern = `%${searchValue}%`
  if (searchField === "name") {
    return ilike(userTable.name, pattern)
  }
  return ilike(userTable.email, pattern)
}

async function listUsersByMembershipAwareRole(
  params: ListUsersParams,
  augment: AugmentFn,
) {
  const limit = params.limit ?? 20
  const offset = params.offset ?? 0
  const roleFilter = resolveMembershipAwareRoleFilter(params)

  if (!roleFilter) {
    throw new Error("Membership-aware role filter is required")
  }

  const usesCompanyMembership =
    roleFilter === "company_admin" || roleFilter === "recruiter"
  const searchCondition = buildSearchCondition(
    params.searchValue,
    params.searchField,
  )

  const roleFilterCondition =
    roleFilter === "recruiter"
      ? eq(companyMember.role, "recruiter")
      : roleFilter === "department_head"
        ? eq(universityMember.role, "department_head")
        : roleFilter === "company_admin"
          ? and(
              eq(userTable.role, "company_admin"),
              or(
                isNull(companyMember.role),
                ne(companyMember.role, "recruiter"),
              ),
            )
          : and(
              eq(userTable.role, "university_admin"),
              or(
                isNull(universityMember.role),
                ne(universityMember.role, "department_head"),
              ),
            )

  const whereClause = searchCondition
    ? and(roleFilterCondition, searchCondition)
    : roleFilterCondition

  const orderByColumn =
    params.sortBy === "createdAt"
      ? userTable.createdAt
      : params.sortBy === "name"
        ? userTable.name
        : params.sortBy === "email"
          ? userTable.email
          : params.sortBy === "role"
            ? userTable.role
            : userTable.createdAt

  const orderDirection = params.sortDirection === "asc" ? "asc" : "desc"

  const baseQuery = db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
      banned: userTable.banned,
      banReason: userTable.banReason,
      createdAt: userTable.createdAt,
      image: userTable.image,
    })
    .from(userTable)
    .$dynamic()

  const countQuery = db.select({ count: count() }).from(userTable).$dynamic()

  if (usesCompanyMembership) {
    const join =
      roleFilter === "recruiter"
        ? baseQuery.innerJoin.bind(baseQuery)
        : baseQuery.leftJoin.bind(baseQuery)
    const countJoin =
      roleFilter === "recruiter"
        ? countQuery.innerJoin.bind(countQuery)
        : countQuery.leftJoin.bind(countQuery)

    join(companyMember, eq(userTable.id, companyMember.userId))
    countJoin(companyMember, eq(userTable.id, companyMember.userId))
  } else {
    const join =
      roleFilter === "department_head"
        ? baseQuery.innerJoin.bind(baseQuery)
        : baseQuery.leftJoin.bind(baseQuery)
    const countJoin =
      roleFilter === "department_head"
        ? countQuery.innerJoin.bind(countQuery)
        : countQuery.leftJoin.bind(countQuery)

    join(universityMember, eq(userTable.id, universityMember.userId))
    countJoin(universityMember, eq(userTable.id, universityMember.userId))
  }

  const rows = await baseQuery
    .where(whereClause)
    .orderBy(orderDirection === "asc" ? orderByColumn : desc(orderByColumn))
    .limit(limit)
    .offset(offset)

  const countResult = await countQuery.where(whereClause)
  const total = Number(countResult[0]?.count ?? 0)

  const lookup = await augment(rows)

  return {
    users: rows.map((u) => ({
      ...u,
      ...lookup.get(u.id),
    })),
    total,
    limit,
    offset,
  }
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

  if (resolveMembershipAwareRoleFilter(params)) {
    return listUsersByMembershipAwareRole(params, augment)
  }

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
