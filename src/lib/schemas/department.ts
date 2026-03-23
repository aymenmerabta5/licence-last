import { z } from "zod"
import type { TranslationFn } from "@/lib/schemas/auth"

export function createBulkDepartmentRowSchema(t: TranslationFn) {
  return z.object({
    departmentName: z
      .string()
      .min(2, { error: t("departmentNameMin") })
      .max(200, { error: t("departmentNameMax") }),
    headEmail: z.string().email({ error: t("headEmailInvalid") }),
  })
}

export function createBulkCreateDepartmentsSchema(t: TranslationFn) {
  return z.object({
    rows: z
      .array(createBulkDepartmentRowSchema(t))
      .min(1, { error: t("departmentRowsMin") })
      .max(50, { error: t("departmentRowsMax") }),
  })
}

export const bulkDepartmentRowSchema = createBulkDepartmentRowSchema(
  (key) => key,
)

export const bulkCreateDepartmentsSchema = createBulkCreateDepartmentsSchema(
  (key) => key,
)

export type BulkDepartmentRow = z.infer<typeof bulkDepartmentRowSchema>
export type BulkCreateDepartmentsInput = z.infer<
  typeof bulkCreateDepartmentsSchema
>
