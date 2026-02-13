import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockValues }))
const mockWhere = mock(() => Promise.resolve())
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

const mockTx = { insert: mockInsert, update: mockUpdate }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTransaction = mock(async (fn: (tx: any) => Promise<void>) => {
  await fn(mockTx)
})

mock.module("@/server/db", () => ({
  db: { transaction: mockTransaction },
}))

describe("createUniversity", () => {
  beforeEach(() => {
    mockTransaction.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockResolvedValue(undefined)
    mockTransaction.mockImplementation(async (fn) => { await fn(mockTx) })
  })

  test("should return universityId", async () => {
    const { createUniversity } = await import("./create")
    const result = await createUniversity(
      { name: "University of Algiers", domains: ["univ-alger.dz"] },
      "user-1",
    )
    expect(result.universityId).toBeDefined()
    expect(typeof result.universityId).toBe("string")
  })

  test("should use transaction for multi-table insert", async () => {
    const { createUniversity } = await import("./create")
    await createUniversity(
      { name: "Test Uni", domains: ["test.dz"] },
      "user-1",
    )
    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  test("should insert university, domains, and update user", async () => {
    const { createUniversity } = await import("./create")
    await createUniversity(
      { name: "Test Uni", domains: ["test.dz", "test2.dz"] },
      "user-1",
    )
    // 1 university insert + 1 domains insert + 1 user update
    expect(mockInsert).toHaveBeenCalledTimes(2)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should insert departments when provided", async () => {
    const { createUniversity } = await import("./create")
    await createUniversity(
      {
        name: "Test Uni",
        domains: ["test.dz"],
        departments: [{ name: "CS" }, { name: "Math" }],
      },
      "user-1",
    )
    // 1 university + 1 domains + 1 departments = 3 inserts
    expect(mockInsert).toHaveBeenCalledTimes(3)
  })

  test("should skip domain insert when domains array is empty", async () => {
    const { createUniversity } = await import("./create")
    await createUniversity(
      { name: "Test Uni", domains: [] },
      "user-1",
    )
    // Only 1 university insert (no domains) + 1 user update
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should skip department insert when departments not provided", async () => {
    const { createUniversity } = await import("./create")
    await createUniversity(
      { name: "Test Uni", domains: ["test.dz"] },
      "user-1",
    )
    // 1 university + 1 domains = 2 inserts (no departments)
    expect(mockInsert).toHaveBeenCalledTimes(2)
  })

  test("should handle all optional fields", async () => {
    const { createUniversity } = await import("./create")
    const result = await createUniversity(
      {
        name: "University of Oran",
        abbreviation: "USTO",
        departmentName: "CS",
        deanName: "Dr. Mohamed",
        phone: "+213555111222",
        wilayaCode: 31,
        city: "Oran",
        address: "123 Uni St",
        domains: ["usto.dz"],
      },
      "user-2",
    )
    expect(result.universityId).toBeDefined()
  })
})
