import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockListUsers = mock(() => Promise.resolve({ users: [], total: 0 }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: { listUsers: mockListUsers } },
}))
mock.module("next/headers", () => ({ headers: mockHeaders }))

describe("listUsers", () => {
  beforeEach(() => { mockListUsers.mockClear() })

  test("should use default limit and offset", async () => {
    const { listUsers } = await import("./list-users")
    await listUsers({})

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockListUsers.mock.calls as any)[0][0]
    expect(call.query.limit).toBe(20)
    expect(call.query.offset).toBe(0)
  })

  test("should pass custom limit and offset", async () => {
    const { listUsers } = await import("./list-users")
    await listUsers({ limit: 50, offset: 10 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockListUsers.mock.calls as any)[0][0]
    expect(call.query.limit).toBe(50)
    expect(call.query.offset).toBe(10)
  })

  test("should include search params when searchValue is provided", async () => {
    const { listUsers } = await import("./list-users")
    await listUsers({ searchValue: "test@", searchField: "email" })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockListUsers.mock.calls as any)[0][0]
    expect(call.query.searchValue).toBe("test@")
    expect(call.query.searchField).toBe("email")
    expect(call.query.searchOperator).toBe("contains")
  })

  test("should include sort params when sortBy is provided", async () => {
    const { listUsers } = await import("./list-users")
    await listUsers({ sortBy: "name", sortDirection: "desc" })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockListUsers.mock.calls as any)[0][0]
    expect(call.query.sortBy).toBe("name")
    expect(call.query.sortDirection).toBe("desc")
  })

  test("should include filter params when filterField is provided", async () => {
    const { listUsers } = await import("./list-users")
    await listUsers({ filterField: "role", filterValue: "student", filterOperator: "eq" })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockListUsers.mock.calls as any)[0][0]
    expect(call.query.filterField).toBe("role")
    expect(call.query.filterValue).toBe("student")
  })
})
