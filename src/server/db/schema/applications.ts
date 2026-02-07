import {
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { applicationStatusEnum } from "./enums"
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
  ],
)
