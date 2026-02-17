import { pgTable, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core"

import { internshipOffer } from "@/server/db/schema/internships"
import { user } from "@/server/db/schema/auth"

export const studentOfferReadinessSnapshot = pgTable(
  "student_offer_readiness_snapshot",
  {
    id: text("id").primaryKey(),
    studentUserId: text("student_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    offerId: text("offer_id")
      .notNull()
      .references(() => internshipOffer.id, { onDelete: "cascade" }),
    readyPercent: integer("ready_percent").notNull(),
    missingSkillsCount: integer("missing_skills_count").notNull(),
    source: text("source").default("offer_view").notNull(),
    meta: jsonb("meta").default({}).notNull(),
    capturedAt: timestamp("captured_at").defaultNow().notNull(),
  },
  (table) => [
    index("student_offer_readiness_snapshot_student_offer_idx").on(
      table.studentUserId,
      table.offerId,
    ),
    index("student_offer_readiness_snapshot_capturedAt_idx").on(table.capturedAt),
    index("student_offer_readiness_snapshot_offerId_idx").on(table.offerId),
  ],
)
