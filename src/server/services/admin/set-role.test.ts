import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSetRole = mock(() => Promise.resolve({ success: true }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

const mockDbUpdateSet = mock(() => ({
  where: () => Promise.resolve([]),
}))
const mockDbDeleteWhere = mock(() => Promise.resolve([]))
const mockDbInsertValues = mock(() => Promise.resolve([]))
const mockDbTransaction = mock((fn: (tx: unknown) => unknown) =>
  fn({
    insert: () => ({ values: mockDbInsertValues }),
    update: () => ({ set: mockDbUpdateSet }),
    delete: () => ({ where: mockDbDeleteWhere }),
  }),
)

mock.module("@/lib/auth", () => ({
  auth: { api: {} },
  pendingWelcomeEmails: new Map(),
}))

mock.module("@/server/db", () => ({
  db: {
    update: () => ({ set: mockDbUpdateSet }),
    delete: () => ({ where: mockDbDeleteWhere }),
    insert: () => ({ values: mockDbInsertValues }),
    transaction: mockDbTransaction,
  },
}))

describe("updateUserRole", () => {
  beforeEach(() => {
    mockSetRole.mockClear()
    mockDbUpdateSet.mockClear()
    mockDbDeleteWhere.mockClear()
    mockDbInsertValues.mockClear()
    mockDbTransaction.mockClear()
  })

  test("should call auth.api.setRole with resolved primary role", async () => {
    const { updateUserRole } = await import(
      "@/server/services/admin/set-role?fresh=1" as string
    )
    await updateUserRole(
      "user-1",
      { role: "super_admin" },
      {
        authApi: { setRole: mockSetRole },
        getHeaders: mockHeaders,
      },
    )

    const call = (mockSetRole.mock.calls as unknown[][])[0][0] as {
      body: { userId?: string; role?: string }
    }
    expect(call.body.userId).toBe("user-1")
    expect(call.body.role).toBe("super_admin")
  })

  test("should resolve recruiter to company_admin", async () => {
    const { updateUserRole } = await import(
      "@/server/services/admin/set-role?fresh=2" as string
    )
    await updateUserRole(
      "user-1",
      { role: "recruiter", companyId: "comp-1" },
      {
        authApi: { setRole: mockSetRole },
        getHeaders: mockHeaders,
      },
    )

    const call = (mockSetRole.mock.calls as unknown[][])[0][0] as {
      body: { role?: string }
    }
    expect(call.body.role).toBe("company_admin")
  })

  test("should resolve department_head to university_admin", async () => {
    const { updateUserRole } = await import(
      "@/server/services/admin/set-role?fresh=3" as string
    )
    await updateUserRole(
      "user-1",
      { role: "department_head", universityId: "uni-1" },
      {
        authApi: { setRole: mockSetRole },
        getHeaders: mockHeaders,
      },
    )

    const call = (mockSetRole.mock.calls as unknown[][])[0][0] as {
      body: { role?: string }
    }
    expect(call.body.role).toBe("university_admin")
  })

  test("should accept all valid primary roles", async () => {
    const { updateUserRole } = await import(
      "@/server/services/admin/set-role?fresh=4" as string
    )
    const roles = [
      "student",
      "company_admin",
      "university_admin",
      "super_admin",
    ] as const
    for (const role of roles) {
      mockSetRole.mockClear()
      await updateUserRole(
        "user-1",
        { role },
        {
          authApi: { setRole: mockSetRole },
          getHeaders: mockHeaders,
        },
      )
      expect(mockSetRole).toHaveBeenCalledTimes(1)
    }
  })

  test("should return success", async () => {
    const { updateUserRole } = await import(
      "@/server/services/admin/set-role?fresh=5" as string
    )
    const result = await updateUserRole(
      "user-1",
      { role: "student", universityId: "uni-1" },
      {
        authApi: { setRole: mockSetRole },
        getHeaders: mockHeaders,
      },
    )
    expect(result).toEqual({ success: true })
  })
})
