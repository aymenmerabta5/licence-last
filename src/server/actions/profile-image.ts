"use server"

import { randomUUID } from "node:crypto"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { uploadFile, deleteFile } from "@/server/storage/s3"
import { logger } from "@/server/logging"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

const MAX_SIZE = 2 * 1024 * 1024 // 2MB

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

// Magic bytes for each allowed image type
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
}

/** Validate file content matches declared MIME type via magic bytes. */
function validateMagicBytes(buffer: Buffer, declaredType: string): boolean {
  const signatures = MAGIC_BYTES[declaredType]
  if (!signatures) return false

  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte),
  )
}

/** Extract S3 key from public URL */
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // Remove leading slash to get the key
    return urlObj.pathname.slice(1)
  } catch {
    return null
  }
}

export async function uploadProfileImage(
  formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided" }
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { success: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP" }
  }

  if (file.size > MAX_SIZE) {
    return { success: false, error: "File too large. Maximum size is 2MB" }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Validate actual file content matches declared MIME type
  if (!validateMagicBytes(buffer, file.type)) {
    return { success: false, error: "File content does not match declared type" }
  }

  const ext = EXT_MAP[file.type] ?? "jpg"
  const key = `profiles/${session.user.id}/${randomUUID()}.${ext}`

  try {
    // Delete old profile image if exists
    const currentUser = await db
      .select({ image: user.image })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    if (currentUser[0]?.image) {
      const oldKey = extractKeyFromUrl(currentUser[0].image)
      if (oldKey) {
        try {
          await deleteFile(oldKey)
        } catch {
          // Ignore deletion errors, proceed with upload
        }
      }
    }

    // Upload new image
    const url = await uploadFile(key, buffer, file.type)

    // Update user record
    await db
      .update(user)
      .set({ image: url, updatedAt: new Date() })
      .where(eq(user.id, session.user.id))

    revalidatePath("/en/dashboard/settings")
    revalidatePath("/en/dashboard/profile")

    return { success: true, url }
  } catch (error) {
    logger.error({ err: error, operation: "uploadProfileImage", userId: session.user.id }, "Profile image upload failed")
    return { success: false, error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

export async function deleteProfileImage(): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Get current user image
    const currentUser = await db
      .select({ image: user.image })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    if (currentUser[0]?.image) {
      const key = extractKeyFromUrl(currentUser[0].image)
      if (key) {
        try {
          await deleteFile(key)
        } catch {
          // Ignore deletion errors, proceed with DB update
        }
      }
    }

    // Update user record to remove image
    await db
      .update(user)
      .set({ image: null, updatedAt: new Date() })
      .where(eq(user.id, session.user.id))

    revalidatePath("/en/dashboard/settings")
    revalidatePath("/en/dashboard/profile")

    return { success: true }
  } catch {
    return { success: false, error: "Delete failed. Please try again." }
  }
}
