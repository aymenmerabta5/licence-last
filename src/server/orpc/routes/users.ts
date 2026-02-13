import "server-only"

import { z } from "zod"
import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"

import {
  authedProcedureGenerous,
  authedProcedureStandard,
  superAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { userRoleSchema } from "@/lib/schemas/enums"
import { getMe } from "@/server/services/users/get-me"
import { updateMe } from "@/server/services/users/update-me"
import { promoteUser } from "@/server/services/users/promote"
import { uploadImageToS3 } from "@/server/services/uploads/upload-image"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { deleteFile } from "@/server/storage/s3"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("orpc/routes/users")

export const getMeProcedure = authedProcedureGenerous.handler(async ({ context }) =>
  getMe(context.user),
)

export const updateMeProcedure = authedProcedureStandard
  .input(
    z.object({
      name: z.string().trim().min(2).max(120).or(z.literal("")),
    }),
  )
  .handler(async ({ input, context }) => {
    return updateMe(context.user.id, {
      name: input.name === "" ? null : input.name,
    })
  })

export const promoteUserProcedure = superAdminProcedureStandard
  .input(
    z.object({
      userId: z.string().min(1),
      newRole: userRoleSchema,
    }),
  )
  .handler(async ({ input }) => promoteUser(input.userId, input.newRole))

/** Extract S3 key from public URL */
function extractKeyFromUrl(url: string): string | null {
  try {
    return new URL(url).pathname.slice(1)
  } catch {
    return null
  }
}

export const uploadAvatarProcedure = authedProcedureStandard
  .input(z.object({ file: z.file() }))
  .handler(async ({ input, context }) => {
    try {
      const { url } = await uploadImageToS3({ file: input.file, folder: "avatars" })

      // Delete old avatar from S3 if exists
      const [current] = await db
        .select({ image: user.image })
        .from(user)
        .where(eq(user.id, context.user.id))
        .limit(1)

      if (current?.image) {
        const oldKey = extractKeyFromUrl(current.image)
        if (oldKey) {
          try { await deleteFile(oldKey) }
          catch (err) { log.warn({ err, oldKey }, "Failed to delete old avatar") }
        }
      }

      await updateMe(context.user.id, { image: url })
      return { url }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed"

      if (
        message.startsWith("Invalid file type") ||
        message.startsWith("File too large") ||
        message.startsWith("File content")
      ) {
        throw new ORPCError("BAD_REQUEST", { message })
      }

      if (message.startsWith("S3 is not configured")) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message })
      }

      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Upload failed. Please try again.",
      })
    }
  })

export const deleteAvatarProcedure = authedProcedureStandard.handler(
  async ({ context }) => {
    const [current] = await db
      .select({ image: user.image })
      .from(user)
      .where(eq(user.id, context.user.id))
      .limit(1)

    if (current?.image) {
      const key = extractKeyFromUrl(current.image)
      if (key) {
        try { await deleteFile(key) }
        catch (err) { log.warn({ err, key }, "Failed to delete avatar from S3") }
      }
    }

    await updateMe(context.user.id, { image: null })
    return { success: true }
  },
)
