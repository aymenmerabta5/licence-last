"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { uploadImageToS3 } from "@/server/services/uploads/upload-image"

export async function uploadFileAction(
  formData: FormData,
): Promise<{ url: string; key: string } | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized" }
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { error: "No file provided" }
  }

  try {
    const folder = formData.get("folder")
    return await uploadImageToS3({
      file,
      folder: typeof folder === "string" ? folder : undefined,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"

    if (
      message.startsWith("Invalid file type") ||
      message.startsWith("File too large") ||
      message.startsWith("File content")
    ) {
      return { error: message }
    }

    if (message.startsWith("S3 is not configured")) {
      return { error: message }
    }

    return { error: "Upload failed. Please try again." }
  }
}
