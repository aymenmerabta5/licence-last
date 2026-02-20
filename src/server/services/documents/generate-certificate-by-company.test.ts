import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []

const generateCertificateMock = mock(async () => ({
  success: true,
  documentId: "doc-1",
  buffer: Buffer.from("certificate"),
}))

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  innerJoin: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}

mock.module("@/server/db", () => ({
  db: {
    select: () => ({ from: () => selectBuilder }),
    update: () => ({
      set: () => ({
        where: async () => undefined,
      }),
    }),
  },
}))

mock.module("@/server/services/documents/generate-certificate", () => ({
  generateCertificate: generateCertificateMock,
}))

mock.module("@/server/services/notifications/create", () => ({
  createNotification: mock(async () => ({
    id: "notification-1",
    skipped: false,
  })),
}))

mock.module("@/server/services/documents/send-certificate-email", () => ({
  sendCertificateEmail: mock(async () => undefined),
}))

describe("src/server/services/documents/generate-certificate-by-company", () => {
  beforeEach(() => {
    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
    generateCertificateMock.mockClear()
  })

  test("throws typed not-found error when placement is missing", async () => {
    selectResultsQueue.push([])

    const { generateCertificateByCompany } = await import(
      "@/server/services/documents/generate-certificate-by-company"
    )

    await expect(
      generateCertificateByCompany({
        placementId: "placement-1",
        companyId: "company-1",
        issuedByUserId: "admin-1",
        locale: "en",
      }),
    ).rejects.toMatchObject({
      code: "PLACEMENT_NOT_FOUND",
      message: "Placement not found",
    })

    expect(generateCertificateMock).not.toHaveBeenCalled()
  })
})
