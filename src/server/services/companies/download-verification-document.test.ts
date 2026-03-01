import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []
const getFileMock = mock(async () => Buffer.from("verification-pdf"))

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}

mock.module("@/server/db", () => ({
  db: {
    select: () => ({ from: () => selectBuilder }),
  },
}))

mock.module("@/server/storage/s3", () => ({
  getFile: getFileMock,
}))

describe("src/server/services/companies/download-verification-document", () => {
  beforeEach(() => {
    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
    getFileMock.mockClear()
  })

  test("throws COMPANY_NOT_FOUND when company does not exist", async () => {
    selectResultsQueue.push([])

    const { downloadCompanyVerificationDocument } = await import(
      "@/server/services/companies/download-verification-document"
    )

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

    const { downloadCompanyVerificationDocument } = await import(
      "@/server/services/companies/download-verification-document"
    )

    await expect(
      downloadCompanyVerificationDocument("company-1"),
    ).rejects.toMatchObject({
      code: "COMPANY_VERIFICATION_DOCUMENT_NOT_FOUND",
      message: "Company verification document not found",
    })
    expect(getFileMock).not.toHaveBeenCalled()
  })

  test("downloads file bytes when document metadata is present", async () => {
    selectResultsQueue.push([
      {
        verificationDocumentKey: "company-verification/company-1/doc.pdf",
        verificationDocumentName: "trade-license.pdf",
        verificationDocumentMimeType: "application/pdf",
      },
    ])

    const { downloadCompanyVerificationDocument } = await import(
      "@/server/services/companies/download-verification-document"
    )

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
