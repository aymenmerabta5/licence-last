import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

import { DocumentServiceError } from "@/server/services/documents/errors"

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

function createCompanyOwnerProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return async (args: {
        context?: { companyMembership?: { role?: string } }
      }) => {
        if (args.context?.companyMembership?.role !== "owner") {
          throw {
            code: "FORBIDDEN",
            message: "Company owner access required",
          }
        }

        return (fn as (value: typeof args) => Promise<unknown>)(args)
      }
    },
  }
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

async function expectProcedureError(
  promise: Promise<unknown>,
  code: string,
  message: string,
) {
  const error = (await promise.catch((value) => value)) as Error & {
    code?: string
  }
  expect(error.code).toBe(code)
  expect(error.message).toBe(message)
}

const generateAgreementMock = mock(async () => ({
  success: true,
  documentId: "doc-1",
  buffer: Buffer.from("agreement-pdf"),
}))
const renderAgreementPdfBufferMock = mock(async () =>
  Buffer.from("agreement-pdf"),
)
const downloadDocumentMock = mock(async () => ({
  documentType: "agreement",
  fileName: "agreement.pdf",
  buffer: Buffer.from("pdf"),
}))
const generateCompanyCertificateMock = mock(async () => ({
  success: true,
  documentId: "doc-2",
  fileName: "certificate.pdf",
  buffer: Buffer.from("certificate-pdf"),
}))
const downloadDocumentByCompanyMock = mock(async () => ({
  documentType: "certificate",
  fileName: "certificate.pdf",
  buffer: Buffer.from("pdf"),
}))
const verifyDocumentMock = mock(async () => ({ valid: true }))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  adminProcedureStandard: createProcedureMock(),
  universityProcedureAssistant: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  companyOwnerProcedureStandard: createCompanyOwnerProcedureMock(),
  publicProcedureStandard: createProcedureMock(),
  studentProcedureGenerous: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/services/documents/generate-agreement", () => ({
  generateAgreement: generateAgreementMock,
  renderAgreementPdfBuffer: renderAgreementPdfBufferMock,
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
    generateCertificateByCompany: generateCompanyCertificateMock,
  }),
)
mock.module("@/server/services/documents/download-by-company", () => ({
  downloadDocumentByCompany: downloadDocumentByCompanyMock,
}))
mock.module("@/server/services/documents/verify", () => ({
  verifyDocument: verifyDocumentMock,
}))

describe("src/server/orpc/routes/documents", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    generateAgreementMock.mockClear()
    renderAgreementPdfBufferMock.mockClear()
    downloadDocumentMock.mockClear()
    generateCompanyCertificateMock.mockClear()
    downloadDocumentByCompanyMock.mockClear()
    verifyDocumentMock.mockClear()
  })

  test("generateAgreementProcedure returns base64 payload and forwards issuer scope", async () => {
    const { generateAgreementProcedure } = await import(
      "@/server/orpc/routes/documents"
    )

    const result = await callProcedure(generateAgreementProcedure, {
      input: { placementId: "placement-1", locale: "en" },
      context: {
        user: {
          id: "admin-1",
          role: "university_admin",
          universityId: "uni-1",
        },
      },
    })

    expect(result).toEqual({
      success: true,
      documentId: "doc-1",
      pdfBase64: Buffer.from("agreement-pdf").toString("base64"),
    })
    expect(generateAgreementMock).toHaveBeenCalledWith({
      placementId: "placement-1",
      locale: "en",
      issuer: {
        userId: "admin-1",
        role: "university_admin",
        universityId: "uni-1",
        departmentId: null,
      },
    })
  })

  test("downloadDocumentProcedure maps not found errors", async () => {
    downloadDocumentMock.mockRejectedValueOnce(
      new DocumentServiceError("DOCUMENT_NOT_FOUND", "Document not found"),
    )
    const { downloadDocumentProcedure } = await import(
      "@/server/orpc/routes/documents"
    )

    await expectProcedureError(
      callProcedure(downloadDocumentProcedure, {
        input: { documentId: "doc-1" },
        context: { user: { id: "student-1" } },
      }),
      "NOT_FOUND",
      "Document not found",
    )
  })

  test("downloadDocumentProcedure maps pending documents to conflict", async () => {
    downloadDocumentMock.mockRejectedValueOnce(
      new DocumentServiceError(
        "DOCUMENT_NOT_READY",
        "Document is not ready for download",
      ),
    )
    const { downloadDocumentProcedure } = await import(
      "@/server/orpc/routes/documents"
    )

    await expectProcedureError(
      callProcedure(downloadDocumentProcedure, {
        input: { documentId: "doc-pending" },
        context: { user: { id: "student-1" } },
      }),
      "CONFLICT",
      "Document is not ready for download",
    )
  })

  test("generateCompanyCertificateProcedure rejects recruiter membership", async () => {
    const { generateCompanyCertificateProcedure } = await import(
      "@/server/orpc/routes/documents"
    )

    await expectProcedureError(
      callProcedure(generateCompanyCertificateProcedure, {
        input: { placementId: "placement-1", locale: "en" },
        context: {
          user: { id: "recruiter-1" },
          companyMembership: { companyId: "company-1", role: "recruiter" },
        },
      }),
      "FORBIDDEN",
      "Company owner access required",
    )
  })

  test("downloadCompanyDocumentProcedure maps pending documents to conflict", async () => {
    downloadDocumentByCompanyMock.mockRejectedValueOnce(
      new DocumentServiceError(
        "DOCUMENT_NOT_READY",
        "Document is not ready for download",
      ),
    )
    const { downloadCompanyDocumentProcedure } = await import(
      "@/server/orpc/routes/documents"
    )

    await expectProcedureError(
      callProcedure(downloadCompanyDocumentProcedure, {
        input: { documentId: "doc-pending" },
        context: {
          user: { id: "owner-1" },
          companyMembership: { companyId: "company-1", role: "owner" },
        },
      }),
      "CONFLICT",
      "Document is not ready for download",
    )
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
