import { beforeEach, describe, expect, mock, test } from "bun:test"

const uploadFileMock = mock(() =>
  Promise.resolve("https://s3.example.com/company-verification/doc.pdf"),
)

function applyUploadCompanyVerificationDocumentMocks() {
  mock.module("@/server/storage/s3", () => ({
    uploadFile: uploadFileMock,
    deleteFile: mock(async () => {}),
    getFile: mock(async () => Buffer.from("")),
    isConfigured: () => true,
  }))
}

let uploadCompanyVerificationDocumentImportCounter = 0
async function importUploadCompanyVerificationDocument() {
  uploadCompanyVerificationDocumentImportCounter += 1
  return import(
    `@/server/services/uploads/upload-company-verification-document?test=${uploadCompanyVerificationDocumentImportCounter}`
  )
}

function createMockFile(
  type: string,
  content: number[],
  size?: number,
  name = "verification-document",
): File {
  const buffer = new Uint8Array(content)
  const blob = new Blob([buffer], { type })
  const file = new File([blob], name, { type })
  if (size !== undefined) {
    Object.defineProperty(file, "size", { value: size })
  }
  return file
}

describe("src/server/services/uploads/upload-company-verification-document", () => {
  beforeEach(() => {
    applyUploadCompanyVerificationDocumentMocks()

    uploadFileMock.mockClear()
    uploadFileMock.mockResolvedValue(
      "https://s3.example.com/company-verification/doc.pdf",
    )
  })

  test("rejects unsupported MIME types", async () => {
    const { uploadCompanyVerificationDocument } =
      await importUploadCompanyVerificationDocument()
    const file = createMockFile("application/msword", [0x00, 0x01], undefined)

    await expect(
      uploadCompanyVerificationDocument({
        file,
        userId: "company-admin-1",
      }),
    ).rejects.toThrow("Verification document must be a PDF, JPEG, or PNG file")
  })

  test("rejects files larger than 10MB", async () => {
    const { uploadCompanyVerificationDocument } =
      await importUploadCompanyVerificationDocument()
    const file = createMockFile(
      "application/pdf",
      [0x25, 0x50, 0x44, 0x46],
      11 * 1024 * 1024,
      "oversize.pdf",
    )

    await expect(
      uploadCompanyVerificationDocument({
        file,
        userId: "company-admin-1",
      }),
    ).rejects.toThrow("Verification document file size cannot exceed 10MB")
  })

  test("rejects mismatched magic bytes", async () => {
    const { uploadCompanyVerificationDocument } =
      await importUploadCompanyVerificationDocument()
    const file = createMockFile(
      "application/pdf",
      [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10],
      undefined,
      "fake.pdf",
    )

    await expect(
      uploadCompanyVerificationDocument({
        file,
        userId: "company-admin-1",
      }),
    ).rejects.toThrow("File content does not match declared document type")
  })

  test("uploads valid PDF document with metadata", async () => {
    const { uploadCompanyVerificationDocument } =
      await importUploadCompanyVerificationDocument()
    const file = createMockFile(
      "application/pdf",
      [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37],
      undefined,
      "trade-license.pdf",
    )

    const result = await uploadCompanyVerificationDocument({
      file,
      userId: "company-admin-1",
    })

    expect(uploadFileMock).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({
      fileName: "trade-license.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: file.size,
    })
    expect(result.key).toMatch(
      /^company-verification\/company-admin-1\/[a-f0-9-]+\.pdf$/,
    )
  })
})
