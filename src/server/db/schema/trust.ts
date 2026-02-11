import { pgTable, text, timestamp, integer, boolean, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core"

import { placement } from "./placements"
import { company } from "./companies"
import { user } from "./auth"
import { companyReportSeverityEnum, companyReportStatusEnum } from "./enums"

export const companyQualityFeedback = pgTable(
  "company_quality_feedback",
  {
    id: text("id").primaryKey(),
    placementId: text("placement_id")
      .notNull()
      .references(() => placement.id, { onDelete: "cascade" }),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    studentUserId: text("student_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    wouldRecommend: boolean("would_recommend").default(false).notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("company_quality_feedback_placement_uidx").on(table.placementId),
    index("company_quality_feedback_company_idx").on(table.companyId),
    index("company_quality_feedback_student_idx").on(table.studentUserId),
  ],
)

export const companyReport = pgTable(
  "company_report",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    reporterUserId: text("reporter_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    severity: companyReportSeverityEnum("severity").default("medium").notNull(),
    description: text("description").notNull(),
    status: companyReportStatusEnum("status").default("open").notNull(),
    resolutionNote: text("resolution_note"),
    resolvedByUserId: text("resolved_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at"),
    meta: jsonb("meta").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("company_report_company_idx").on(table.companyId),
    index("company_report_status_idx").on(table.status),
    index("company_report_severity_idx").on(table.severity),
    index("company_report_reporter_idx").on(table.reporterUserId),
  ],
)
