import { z } from "zod"

export const bulkDepartmentRowSchema = z.object({
  departmentName: z.string().min(2).max(200),
  headEmail: z.string().email(),
  headName: z.string().min(2).max(120),
})

export const bulkCreateDepartmentsSchema = z.object({
  rows: z.array(bulkDepartmentRowSchema).min(1).max(50),
})

export type BulkDepartmentRow = z.infer<typeof bulkDepartmentRowSchema>
export type BulkCreateDepartmentsInput = z.infer<
  typeof bulkCreateDepartmentsSchema
>
