import { z } from "zod"

/** Cursor for keyset pagination (createdAt + id). */
const cursorSchema = z
  .object({
    createdAt: z.string().datetime(),
    id: z.string(),
  })
  .optional()

/**
 * Search / filter published internship offers.
 */
export const searchOffersSchema = z.object({
  keyword: z.string().max(200).optional(),
  wilayaCode: z.coerce.number().int().min(1).max(58).optional(),
  internshipTypes: z
    .array(z.enum(["pfe", "immersion", "summer", "practical"]))
    .optional(),
  workModes: z.array(z.enum(["on_site", "hybrid", "remote"])).optional(),
  skillTagIds: z.array(z.string()).max(20).optional(),
  cursor: cursorSchema,
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

/**
 * Apply to an internship offer.
 */
export const applyToOfferSchema = z.object({
  offerId: z.string().min(1),
  coverLetter: z.string().max(5000).optional(),
})

/**
 * List a student's own applications.
 */
export const listStudentApplicationsSchema = z.object({
  status: z
    .enum([
      "applied",
      "company_accepted",
      "company_refused",
      "admin_validated",
      "admin_rejected",
      "withdrawn",
    ])
    .optional(),
  cursor: cursorSchema,
  limit: z.coerce.number().int().min(1).max(50).default(12),
})
