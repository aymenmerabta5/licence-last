import { z } from "zod"

export const studentProfileDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters." })
    .max(120),
  bio: z.string().optional(),
  phone: z.string().optional(),
  githubUrl: z
    .string()
    .url({ error: "Invalid GitHub URL." })
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url({ error: "Invalid website URL." })
    .optional()
    .or(z.literal("")),
  studentNumber: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  wilayaCode: z.coerce
    .number()
    .int()
    .min(1)
    .max(58)
    .optional()
    .or(z.literal(0)),
  address: z.string().optional(),
})
