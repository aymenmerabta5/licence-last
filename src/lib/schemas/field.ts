import { z } from "zod"
import type { TranslationFn } from "@/lib/schemas/auth"

export function createFieldSchema(t: TranslationFn) {
  return z.object({
    name: z.string().min(1, { error: t("fieldNameRequired") }).max(200, { error: t("fieldNameTooLong") }),
    description: z.string().optional(),
  })
}
