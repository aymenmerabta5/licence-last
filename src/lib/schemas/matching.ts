import { z } from "zod"

export const getMatchingScoreSchema = z.object({
  studentUserId: z.string().min(1),
  offerId: z.string().min(1),
})

export const getSkillGapSchema = z.object({
  studentUserId: z.string().min(1),
  offerId: z.string().min(1),
})

export const getReadinessHistorySchema = z.object({
  studentUserId: z.string().min(1),
  offerId: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const captureReadinessSnapshotSchema = z.object({
  offerId: z.string().min(1),
  source: z
    .enum(["offer_view", "profile_update", "manual"])
    .default("offer_view"),
})
