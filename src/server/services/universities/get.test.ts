import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockChain: any = {
  select: mock(() => mockChain),
  from: mock(() => mockChain),
  where: mock(() => mockChain),
  limit: mock(() => Promise.resolve([])),
  innerJoin: mock(() => mockChain),
}

function applyUniversityGetMocks() {
  mock.module("@/server/db", () => ({ db: mockChain }))

  // Mock cache utilities
  mock.module("@/lib/cache", () => ({
    CACHE_TAGS: {
      SKILLS: "skills",
      UNIVERSITIES: "universities",
      STUDENT_PROFILE: (userId: string) => `student-profile-${userId}`,
      STUDENT_STATS: (userId: string) => `student-stats-${userId}`,
      STUDENT_APPLICATIONS: (userId: string) => `student-apps-${userId}`,
      COMPANY_PROFILE: (companyId: string) => `company-${companyId}`,
      COMPANY_OFFERS: (companyId: string) => `company-offers-${companyId}`,
      COMPANY_CANDIDATES: (companyId: string) =>
        `company-candidates-${companyId}`,
      OFFER_SEARCH: "offer-search",
      OFFER_DETAIL: (offerId: string) => `offer-${offerId}`,
      OFFERS_PUBLIC: "offers-public",
      PUBLIC_PROFILE: (userId: string) => `public-profile-${userId}`,
    },
    CACHE_PROFILES: {
      STATIC: () => {},
      REFERENCE: () => {},
      PROFILE: () => {},
      STATS: () => {},
      SEARCH: () => {},
      LISTINGS: () => {},
    },
  }))
}

let universityGetImportCounter = 0
async function importUniversitiesGet() {
  universityGetImportCounter += 1
  return import(
    `@/server/services/universities/get?test=${universityGetImportCounter}`
  )
}

describe("getUniversityById", () => {
  beforeEach(() => {
    applyUniversityGetMocks()

    for (const fn of Object.values(mockChain))
      (fn as ReturnType<typeof mock>).mockClear()
    mockChain.select.mockReturnValue(mockChain)
    mockChain.from.mockReturnValue(mockChain)
    mockChain.where.mockReturnValue(mockChain)
    mockChain.innerJoin.mockReturnValue(mockChain)
  })

  test("should return university when found", async () => {
    const uni = { id: "uni-1", name: "Test Uni", status: "approved" }
    mockChain.limit.mockResolvedValue([uni])

    const { getUniversityById } = await importUniversitiesGet()
    const result = await getUniversityById("uni-1")
    expect(result).toEqual(uni as typeof result)
  })

  test("should return null when not found", async () => {
    mockChain.limit.mockResolvedValue([])

    const { getUniversityById } = await importUniversitiesGet()
    const result = await getUniversityById("nonexistent")
    expect(result).toBeNull()
  })
})

describe("getUniversityByUserId", () => {
  beforeEach(() => {
    applyUniversityGetMocks()

    for (const fn of Object.values(mockChain))
      (fn as ReturnType<typeof mock>).mockClear()
    mockChain.select.mockReturnValue(mockChain)
    mockChain.from.mockReturnValue(mockChain)
    mockChain.where.mockReturnValue(mockChain)
    mockChain.innerJoin.mockReturnValue(mockChain)
  })

  test("should return university data when user has university", async () => {
    const uniData = {
      id: "uni-1",
      name: "Test Uni",
      abbreviation: "TU",
      city: "Algiers",
      status: "approved" as const,
      rejectionReason: null,
    }
    mockChain.limit.mockResolvedValue([uniData])

    const { getUniversityByUserId } = await importUniversitiesGet()
    const result = await getUniversityByUserId("user-1")
    expect(result).toEqual(uniData as typeof result)
  })

  test("should return null when user has no university", async () => {
    mockChain.limit.mockResolvedValue([])

    const { getUniversityByUserId } = await importUniversitiesGet()
    const result = await getUniversityByUserId("user-no-uni")
    expect(result).toBeNull()
  })
})
