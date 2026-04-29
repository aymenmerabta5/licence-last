import { beforeEach, describe, expect, mock, test } from "bun:test"

let mockListResult: any[] = []

let mockSnapshotCheckResult: any[] = []

const mockValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockValues }))

// The query chain: select().from().where().orderBy().limit()  OR  select().from().where().limit()
const mockLimitList = mock(() => Promise.resolve(mockListResult))
const mockOrderByList = mock(() => ({ limit: mockLimitList }))
const mockLimitCheck = mock(() => Promise.resolve(mockSnapshotCheckResult))

const mockWhere = mock((): any => ({
  orderBy: mockOrderByList,
  limit: mockLimitCheck,
}))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

function applyReadinessHistoryMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      insert: mockInsert,
    },
  }))

  mock.module("@/server/services/matching/skill-gap", () => ({
    getSkillGapRoadmap: mock(() =>
      Promise.resolve({
        readyPercent: 70,
        missingSkills: [{ id: "s1", name: "React" }],
        estimatedDelta: 10,
        recommendedLearningOrder: [],
        roadmapSteps: [],
      }),
    ),
  }))
}

let readinessHistoryImportCounter = 0
async function importReadinessHistory() {
  readinessHistoryImportCounter += 1
  return (await import(
    `@/server/services/matching/readiness-history?test=${readinessHistoryImportCounter}`
  )) as typeof import("@/server/services/matching/readiness-history")
}

describe("src/server/services/matching/readiness-history", () => {
  beforeEach(() => {
    applyReadinessHistoryMocks()

    mockListResult = []
    mockSnapshotCheckResult = []
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockOrderByList.mockClear()
    mockLimitList.mockClear()
    mockLimitCheck.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({
      orderBy: mockOrderByList,
      limit: mockLimitCheck,
    })
    mockOrderByList.mockReturnValue({ limit: mockLimitList })
    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  describe("listReadinessHistory", () => {
    test("should return empty array when no history exists", async () => {
      mockListResult = []
      mockLimitList.mockResolvedValue(mockListResult)

      const { listReadinessHistory } = await importReadinessHistory()
      const result = await listReadinessHistory("student-1", "offer-1")

      expect(result).toEqual([])
    })

    test("should return history rows", async () => {
      const now = new Date()
      mockListResult = [
        {
          id: "snap-1",
          readyPercent: 70,
          missingSkillsCount: 3,
          capturedAt: now,
          source: "manual",
        },
        {
          id: "snap-2",
          readyPercent: 60,
          missingSkillsCount: 5,
          capturedAt: now,
          source: "auto",
        },
      ]
      mockLimitList.mockResolvedValue(mockListResult)

      const { listReadinessHistory } = await importReadinessHistory()
      const result = await listReadinessHistory("student-1", "offer-1")

      expect(result).toHaveLength(2)
      expect(result[0].readyPercent).toBe(70)
    })
  })

  describe("captureReadinessSnapshot", () => {
    test("should skip when snapshot already captured today", async () => {
      mockSnapshotCheckResult = [{ id: "existing-snap" }]
      mockLimitCheck.mockResolvedValue(mockSnapshotCheckResult)

      const { captureReadinessSnapshot } = await importReadinessHistory()
      const result = await captureReadinessSnapshot(
        "student-1",
        "offer-1",
        "auto",
      )

      expect(result.skipped).toBe(true)
      expect(result.snapshotId).toBe("existing-snap")
    })

    test("should create snapshot when none exists today", async () => {
      mockSnapshotCheckResult = []
      mockLimitCheck.mockResolvedValue(mockSnapshotCheckResult)

      const { captureReadinessSnapshot } = await importReadinessHistory()
      const result = await captureReadinessSnapshot(
        "student-1",
        "offer-1",
        "manual",
      )

      expect(result.skipped).toBe(false)
      expect(result.snapshotId).toBeDefined()
    })
  })
})
