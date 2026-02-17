import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/pg-core"

import { internshipTypeEnum, offerStatusEnum, workModeEnum } from "@/server/db/schema/enums"
import { company } from "@/server/db/schema/companies"
import { skillTag } from "@/server/db/schema/skills"

export const internshipOffer = pgTable(
  "internship_offer",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    internshipType: internshipTypeEnum("internship_type").notNull(),
    workMode: workModeEnum("work_mode"),
    wilayaCode: integer("wilaya_code"),
    durationWeeks: integer("duration_weeks"),
    maxPositions: integer("max_positions").default(1).notNull(),
    status: offerStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    applicationDeadlineAt: timestamp("application_deadline_at"),
    expectedStartDate: timestamp("expected_start_date"),
    expectedEndDate: timestamp("expected_end_date"),
    closesAt: timestamp("closes_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("internship_offer_companyId_idx").on(table.companyId),
    index("internship_offer_status_idx").on(table.status),
    index("internship_offer_wilayaCode_idx").on(table.wilayaCode),
    index("internship_offer_createdAt_idx").on(table.createdAt),
  ],
)

export const internshipOfferSkill = pgTable(
  "internship_offer_skill",
  {
    offerId: text("offer_id")
      .notNull()
      .references(() => internshipOffer.id, { onDelete: "cascade" }),
    skillTagId: text("skill_tag_id")
      .notNull()
      .references(() => skillTag.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.offerId, table.skillTagId] }),
    index("internship_offer_skill_skillTagId_idx").on(table.skillTagId),
  ],
)
