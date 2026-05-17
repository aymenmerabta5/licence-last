import {
  type AnyPgColumn,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { interviewStatusEnum } from "@/server/db/schema/enums"
import { internshipOffer } from "@/server/db/schema/internships"

export const interview = pgTable(
  "interview",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => application.id, { onDelete: "cascade" }),
    offerId: text("offer_id")
      .notNull()
      .references(() => internshipOffer.id, { onDelete: "cascade" }),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    studentUserId: text("student_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    proposedByUserId: text("proposed_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    confirmedByUserId: text("confirmed_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    confirmedSlotId: text("confirmed_slot_id").references(
      (): AnyPgColumn => interviewSlot.id,
      { onDelete: "set null" },
    ),
    status: interviewStatusEnum("status")
      .default("pending_confirmation")
      .notNull(),
    note: text("note"),
    rescheduleNote: text("reschedule_note"),
    rescheduleRequestedAt: timestamp("reschedule_requested_at"),
    rescheduleRequestedByUserId: text(
      "reschedule_requested_by_user_id",
    ).references(() => user.id, { onDelete: "set null" }),
    confirmedAt: timestamp("confirmed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("interview_applicationId_uidx").on(table.applicationId),
    index("interview_offerId_idx").on(table.offerId),
    index("interview_companyId_idx").on(table.companyId),
    index("interview_studentUserId_idx").on(table.studentUserId),
    index("interview_status_idx").on(table.status),
    index("interview_proposedByUserId_idx").on(table.proposedByUserId),
    index("interview_confirmedByUserId_idx").on(table.confirmedByUserId),
    index("interview_rescheduleRequestedByUserId_idx").on(
      table.rescheduleRequestedByUserId,
    ),
  ],
)

export const interviewSlot = pgTable(
  "interview_slot",
  {
    id: text("id").primaryKey(),
    interviewId: text("interview_id")
      .notNull()
      .references(() => interview.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at").notNull(),
    location: text("location"),
    meetingUrl: text("meeting_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("interview_slot_interviewId_idx").on(table.interviewId),
    index("interview_slot_startsAt_idx").on(table.startsAt),
  ],
)
