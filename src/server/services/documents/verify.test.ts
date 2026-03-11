import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}

let moduleImportCounter = 0

function applyVerifyDocumentMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => ({ from: () => selectBuilder }),
    },
  }))
}

async function loadVerifyDocumentModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/documents/verify?test=${moduleImportCounter}`
  )
}

describe("src/server/services/documents/verify", () => {
  beforeEach(() => {
    applyVerifyDocumentMocks()
    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
  })

  test("returns false when verification code is missing", async () => {
    selectResultsQueue.push([])

    const { verifyDocument } = await loadVerifyDocumentModule()

    await expect(verifyDocument("missing")).resolves.toEqual({ valid: false })
  })

  test("returns snapshot-backed verification data when available", async () => {
    selectResultsQueue.push([
      {
        documentType: "agreement",
        documentStatus: "generated",
        meta: { generatedAt: "2026-03-07T10:00:00.000Z" },
        snapshotData: {
          studentName: "Alex Student",
          companyName: "Acme",
          universityName: "University of Algiers",
          offerTitle: "Frontend Internship",
          startDate: "2024-01-01T00:00:00.000Z",
          endDate: "2024-02-01T00:00:00.000Z",
        },
        placementId: "placement-1",
        createdAt: new Date("2026-03-07T10:00:00.000Z"),
      },
    ])

    const { verifyDocument } = await loadVerifyDocumentModule()

    const result = await verifyDocument("intx-abcd-ef12")

    expect(result).toEqual({
      valid: true,
      documentType: "agreement",
      documentStatus: "generated",
      studentName: "Alex Student",
      companyName: "Acme",
      universityName: "University of Algiers",
      offerTitle: "Frontend Internship",
      startDate: new Date("2024-01-01T00:00:00.000Z"),
      endDate: new Date("2024-02-01T00:00:00.000Z"),
      generatedAt: "2026-03-07T10:00:00.000Z",
    })
  })
})
