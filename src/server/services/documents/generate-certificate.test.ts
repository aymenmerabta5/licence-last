import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []
const insertResultsQueue: unknown[][] = []

const renderToBufferMock = mock(async () => new Uint8Array([1]))
const generateQRCodeDataUrlMock = mock(async () => "data:image/png;base64,qr")

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  innerJoin: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}

const insertReturningMock = mock(async () => insertResultsQueue.shift() ?? [])
const insertValuesMock = mock(() => ({
  onConflictDoNothing: () => ({ returning: insertReturningMock }),
  returning: insertReturningMock,
}))

const updateWhereMock = mock(async () => undefined)
const updateSetMock = mock(() => ({ where: updateWhereMock }))

function applyGenerateCertificateMocks() {
  mock.module("@react-pdf/renderer", () => ({
    renderToBuffer: renderToBufferMock,
  }))

  mock.module("@/server/pdfs/CertificateTemplate", () => ({
    InternshipCertificateTemplate: () => null,
  }))

  mock.module("@/env", () => ({
    env: { NEXT_PUBLIC_BETTER_AUTH_URL: "https://stag.test" },
  }))

  mock.module("@/server/services/documents/qr-utils", () => ({
    generateQRCodeDataUrl: generateQRCodeDataUrlMock,
  }))

  mock.module("@/server/services/documents/persist", () => ({
    persistDocumentBuffer: mock(async () => null),
    fetchDocumentBuffer: mock(async () => null),
  }))

  mock.module("@/server/db", () => ({
    db: {
      select: () => ({ from: () => selectBuilder }),
      insert: () => ({ values: insertValuesMock }),
      update: () => ({ set: updateSetMock }),
    },
  }))
}

async function importGenerateCertificate() {
  return (await import(
    `@/server/services/documents/generate-certificate?fresh=${Date.now()}`
  )) as typeof import("@/server/services/documents/generate-certificate")
}

describe("src/server/services/documents/generate-certificate", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    applyGenerateCertificateMocks()

    selectResultsQueue.length = 0
    insertResultsQueue.length = 0

    renderToBufferMock.mockClear()
    generateQRCodeDataUrlMock.mockClear()
    selectLimitMock.mockClear()
    insertReturningMock.mockClear()
    insertValuesMock.mockClear()
    updateSetMock.mockClear()
    updateWhereMock.mockClear()

    renderToBufferMock.mockResolvedValue(new Uint8Array([1]))
  })

  test("throws typed error when placement does not exist", async () => {
    selectResultsQueue.push([])

    const { generateCertificate } = await importGenerateCertificate()

    await expect(
      generateCertificate({ placementId: "placement-1" }),
    ).rejects.toMatchObject({
      code: "PLACEMENT_NOT_FOUND",
      message: "Placement not found",
    })
  })

  test("rejects certificate generation when internship has not ended", async () => {
    selectResultsQueue.push(
      [
        {
          id: "placement-1",
          applicationId: "app-1",
          startDate: new Date("2030-01-01"),
          endDate: new Date("2030-06-01"),
        },
      ],
      [
        {
          applicationId: "app-1",
          offerTitle: "Frontend Internship",
          offerInternshipType: "pfe",
          companyName: "Acme",
          studentName: "Student",
          studentEmail: "student@example.com",
          studentUniversityId: null,
        },
      ],
    )

    const { generateCertificate } = await importGenerateCertificate()

    await expect(
      generateCertificate({ placementId: "placement-1", locale: "en" }),
    ).rejects.toMatchObject({
      code: "INTERNSHIP_NOT_COMPLETED",
      message:
        "Certificate can only be generated after the internship end date",
    })
  })

  test("handles concurrent insert conflict and regenerates with canonical verification code", async () => {
    selectResultsQueue.push(
      [
        {
          id: "placement-1",
          applicationId: "app-1",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-02-01"),
        },
      ],
      [
        {
          applicationId: "app-1",
          offerTitle: "Frontend Internship",
          offerInternshipType: "pfe",
          companyName: "Acme",
          studentName: "Student",
          studentEmail: "student@example.com",
          studentUniversityId: null,
        },
      ],
      [],
      [{ id: "doc-existing", verificationCode: "INTX-ZZZZ-YYYY" }],
    )

    insertResultsQueue.push([])

    renderToBufferMock
      .mockResolvedValueOnce(new Uint8Array([1]))
      .mockResolvedValueOnce(new Uint8Array([2]))

    const { generateCertificate } = await importGenerateCertificate()

    const result = await generateCertificate({
      placementId: "placement-1",
      locale: "en",
    })

    expect(result.success).toBe(true)
    expect(result.documentId).toBe("doc-existing")
    expect(result.buffer).toEqual(Buffer.from([2]))
    expect(renderToBufferMock).toHaveBeenCalledTimes(2)
    expect(updateWhereMock).toHaveBeenCalledTimes(1)
  })
})
