import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockInsert = mock(() => ({}) as any)

const mockValues = mock((): any => Promise.resolve())

const mockTx = {
  insert: mockInsert,
}

const mockTransaction = mock(
  async (fn: (tx: typeof mockTx) => Promise<void>) => {
    await fn(mockTx)
  },
)
const mockValidateSkillTagIds = mock(() => Promise.resolve())

function applyCreateOfferMocks() {
  mock.module("@/server/db", () => ({
    db: {
      transaction: mockTransaction,
    },
  }))

  mock.module("@/server/services/skills/validate", () => ({
    validateSkillTagIds: mockValidateSkillTagIds,
  }))
}

let createOfferImportCounter = 0
async function importCreateOffer() {
  createOfferImportCounter += 1
  return (await import(
    `@/server/services/offers/create?test=${createOfferImportCounter}`
  )) as typeof import("@/server/services/offers/create")
}

describe("src/server/services/offers/create", () => {
  beforeEach(() => {
    applyCreateOfferMocks()

    mockTransaction.mockClear()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockValidateSkillTagIds.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    mockValidateSkillTagIds.mockResolvedValue(undefined)

    mockTransaction.mockImplementation(async (fn) => {
      await fn(mockTx)
    })
  })

  test("should create offer with skills", async () => {
    const { createOffer } = await importCreateOffer()

    const result = await createOffer({
      companyId: "company-1",
      title: "Frontend Intern",
      description: "Work on web projects",
      internshipType: "pfe",
      skillTagIds: ["skill-1", "skill-2"],
    })

    expect(result.offerId).toBeDefined()
    expect(typeof result.offerId).toBe("string")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockInsert).toHaveBeenCalledTimes(2)
  })

  test("should create offer without skills", async () => {
    const { createOffer } = await importCreateOffer()

    const result = await createOffer({
      companyId: "company-1",
      title: "Backend Intern",
      description: "Work on API projects",
      internshipType: "summer",
      skillTagIds: [],
    })

    expect(result.offerId).toBeDefined()
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("should return offerId", async () => {
    const { createOffer } = await importCreateOffer()

    const result = await createOffer({
      companyId: "company-1",
      title: "DevOps Intern",
      description: "Learn CI/CD pipelines",
      internshipType: "immersion",
    })

    expect(result).toHaveProperty("offerId")
    expect(result.offerId.length).toBeGreaterThan(0)
  })
})
