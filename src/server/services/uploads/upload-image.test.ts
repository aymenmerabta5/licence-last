import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockUploadFile = mock(() => Promise.resolve("https://s3.example.com/uploads/test.jpg"))

mock.module("@/server/storage/s3", () => ({
  uploadFile: mockUploadFile,
}))

describe("src/server/services/uploads/upload-image", () => {
  beforeEach(() => {
    mockUploadFile.mockClear()
    mockUploadFile.mockResolvedValue("https://s3.example.com/uploads/test.jpg")
  })

  function createMockFile(type: string, content: number[], size?: number): File {
    const buffer = new Uint8Array(content)
    const blob = new Blob([buffer], { type })
    const file = new File([blob], "test-image", { type })
    if (size !== undefined) {
      Object.defineProperty(file, "size", { value: size })
    }
    return file
  }

  test("should reject disallowed file types", async () => {
    const { uploadImageToS3 } = await import("./upload-image")
    const file = createMockFile("image/gif", [0x47, 0x49, 0x46, 0x38])

    await expect(uploadImageToS3({ file })).rejects.toThrow("Invalid file type")
  })

  test("should reject files exceeding 2MB", async () => {
    const { uploadImageToS3 } = await import("./upload-image")
    const file = createMockFile(
      "image/jpeg",
      [0xff, 0xd8, 0xff],
      3 * 1024 * 1024, // 3MB
    )

    await expect(uploadImageToS3({ file })).rejects.toThrow("File too large")
  })

  test("should reject mismatched magic bytes", async () => {
    const { uploadImageToS3 } = await import("./upload-image")
    // PNG magic bytes but claiming JPEG type
    const file = createMockFile(
      "image/jpeg",
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    )

    await expect(uploadImageToS3({ file })).rejects.toThrow("File content does not match declared type")
  })

  test("should upload valid JPEG file", async () => {
    const { uploadImageToS3 } = await import("./upload-image")
    const file = createMockFile(
      "image/jpeg",
      [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46],
    )

    const result = await uploadImageToS3({ file })

    expect(result.url).toBeDefined()
    expect(result.key).toMatch(/^uploads\/.*\.jpg$/)
    expect(mockUploadFile).toHaveBeenCalledTimes(1)
  })

  test("should use custom folder", async () => {
    const { uploadImageToS3 } = await import("./upload-image")
    const file = createMockFile(
      "image/jpeg",
      [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46],
    )

    const result = await uploadImageToS3({ file, folder: "avatars" })

    expect(result.key).toMatch(/^avatars\/.*\.jpg$/)
  })

  test("should sanitize folder path", async () => {
    const { uploadImageToS3 } = await import("./upload-image")
    const file = createMockFile(
      "image/jpeg",
      [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46],
    )

    const result = await uploadImageToS3({ file, folder: "../../etc/passwd" })

    // Path traversal chars should be stripped
    expect(result.key).toMatch(/^etcpasswd\//)
  })
})
