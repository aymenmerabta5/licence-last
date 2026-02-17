import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core"

import { universityDomainStatusEnum, universityStatusEnum } from "@/server/db/schema/enums"

export const university = pgTable(
  "university",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    abbreviation: text("abbreviation"),
    address: text("address"),
    city: text("city"),
    wilayaCode: integer("wilaya_code"),
    phone: text("phone"),
    logoUrl: text("logo_url"),
    departmentName: text("department_name"),
    status: universityStatusEnum("status").default("approved").notNull(),
    approvedAt: timestamp("approved_at"),
    approvedByUserId: text("approved_by_user_id"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("university_name_idx").on(table.name),
    index("university_status_idx").on(table.status),
  ],
)

export const universityDomain = pgTable(
  "university_domain",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => university.id, { onDelete: "cascade" }),
    domain: text("domain").notNull().unique(),
    status: universityDomainStatusEnum("status").default("approved").notNull(),
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
