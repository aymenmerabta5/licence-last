import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []

const generateAgreementMock = mock(async () => ({
  success: true,
  documentId: "doc-1",
  buffer: Buffer.from("agreement"),
}))
const generateCertificateMock = mock(async () => ({
  success: true,
  documentId: "doc-2",
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
  },
}))

mock.module("@/server/services/documents/generate-agreement", () => ({
  generateAgreement: generateAgreementMock,
}))

mock.module("@/server/services/documents/generate-certificate", () => ({
  generateCertificate: generateCertificateMock,
}))

describe("src/server/services/documents/download", () => {
  beforeEach(() => {
    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
    generateAgreementMock.mockClear()
    generateCertificateMock.mockClear()
  })

  test("throws typed not-found error when document is missing", async () => {
    selectResultsQueue.push([])

    const { downloadDocument } = await import(
      "@/server/services/documents/download"
    )

    await expect(
      downloadDocument({
        documentId: "doc-1",
        studentUserId: "student-1",
      }),
    ).rejects.toMatchObject({
      code: "DOCUMENT_NOT_FOUND",
      message: "Document not found",
    })
  })

  test("throws typed forbidden error when student does not own document", async () => {
    selectResultsQueue.push([
      {
        documentType: "agreement",
        placementId: "placement-1",
        studentUserId: "student-2",
      },
    ])

    const { downloadDocument } = await import(
      "@/server/services/documents/download"
    )

    await expect(
      downloadDocument({
        documentId: "doc-1",
        studentUserId: "student-1",
      }),
    ).rejects.toMatchObject({
      code: "DOCUMENT_FORBIDDEN",
      message: "You do not have access to this document",
    })

    expect(generateAgreementMock).not.toHaveBeenCalled()
    expect(generateCertificateMock).not.toHaveBeenCalled()
  })
})
