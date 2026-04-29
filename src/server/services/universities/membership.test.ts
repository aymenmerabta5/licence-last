import { beforeEach, describe, expect, mock, test } from "bun:test"

let mockLimitResult: any[] = []

const mockLimit = mock(() => Promise.resolve(mockLimitResult))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))
let moduleImportCounter = 0

function applyMembershipMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

async function loadMembershipModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/universities/membership?test=${moduleImportCounter}`
  )
}

describe("src/server/services/universities/membership", () => {
  beforeEach(() => {
    applyMembershipMocks()
    mockLimitResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
  })

  test("should return membership when user belongs to university staff membership", async () => {
    mockLimitResult = [
      {
        userId: "user-1",
        universityId: "uni-1",
        role: "department_head",
        departmentId: "dept-1",
      },
    ]

    const { getUniversityMembership } = await loadMembershipModule()
    const result = await getUniversityMembership("user-1")

    expect(result).not.toBeNull()
    expect(result?.universityId).toBe("uni-1")
    expect(result?.departmentId).toBe("dept-1")
    expect(result?.role).toBe("department_head")
  })

  test("should return null when user has no university membership", async () => {
    mockLimitResult = []

    const { getUniversityMembership } = await loadMembershipModule()
    const result = await getUniversityMembership("user-orphan")

    expect(result).toBeNull()
  })

  test("should throw when user has multiple university memberships", async () => {
    mockLimitResult = [
      {
        userId: "user-1",
        universityId: "uni-1",
        role: "department_head",
        departmentId: "dept-1",
      },
      {
        userId: "user-1",
        universityId: "uni-2",
        role: "department_head",
        departmentId: "dept-2",
      },
    ]

    const { getUniversityMembership } = await loadMembershipModule()

    await expect(getUniversityMembership("user-1")).rejects.toMatchObject({
      code: "UNIVERSITY_MEMBERSHIP_CONFLICT",
      message: "User belongs to multiple university memberships",
    })
  })
})
