import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockListUsers = mock(() => Promise.resolve({ users: [], total: 0 }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))
const noOpAugment = mock(async () => new Map())

mock.module("@/lib/auth", () => ({
  auth: { api: {} },
  pendingWelcomeEmails: new Map(),
}))

describe("listUsers", () => {
  beforeEach(() => {
    mockListUsers.mockClear()
    noOpAugment.mockClear()
  })

  test("should use default limit and offset", async () => {
    const { listUsers } = await import(
      "@/server/services/admin/list-users?fresh=1"
    )
    await listUsers(
      {},
      {
        authApi: { listUsers: mockListUsers },
        getHeaders: mockHeaders,
        augmentUsers: noOpAugment,
      },
    )

    const call = (mockListUsers.mock.calls as unknown[][])[0][0] as {
      query: { limit?: number; offset?: number }
    }
    expect(call.query.limit).toBe(20)
    expect(call.query.offset).toBe(0)
  })

  test("should pass custom limit and offset", async () => {
    const { listUsers } = await import(
      "@/server/services/admin/list-users?fresh=2"
    )
    await listUsers(
      { limit: 50, offset: 10 },
      {
        authApi: { listUsers: mockListUsers },
        getHeaders: mockHeaders,
        augmentUsers: noOpAugment,
      },
    )

    const call = (mockListUsers.mock.calls as unknown[][])[0][0] as {
      query: { limit?: number; offset?: number }
    }
    expect(call.query.limit).toBe(50)
    expect(call.query.offset).toBe(10)
  })

  test("should include search params when searchValue is provided", async () => {
    const { listUsers } = await import(
      "@/server/services/admin/list-users?fresh=3"
    )
    await listUsers(
      { searchValue: "test@", searchField: "email" },
      {
        authApi: { listUsers: mockListUsers },
        getHeaders: mockHeaders,
        augmentUsers: noOpAugment,
      },
    )

    const call = (mockListUsers.mock.calls as unknown[][])[0][0] as {
      query: {
        searchValue?: string
        searchField?: string
        searchOperator?: string
      }
    }
    expect(call.query.searchValue).toBe("test@")
    expect(call.query.searchField).toBe("email")
    expect(call.query.searchOperator).toBe("contains")
  })

  test("should include sort params when sortBy is provided", async () => {
    const { listUsers } = await import(
      "@/server/services/admin/list-users?fresh=4"
    )
    await listUsers(
      { sortBy: "name", sortDirection: "desc" },
      {
        authApi: { listUsers: mockListUsers },
        getHeaders: mockHeaders,
        augmentUsers: noOpAugment,
      },
    )

    const call = (mockListUsers.mock.calls as unknown[][])[0][0] as {
      query: { sortBy?: string; sortDirection?: string }
    }
    expect(call.query.sortBy).toBe("name")
    expect(call.query.sortDirection).toBe("desc")
  })

  test("should include filter params when filterField is provided", async () => {
    const { listUsers } = await import(
      "@/server/services/admin/list-users?fresh=5"
    )
    await listUsers(
      { filterField: "role", filterValue: "student", filterOperator: "eq" },
      {
        authApi: { listUsers: mockListUsers },
        getHeaders: mockHeaders,
        augmentUsers: noOpAugment,
      },
    )

    const call = (mockListUsers.mock.calls as unknown[][])[0][0] as {
      query: { filterField?: string; filterValue?: string }
    }
    expect(call.query.filterField).toBe("role")
    expect(call.query.filterValue).toBe("student")
  })
})
