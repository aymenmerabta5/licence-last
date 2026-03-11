import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []

const renderAgreementPdfBufferMock = mock(async () => Buffer.from("agreement"))
const renderCertificatePdfBufferMock = mock(async () =>
  Buffer.from("certificate"),
)
const fetchDocumentBufferMock = mock(async () => null as Buffer | null)

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  innerJoin: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}
let moduleImportCounter = 0

function applyDownloadDocumentByCompanyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => ({ from: () => selectBuilder }),
    },
  }))

  mock.module("@/server/services/documents/generate-agreement", () => ({
    renderAgreementPdfBuffer: renderAgreementPdfBufferMock,
  }))

  mock.module("@/server/services/documents/generate-certificate", () => ({
    renderCertificatePdfBuffer: renderCertificatePdfBufferMock,
  }))

  mock.module("@/server/services/documents/persist", () => ({
    fetchDocumentBuffer: fetchDocumentBufferMock,
  }))
}

async function loadDownloadByCompanyModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/documents/download-by-company?test=${moduleImportCounter}`
  )
}

describe("src/server/services/documents/download-by-company", () => {
  beforeEach(() => {
    applyDownloadDocumentByCompanyMocks()
    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
    renderAgreementPdfBufferMock.mockClear()
    renderCertificatePdfBufferMock.mockClear()
    fetchDocumentBufferMock.mockClear()
  })

  test("throws typed not-found error when document is missing", async () => {
    selectResultsQueue.push([])

    const { downloadDocumentByCompany } = await loadDownloadByCompanyModule()

    await expect(
      downloadDocumentByCompany({
        documentId: "doc-1",
        companyId: "company-1",
      }),
    ).rejects.toMatchObject({
      code: "DOCUMENT_NOT_FOUND",
      message: "Document not found",
    })
  })

  test("throws typed forbidden error when company does not own document", async () => {
    selectResultsQueue.push([
      {
        documentType: "certificate",
        placementId: "placement-1",
        companyId: "company-2",
      },
    ])

    const { downloadDocumentByCompany } = await loadDownloadByCompanyModule()

    await expect(
      downloadDocumentByCompany({
        documentId: "doc-1",
        companyId: "company-1",
      }),
    ).rejects.toMatchObject({
      code: "DOCUMENT_FORBIDDEN",
      message: "You do not have access to this document",
    })

    expect(renderAgreementPdfBufferMock).not.toHaveBeenCalled()
    expect(renderCertificatePdfBufferMock).not.toHaveBeenCalled()
  })

  test("throws typed conflict when company document is still pending", async () => {
    selectResultsQueue.push([
      {
        documentType: "certificate",
        placementId: "placement-1",
        companyId: "company-1",
        status: "pending",
      },
    ])

    const { downloadDocumentByCompany } = await loadDownloadByCompanyModule()

    await expect(
      downloadDocumentByCompany({
        documentId: "doc-pending",
        companyId: "company-1",
      }),
    ).rejects.toMatchObject({
      code: "DOCUMENT_NOT_READY",
      message: "Document is not ready for download",
    })

    expect(renderAgreementPdfBufferMock).not.toHaveBeenCalled()
    expect(renderCertificatePdfBufferMock).not.toHaveBeenCalled()
  })

  test("uses snapshot data when stored certificate file is unavailable", async () => {
    selectResultsQueue.push([
      {
        documentType: "certificate",
        placementId: "placement-1",
        companyId: "company-1",
        status: "generated",
        meta: { locale: "fr", fileName: "certificate.pdf" },
        verificationCode: "INTX-ABCD-EF12",
        storageKey: "documents/certificate.pdf",
        snapshotData: {
          studentName: "Student",
          studentEmail: "student@example.com",
          universityName: "University",
          companyName: "Acme",
          offerTitle: "Frontend Internship",
          internshipType: "pfe",
          startDate: "2024-01-01T00:00:00.000Z",
          endDate: "2024-02-01T00:00:00.000Z",
        },
      },
    ])

    const { downloadDocumentByCompany } = await loadDownloadByCompanyModule()

    const result = await downloadDocumentByCompany({
      documentId: "doc-1",
      companyId: "company-1",
    })

    expect(result.fileName).toBe("certificate.pdf")
    expect(fetchDocumentBufferMock).toHaveBeenCalledWith(
      "documents/certificate.pdf",
    )
    expect(renderCertificatePdfBufferMock).toHaveBeenCalledWith({
      placementId: "placement-1",
      locale: "fr",
      verificationCode: "INTX-ABCD-EF12",
      snapshotData: expect.objectContaining({
        studentName: "Student",
        universityName: "University",
      }),
    })
  })
})
