import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core"

import { universityDomainStatusEnum } from "./enums"
import { user } from "./auth"

export const university = pgTable(
  "university",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("university_name_idx").on(table.name)],
)

export const universityDomain = pgTable(
  "university_domain",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => university.id, { onDelete: "cascade" }),
    domain: text("domain").notNull().unique(),
    status: universityDomainStatusEnum("status").default("pending").notNull(),

    requestedByEmail: text("requested_by_email"),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    requestNote: text("request_note"),

    reviewedByUserId: text("reviewed_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at"),
    reviewReason: text("review_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("university_domain_domain_idx").on(table.domain),
    index("university_domain_status_idx").on(table.status),
    index("university_domain_universityId_idx").on(table.universityId),
  ],
)
