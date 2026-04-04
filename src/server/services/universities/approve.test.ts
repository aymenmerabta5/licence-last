import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockSelectResult: any[] = []
const mockReturning = mock(() =>
  Promise.resolve([{ id: "uni-1", name: "Test Uni" }]),
)
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))
const mockSelectLimit = mock(() => Promise.resolve(mockSelectResult))
const mockSelectWhere = mock(() => ({ limit: mockSelectLimit }))
const mockSelectFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockSelectFrom }))

const mockTx = { select: mockSelect, update: mockUpdate }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTransaction = mock(async (fn: (tx: any) => Promise<any>) => {
  return await fn(mockTx)
})

function applyApproveUniversityMocks() {
  mock.module("@/server/db", () => ({
    db: { transaction: mockTransaction },
  }))
}

let approveUniversityImportCounter = 0
async function importApproveUniversity() {
  approveUniversityImportCounter += 1
  return import(
    `@/server/services/universities/approve?test=${approveUniversityImportCounter}`
  )
}

function collectSqlValues(node: unknown): string[] {
  if (!node) return []

  if (Array.isArray(node)) {
    return node.flatMap((item) => collectSqlValues(item))
  }

  if (typeof node !== "object") {
    return [String(node)]
  }

  const values: string[] = []
  if ("value" in node) {
    const rawValue = (node as { value: unknown }).value
    if (Array.isArray(rawValue)) {
      values.push(...rawValue.map((value) => String(value)))
    } else if (rawValue !== undefined && typeof rawValue !== "function") {
      values.push(String(rawValue))
    }
  }

  if ("queryChunks" in node) {
    values.push(
      ...collectSqlValues((node as { queryChunks: unknown }).queryChunks),
    )
  }

  return values
}

describe("approveUniversity", () => {
  beforeEach(() => {
    applyApproveUniversityMocks()
    mockSelectResult = []

    mockTransaction.mockClear()
    mockSelect.mockClear()
    mockSelectFrom.mockClear()
    mockSelectWhere.mockClear()
    mockSelectLimit.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockSelect.mockReturnValue({ from: mockSelectFrom })
    mockSelectFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockSelectLimit })
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
    mockReturning.mockResolvedValue([{ id: "uni-1", name: "Test Uni" }])
    mockTransaction.mockImplementation(async (fn) => {
      return await fn(mockTx)
    })
  })

  test("should return universityId on success", async () => {
    const { approveUniversity } = await importApproveUniversity()
    const result = await approveUniversity("uni-1", "admin-1")
    expect(result).toEqual({ universityId: "uni-1", name: "Test Uni" })
  })

  test("should use transaction", async () => {
    const { approveUniversity } = await importApproveUniversity()
    await approveUniversity("uni-1", "admin-1")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  test("should update both university and domains", async () => {
    const { approveUniversity } = await importApproveUniversity()
    await approveUniversity("uni-1", "admin-1")
    // 1 university update (with returning) + 1 domain update
    expect(mockUpdate).toHaveBeenCalledTimes(2)
  })

  test("should only approve pending university domains", async () => {
    const { approveUniversity } = await importApproveUniversity()

    await approveUniversity("uni-1", "admin-1")

    const domainWhereCall = mockWhere.mock.calls[1] as unknown[] | undefined
    const domainWhereArg = domainWhereCall?.[0]
    expect(collectSqlValues(domainWhereArg)).toContain("pending")
  })

  test("should throw when university not found", async () => {
    mockReturning.mockResolvedValue([])
    mockSelectResult = []

    const { approveUniversity } = await importApproveUniversity()
    expect(approveUniversity("nonexistent", "admin-1")).rejects.toThrow(
      "University not found",
    )
  })

  test("should reject approving a university that is no longer pending", async () => {
    mockReturning.mockResolvedValue([])
    mockSelectResult = [{ id: "uni-1", status: "approved" }]

    const { approveUniversity } = await importApproveUniversity()

    await expect(approveUniversity("uni-1", "admin-1")).rejects.toThrow(
      "Only pending universities can be approved",
    )
  })
})
