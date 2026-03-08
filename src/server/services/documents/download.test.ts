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

function applyDownloadDocumentMocks() {
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

async function loadDownloadDocumentModule() {
  moduleImportCounter += 1
  return import(`@/server/services/documents/download?test=${moduleImportCounter}`)
}

describe("src/server/services/documents/download", () => {
  beforeEach(() => {
    applyDownloadDocumentMocks()
    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
    renderAgreementPdfBufferMock.mockClear()
    renderCertificatePdfBufferMock.mockClear()
    fetchDocumentBufferMock.mockClear()
  })

  test("throws typed not-found error when document is missing", async () => {
    selectResultsQueue.push([])

    const { downloadDocument } = await loadDownloadDocumentModule()

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

    const { downloadDocument } = await loadDownloadDocumentModule()

    await expect(
      downloadDocument({
        documentId: "doc-1",
        studentUserId: "student-1",
      }),
    ).rejects.toMatchObject({
      code: "DOCUMENT_FORBIDDEN",
      message: "You do not have access to this document",
    })

    expect(renderAgreementPdfBufferMock).not.toHaveBeenCalled()
    expect(renderCertificatePdfBufferMock).not.toHaveBeenCalled()
  })

  test("throws typed conflict when document is still pending", async () => {
    selectResultsQueue.push([
      {
        documentType: "agreement",
        placementId: "placement-1",
        studentUserId: "student-1",
        status: "pending",
      },
    ])

    const { downloadDocument } = await loadDownloadDocumentModule()

    await expect(
      downloadDocument({
        documentId: "doc-pending",
        studentUserId: "student-1",
      }),
    ).rejects.toMatchObject({
      code: "DOCUMENT_NOT_READY",
      message: "Document is not ready for download",
    })

    expect(renderAgreementPdfBufferMock).not.toHaveBeenCalled()
    expect(renderCertificatePdfBufferMock).not.toHaveBeenCalled()
  })

  test("uses snapshot data when stored agreement file is unavailable", async () => {
    selectResultsQueue.push([
      {
        documentType: "agreement",
        placementId: "placement-1",
        studentUserId: "student-1",
        status: "generated",
        meta: { locale: "en", fileName: "agreement.pdf" },
        verificationCode: "INTX-ABCD-EF12",
        storageKey: "documents/agreement.pdf",
        snapshotData: {
          studentName: "Student",
          studentEmail: "student@example.com",
          companyName: "Acme",
          offerTitle: "Frontend Internship",
          internshipType: "pfe",
          startDate: "2024-01-01T00:00:00.000Z",
          endDate: "2024-02-01T00:00:00.000Z",
        },
      },
    ])

    const { downloadDocument } = await loadDownloadDocumentModule()

    const result = await downloadDocument({
      documentId: "doc-1",
      studentUserId: "student-1",
    })

    expect(result.fileName).toBe("agreement.pdf")
    expect(fetchDocumentBufferMock).toHaveBeenCalledWith(
      "documents/agreement.pdf",
    )
    expect(renderAgreementPdfBufferMock).toHaveBeenCalledWith({
      placementId: "placement-1",
      locale: "en",
      verificationCode: "INTX-ABCD-EF12",
      snapshotData: expect.objectContaining({
        studentName: "Student",
        companyName: "Acme",
      }),
    })
  })
})
