import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []
const getFileMock = mock(async () => Buffer.from("verification-pdf"))

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}
let moduleImportCounter = 0

function applyDownloadVerificationMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => ({ from: () => selectBuilder }),
    },
  }))

  mock.module("@/server/storage/s3", () => ({
    uploadFile: mock(async () => "https://example.com/mock-upload.pdf"),
    deleteFile: mock(async () => {}),
    getFile: getFileMock,
    isConfigured: () => true,
  }))
}

async function loadDownloadVerificationModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/companies/download-verification-document?test=${moduleImportCounter}`
  )
}

describe("src/server/services/companies/download-verification-document", () => {
  beforeEach(() => {
    applyDownloadVerificationMocks()
    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
    getFileMock.mockClear()
  })

  test("throws COMPANY_NOT_FOUND when company does not exist", async () => {
    selectResultsQueue.push([])

    const { downloadCompanyVerificationDocument } =
      await loadDownloadVerificationModule()

    await expect(
      downloadCompanyVerificationDocument("company-missing"),
    ).rejects.toMatchObject({
      code: "COMPANY_NOT_FOUND",
      message: "Company not found",
    })
    expect(getFileMock).not.toHaveBeenCalled()
  })

  test("throws COMPANY_VERIFICATION_DOCUMENT_NOT_FOUND when metadata missing", async () => {
    selectResultsQueue.push([
      {
        verificationDocumentKey: null,
        verificationDocumentName: null,
        verificationDocumentMimeType: null,
      },
    ])

    const { downloadCompanyVerificationDocument } =
      await loadDownloadVerificationModule()

    await expect(
      downloadCompanyVerificationDocument("company-1"),
    ).rejects.toMatchObject({
      code: "COMPANY_VERIFICATION_DOCUMENT_NOT_FOUND",
      message: "Company verification document not found",
    })
    expect(getFileMock).not.toHaveBeenCalled()
  })

  test("throws STORAGE_UNAVAILABLE when S3 is not configured", async () => {
    mock.module("@/server/storage/s3", () => ({
      uploadFile: mock(async () => "https://example.com/mock-upload.pdf"),
      deleteFile: mock(async () => {}),
      getFile: getFileMock,
      isConfigured: () => false,
    }))

    selectResultsQueue.push([
      {
        verificationDocumentKey: "company-verification/company-1/doc.pdf",
        verificationDocumentName: "trade-license.pdf",
        verificationDocumentMimeType: "application/pdf",
      },
    ])

    const { downloadCompanyVerificationDocument } =
      await loadDownloadVerificationModule()

    await expect(
      downloadCompanyVerificationDocument("company-1"),
    ).rejects.toMatchObject({
      code: "STORAGE_UNAVAILABLE",
      message: "File storage is not configured",
    })
    expect(getFileMock).not.toHaveBeenCalled()
  })

  test("throws STORAGE_UNAVAILABLE when S3 getFile fails", async () => {
    getFileMock.mockImplementationOnce(async () => {
      throw new Error("NoSuchBucket: The specified bucket does not exist.")
    })

    selectResultsQueue.push([
      {
        verificationDocumentKey: "company-verification/company-1/doc.pdf",
        verificationDocumentName: "trade-license.pdf",
        verificationDocumentMimeType: "application/pdf",
      },
    ])

    const { downloadCompanyVerificationDocument } =
      await loadDownloadVerificationModule()

    await expect(
      downloadCompanyVerificationDocument("company-1"),
    ).rejects.toMatchObject({
      code: "STORAGE_UNAVAILABLE",
      message: "File storage is temporarily unavailable",
    })
  })

  test("downloads file bytes when document metadata is present", async () => {
    selectResultsQueue.push([
      {
        verificationDocumentKey: "company-verification/company-1/doc.pdf",
        verificationDocumentName: "trade-license.pdf",
        verificationDocumentMimeType: "application/pdf",
      },
    ])

    const { downloadCompanyVerificationDocument } =
      await loadDownloadVerificationModule()

    const result = await downloadCompanyVerificationDocument("company-1")

    expect(getFileMock).toHaveBeenCalledWith(
      "company-verification/company-1/doc.pdf",
    )
    expect(result).toEqual({
      buffer: Buffer.from("verification-pdf"),
      fileName: "trade-license.pdf",
      mimeType: "application/pdf",
    })
  })
})
