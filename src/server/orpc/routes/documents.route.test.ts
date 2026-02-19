import { beforeEach, describe, expect, mock, test } from "bun:test"

function createProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return fn
    },
  }
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

const generateAgreementMock = mock(async () => ({
  success: true,
  documentId: "doc-1",
  buffer: Buffer.from("agreement-pdf"),
}))
const downloadDocumentMock = mock(async () => ({
  documentType: "agreement",
  fileName: "agreement.pdf",
  buffer: Buffer.from("pdf"),
}))
const verifyDocumentMock = mock(async () => ({ valid: true }))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  adminProcedureStandard: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  publicProcedureStandard: createProcedureMock(),
  studentProcedureGenerous: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/services/documents/generate-agreement", () => ({
  generateAgreement: generateAgreementMock,
}))
mock.module("@/server/services/documents/list-by-student", () => ({
  listDocumentsByStudent: mock(async () => []),
}))
mock.module("@/server/services/documents/list-by-company", () => ({
  listDocumentsByCompany: mock(async () => []),
}))
mock.module("@/server/services/documents/download", () => ({
  downloadDocument: downloadDocumentMock,
}))
mock.module(
  "@/server/services/documents/generate-certificate-by-company",
  () => ({
    generateCertificateByCompany: mock(async () => ({
      success: true,
      documentId: "doc-2",
      fileName: "certificate.pdf",
      buffer: Buffer.from("certificate-pdf"),
    })),
  }),
)
mock.module("@/server/services/documents/download-by-company", () => ({
  downloadDocumentByCompany: mock(async () => ({
    documentType: "certificate",
    fileName: "certificate.pdf",
    buffer: Buffer.from("pdf"),
  })),
}))
mock.module("@/server/services/documents/verify", () => ({
  verifyDocument: verifyDocumentMock,
}))

describe("src/server/orpc/routes/documents", () => {
  beforeEach(() => {
    generateAgreementMock.mockClear()
    downloadDocumentMock.mockClear()
    verifyDocumentMock.mockClear()
  })

  test("generateAgreementProcedure returns base64 payload", async () => {
    const { generateAgreementProcedure } = await import(
      "@/server/orpc/routes/documents"
    )

    const result = await callProcedure(generateAgreementProcedure, {
      input: { placementId: "placement-1", locale: "en" },
      context: {},
    })

    expect(result).toEqual({
      success: true,
      documentId: "doc-1",
      pdfBase64: Buffer.from("agreement-pdf").toString("base64"),
    })
  })

  test("downloadDocumentProcedure maps not found errors", async () => {
    downloadDocumentMock.mockRejectedValueOnce(new Error("Document not found"))
    const { downloadDocumentProcedure } = await import(
      "@/server/orpc/routes/documents"
    )

    await expect(
      callProcedure(downloadDocumentProcedure, {
        input: { documentId: "doc-1" },
        context: { user: { id: "student-1" } },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Document not found",
    })
  })

  test("verifyDocumentProcedure delegates to verification service", async () => {
    const { verifyDocumentProcedure } = await import(
      "@/server/orpc/routes/documents"
    )

    const result = await callProcedure(verifyDocumentProcedure, {
      input: { code: "INTX-ABCD-EF12" },
      context: {},
    })

    expect(result).toEqual({ valid: true })
    expect(verifyDocumentMock).toHaveBeenCalledWith("INTX-ABCD-EF12")
  })
})
