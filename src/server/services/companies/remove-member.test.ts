import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let selectResponses: any[] = []

const mockLimit = mock(async () => selectResponses.shift() ?? [])
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockDeleteWhere = mock(async () => ({ rowCount: 1 }))
const mockDelete = mock(() => ({ where: mockDeleteWhere }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockCreateNotification = mock(async () => ({ id: "notif-1" }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    delete: mockDelete,
  },
}))

mock.module("@/server/services/notifications/create", () => ({
  createNotification: mockCreateNotification,
}))

describe("src/server/services/companies/remove-member", () => {
  beforeEach(() => {
    selectResponses = []

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockDelete.mockClear()
    mockDeleteWhere.mockClear()
    mockCreateNotification.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockDelete.mockReturnValue({ where: mockDeleteWhere })
  })

  test("removes recruiter membership", async () => {
    selectResponses = [[{ userId: "member-1", role: "recruiter" }]]

    // @ts-expect-error - Bun's ?fresh suffix is test-runtime only.
    const { removeCompanyMember } = await import("@/server/services/companies/remove-member?fresh=1")
    const result = await removeCompanyMember({
      companyId: "company-1",
      memberUserId: "member-1",
      removedByUserId: "owner-1",
    })

    expect(result).toEqual({ removed: true, userId: "member-1" })
    expect(mockDeleteWhere).toHaveBeenCalledTimes(1)
    expect(mockCreateNotification).toHaveBeenCalledWith({
      userId: "member-1",
      type: "company_member_removed",
      payload: { companyId: "company-1" },
    })
  })

  test("rejects owner removal", async () => {
    selectResponses = [[{ userId: "owner-1", role: "owner" }]]

    // @ts-expect-error - Bun's ?fresh suffix is test-runtime only.
    const { removeCompanyMember } = await import("@/server/services/companies/remove-member?fresh=2")

    await expect(
      removeCompanyMember({
        companyId: "company-1",
        memberUserId: "owner-1",
        removedByUserId: "owner-2",
      }),
    ).rejects.toMatchObject({
      code: "COMPANY_MEMBER_OWNER_IMMUTABLE",
    })
  })

  test("rejects self removal", async () => {
    // @ts-expect-error - Bun's ?fresh suffix is test-runtime only.
    const { removeCompanyMember } = await import("@/server/services/companies/remove-member?fresh=3")

    await expect(
      removeCompanyMember({
        companyId: "company-1",
        memberUserId: "owner-1",
        removedByUserId: "owner-1",
      }),
    ).rejects.toMatchObject({
      code: "COMPANY_MEMBER_CANNOT_REMOVE_SELF",
    })
  })

  afterAll(() => {
    mock.restore()
  })
})
