import { describe, test, expect } from "bun:test"

import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  IMAGE_EXT_MAP,
  validateMagicBytes,
} from "./image-validation"

describe("src/lib/image-validation", () => {
  describe("ALLOWED_IMAGE_TYPES", () => {
    test("includes jpeg, png, and webp", () => {
      expect(ALLOWED_IMAGE_TYPES.has("image/jpeg")).toBe(true)
      expect(ALLOWED_IMAGE_TYPES.has("image/png")).toBe(true)
      expect(ALLOWED_IMAGE_TYPES.has("image/webp")).toBe(true)
    })

    test("rejects unsupported types", () => {
      expect(ALLOWED_IMAGE_TYPES.has("image/gif")).toBe(false)
      expect(ALLOWED_IMAGE_TYPES.has("image/svg+xml")).toBe(false)
      expect(ALLOWED_IMAGE_TYPES.has("application/pdf")).toBe(false)
    })
  })

  describe("MAX_IMAGE_SIZE", () => {
    test("is 2MB", () => {
      expect(MAX_IMAGE_SIZE).toBe(2 * 1024 * 1024)
    })
  })

  describe("IMAGE_EXT_MAP", () => {
    test("maps MIME types to extensions", () => {
      expect(IMAGE_EXT_MAP["image/jpeg"]).toBe("jpg")
      expect(IMAGE_EXT_MAP["image/png"]).toBe("png")
      expect(IMAGE_EXT_MAP["image/webp"]).toBe("webp")
    })
  })

  describe("validateMagicBytes", () => {
    test("validates JPEG magic bytes (FF D8 FF)", () => {
      const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
      expect(validateMagicBytes(validJpeg, "image/jpeg")).toBe(true)
    })

    test("rejects invalid JPEG magic bytes", () => {
      const invalidJpeg = Buffer.from([0x89, 0x50, 0x4e, 0x47])
      expect(validateMagicBytes(invalidJpeg, "image/jpeg")).toBe(false)
    })

    test("validates PNG full 8-byte header", () => {
      const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      expect(validateMagicBytes(validPng, "image/png")).toBe(true)
    })

    test("rejects PNG with only 4-byte header (partial)", () => {
      // Only first 4 bytes of PNG header — should fail since we check all 8
      const partialPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x00, 0x00])
      expect(validateMagicBytes(partialPng, "image/png")).toBe(false)
    })

    test("validates WebP magic bytes (RIFF + WEBP)", () => {
      // RIFF header + 4 bytes file size + WEBP marker
      const validWebp = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // file size (don't care)
        0x57, 0x45, 0x42, 0x50, // WEBP
      ])
      expect(validateMagicBytes(validWebp, "image/webp")).toBe(true)
    })

    test("rejects WebP with RIFF but without WEBP marker", () => {
      const invalidWebp = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00,
        0x41, 0x56, 0x49, 0x20, // AVI (not WEBP)
      ])
      expect(validateMagicBytes(invalidWebp, "image/webp")).toBe(false)
    })

    test("rejects unknown MIME type", () => {
      const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00])
      expect(validateMagicBytes(buffer, "image/gif")).toBe(false)
    })

    test("rejects buffer that is too short", () => {
      const shortBuffer = Buffer.from([0xff, 0xd8])
      expect(validateMagicBytes(shortBuffer, "image/jpeg")).toBe(false)
    })

    test("rejects mismatched type and bytes", () => {
      // PNG bytes but claiming JPEG
      const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      expect(validateMagicBytes(pngBytes, "image/jpeg")).toBe(false)

      // JPEG bytes but claiming PNG
      const jpegBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x00, 0x00])
      expect(validateMagicBytes(jpegBytes, "image/png")).toBe(false)
    })
  })
})
