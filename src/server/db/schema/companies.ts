import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { user } from "@/server/db/schema/auth"
import {
  companyMemberRoleEnum,
  companyStatusEnum,
} from "@/server/db/schema/enums"

export const company = pgTable(
  "company",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    phone: text("phone"),
    contactEmail: text("contact_email"),
    representativeName: text("representative_name"),
    wilayaCode: integer("wilaya_code"),
    address: text("address"),
    status: companyStatusEnum("status").default("pending").notNull(),
    approvedAt: timestamp("approved_at"),
    approvedByUserId: text("approved_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("company_slug_idx").on(table.slug),
    index("company_wilayaCode_idx").on(table.wilayaCode),
    index("company_status_idx").on(table.status),
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
    uniqueIndex("company_member_userId_uidx").on(table.userId),
    index("company_member_companyId_idx").on(table.companyId),
  ],
)
