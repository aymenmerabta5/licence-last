import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/pg-core"

import { companyMemberRoleEnum } from "./enums"
import { user } from "./auth"

export const company = pgTable(
  "company",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    wilayaCode: integer("wilaya_code"),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("company_slug_idx").on(table.slug),
    index("company_wilayaCode_idx").on(table.wilayaCode),
  ],
)

export const companyMember = pgTable(
  "company_member",
  {
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: companyMemberRoleEnum("role").default("recruiter").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.companyId, table.userId] }),
    index("company_member_userId_idx").on(table.userId),
    index("company_member_companyId_idx").on(table.companyId),
  ],
)
