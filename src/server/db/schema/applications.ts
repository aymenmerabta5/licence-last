import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import {
  applicationStatusEnum,
  applicationPipelineStageEnum,
} from "./enums"
import { internshipOffer } from "./internships"
import { user } from "./auth"

export const application = pgTable(
  "application",
  {
    id: text("id").primaryKey(),
    offerId: text("offer_id")
      .notNull()
      .references(() => internshipOffer.id, { onDelete: "cascade" }),
    studentUserId: text("student_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: applicationStatusEnum("status").default("applied").notNull(),
    pipelineStage: applicationPipelineStageEnum("pipeline_stage")
      .default("applied")
      .notNull(),
    coverLetter: text("cover_letter"),

    companyActionByUserId: text("company_action_by_user_id").references(
      () => user.id,
      { onDelete: "set null" },
    ),
    companyActionAt: timestamp("company_action_at"),
    companyNote: text("company_note"),

    adminActionByUserId: text("admin_action_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    adminActionAt: timestamp("admin_action_at"),
    adminNote: text("admin_note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    pipelineStageUpdatedAt: timestamp("pipeline_stage_updated_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("application_offer_student_uidx").on(
      table.offerId,
      table.studentUserId,
    ),
    index("application_offerId_idx").on(table.offerId),
    index("application_studentUserId_idx").on(table.studentUserId),
    index("application_status_idx").on(table.status),
    index("application_pipelineStage_idx").on(table.pipelineStage),
  ],
)

export const applicationTimelineEvent = pgTable(
  "application_timeline_event",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => application.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    eventType: text("event_type").notNull(),
    fromStage: applicationPipelineStageEnum("from_stage"),
    toStage: applicationPipelineStageEnum("to_stage"),
    fromStatus: applicationStatusEnum("from_status"),
    toStatus: applicationStatusEnum("to_status"),
    payload: jsonb("payload").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("application_timeline_event_applicationId_idx").on(table.applicationId),
    index("application_timeline_event_actorUserId_idx").on(table.actorUserId),
    index("application_timeline_event_eventType_idx").on(table.eventType),
    index("application_timeline_event_createdAt_idx").on(table.createdAt),
  ],
)
