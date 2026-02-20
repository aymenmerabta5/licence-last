import { beforeEach, describe, expect, mock, test } from "bun:test"

type MatchScoreFixture = {
  offer: {
    id: string
    wilayaCode: string | null
    workMode: "on_site" | "hybrid" | "remote"
  } | null
  profile: {
    wilayaCode: string | null
    bio: string | null
    phone: string | null
    githubUrl: string | null
    portfolioUrl: string | null
    department: string | null
    level: string | null
  } | null
  offerSkills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
  studentSkills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
  languageReqs: Array<{
    languageCode: string
    minimumProficiency: string
    isRequired: boolean
    weight: number
  }>
  languages: Array<{
    languageCode: string
    proficiency: string
  }>
}

let selectResultQueue: unknown[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createQuery(result: any): any {
  const chain = {
    from: mock(() => chain),
    where: mock(() => chain),
    limit: mock(() => chain),
    innerJoin: mock(() => chain),
    then: (
      onFulfilled?: (value: unknown) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  }
  return chain
}

const mockSelect = mock(() => createQuery(selectResultQueue.shift() ?? []))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

function queueMatchScoreQueries(fixture: MatchScoreFixture) {
  selectResultQueue.push(
    fixture.offer ? [fixture.offer] : [],
    fixture.profile ? [fixture.profile] : [],
    fixture.offerSkills,
    fixture.studentSkills,
    fixture.languageReqs,
    fixture.languages,
  )
}

beforeEach(() => {
  selectResultQueue = []
  mockSelect.mockClear()
})

describe("getExplainableMatchScore", () => {
  test("throws when the offer does not exist", async () => {
    queueMatchScoreQueries({
      offer: null,
      profile: null,
      offerSkills: [],
      studentSkills: [],
      languageReqs: [],
      languages: [],
    })

    const { getExplainableMatchScore } = await import(
      "@/server/services/matching/score"
    )

    await expect(
      getExplainableMatchScore("student-1", "offer-missing"),
    ).rejects.toThrow("Offer not found")
    expect(mockSelect).toHaveBeenCalledTimes(6)
  })

  test("returns a perfect score when no hard requirements are present and profile is complete", async () => {
    queueMatchScoreQueries({
      offer: {
        id: "offer-1",
        wilayaCode: null,
        workMode: "remote",
      },
      profile: {
        wilayaCode: "16",
        bio: "Final-year software student",
        phone: "+213555000000",
        githubUrl: "https://github.com/student",
        portfolioUrl: "https://student.dev",
        department: "Computer Science",
        level: "M2",
      },
      offerSkills: [],
      studentSkills: [
        { id: "s1", name: "React", slug: "react", category: "frontend" },
        { id: "s2", name: "Node.js", slug: "node", category: "backend" },
        { id: "s3", name: "SQL", slug: "sql", category: "data" },
      ],
      languageReqs: [],
      languages: [],
    })

    const { getExplainableMatchScore } = await import(
      "@/server/services/matching/score"
    )
    const result = await getExplainableMatchScore("student-1", "offer-1")

    expect(result.score).toBe(100)
    expect(result.readinessPercent).toBe(100)
    expect(result.version).toBe("v1.0.0")
    expect(result.fairnessNotes).toHaveLength(3)
    expect(result.breakdown).toEqual({
      skills: 55,
      language: 20,
      location: 15,
      profile: 10,
    })
    expect(result.missingSkills).toEqual([])
    expect(
      result.reasons.find((reason) => reason.key === "skills_match")?.detail,
    ).toContain("No mandatory skills listed on this offer.")
  })

  test("applies skill, language, location, and profile penalties when required signals are missing", async () => {
    queueMatchScoreQueries({
      offer: {
        id: "offer-2",
        wilayaCode: "16",
        workMode: "on_site",
      },
      profile: {
        wilayaCode: "31",
        bio: "Motivated student",
        phone: null,
        githubUrl: null,
        portfolioUrl: null,
        department: null,
        level: null,
      },
      offerSkills: [
        { id: "s1", name: "React", slug: "react", category: "frontend" },
        { id: "s2", name: "Docker", slug: "docker", category: "devops" },
      ],
      studentSkills: [
        { id: "s1", name: "React", slug: "react", category: "frontend" },
      ],
      languageReqs: [
        {
          languageCode: "en",
          minimumProficiency: "b2",
          isRequired: true,
          weight: 2,
        },
        {
          languageCode: "fr",
          minimumProficiency: "b1",
          isRequired: false,
          weight: 1,
        },
      ],
      languages: [
        { languageCode: "en", proficiency: "b1" },
        { languageCode: "fr", proficiency: "b2" },
      ],
    })

    const { getExplainableMatchScore } = await import(
      "@/server/services/matching/score"
    )
    const result = await getExplainableMatchScore("student-2", "offer-2")

    expect(result.score).toBe(33)
    expect(result.breakdown).toEqual({
      skills: 28,
      language: 0,
      location: 4,
      profile: 1,
    })
    expect(result.missingSkills).toEqual([
      { id: "s2", name: "Docker", slug: "docker", category: "devops" },
    ])
    expect(
      result.reasons.find((reason) => reason.key === "skills_missing")?.impact,
    ).toBe(-27)
    expect(
      result.reasons.find((reason) => reason.key === "language_match")?.detail,
    ).toContain("1/3 weighted requirements met (0/1 required languages met).")
  })

  test("handles missing location data and zero-weight optional language requirements", async () => {
    queueMatchScoreQueries({
      offer: {
        id: "offer-3",
        wilayaCode: null,
        workMode: "hybrid",
      },
      profile: null,
      offerSkills: [
        { id: "s1", name: "TypeScript", slug: "typescript", category: "web" },
      ],
      studentSkills: [
        { id: "s1", name: "TypeScript", slug: "typescript", category: "web" },
      ],
      languageReqs: [
        {
          languageCode: "es",
          minimumProficiency: "b2",
          isRequired: false,
          weight: 0,
        },
      ],
      languages: [],
    })

    const { getExplainableMatchScore } = await import(
      "@/server/services/matching/score"
    )
    const result = await getExplainableMatchScore("student-3", "offer-3")

    expect(result.score).toBe(62)
    expect(result.breakdown).toEqual({
      skills: 55,
      language: 0,
      location: 7,
      profile: 0,
    })
    expect(
      result.reasons.find((reason) => reason.key === "location_alignment")?.impact,
    ).toBe(7)
  })
})

describe("canAccessMatchScore", () => {
  const baseParams = {
    studentUserId: "student-1",
    offerCompanyId: "company-1",
    isOfferVisibleToStudent: true,
    viewerCompanyId: "company-1",
  }

  test("allows super_admin regardless of params", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore({ id: "admin-1", role: "super_admin" }, baseParams),
    ).toBe(true)
  })

  test("allows university_admin regardless of params", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore(
        { id: "uadmin-1", role: "university_admin" },
        baseParams,
      ),
    ).toBe(true)
  })

  test("allows student viewing own score for visible offer", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore({ id: "student-1", role: "student" }, baseParams),
    ).toBe(true)
  })

  test("denies student viewing own score for non-visible offer", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore(
        { id: "student-1", role: "student" },
        { ...baseParams, isOfferVisibleToStudent: false },
      ),
    ).toBe(false)
  })

  test("denies student viewing another student's score", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore({ id: "student-2", role: "student" }, baseParams),
    ).toBe(false)
  })

  test("allows company_admin for their own company's offer", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore(
        { id: "cadmin-1", role: "company_admin" },
        baseParams,
      ),
    ).toBe(true)
  })

  test("allows company_admin even when offer is hidden from students", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore(
        { id: "cadmin-1", role: "company_admin" },
        { ...baseParams, isOfferVisibleToStudent: false },
      ),
    ).toBe(true)
  })

  test("denies company_admin for another company's offer", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore(
        { id: "cadmin-1", role: "company_admin" },
        { ...baseParams, viewerCompanyId: "company-other" },
      ),
    ).toBe(false)
  })

  test("denies company_admin with undefined viewerCompanyId", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore(
        { id: "cadmin-1", role: "company_admin" },
        { ...baseParams, viewerCompanyId: undefined },
      ),
    ).toBe(false)
  })

  test("denies unsupported roles", async () => {
    const { canAccessMatchScore } = await import(
      "@/server/services/matching/score"
    )
    expect(
      canAccessMatchScore({ id: "dh-1", role: "dept_head" }, baseParams),
    ).toBe(false)
  })
})

describe("getOfferAccessContext", () => {
  test("returns offer context when found", async () => {
    selectResultQueue.push([{ companyId: "company-1", status: "published" }])

    const { getOfferAccessContext } = await import(
      "@/server/services/matching/score"
    )
    const result = await getOfferAccessContext("offer-1")

    expect(result).toEqual({
      companyId: "company-1",
      status: "published",
    })
    expect(mockSelect).toHaveBeenCalledTimes(1)
  })

  test("returns draft and closed statuses without remapping", async () => {
    selectResultQueue.push([{ companyId: "company-2", status: "closed" }])

    const { getOfferAccessContext } = await import(
      "@/server/services/matching/score"
    )
    const result = await getOfferAccessContext("offer-2")

    expect(result).toEqual({
      companyId: "company-2",
      status: "closed",
    })
  })

  test("returns null when offer does not exist", async () => {
    selectResultQueue.push([])

    const { getOfferAccessContext } = await import(
      "@/server/services/matching/score"
    )
    const result = await getOfferAccessContext("offer-missing")

    expect(result).toBeNull()
  })
})
