import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { skillTag } from "@/server/db/schema/skills"

export const studentProfile = pgTable(
  "student_profile",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),

    wilayaCode: integer("wilaya_code"),
    bio: text("bio"),
    phone: text("phone"),
    githubUrl: text("github_url"),
    portfolioUrl: text("portfolio_url"),

    studentNumber: text("student_number"),
    department: text("department"), // deprecated — use departmentId
    departmentId: text("department_id").references(() => department.id, {
      onDelete: "set null",
    }),
    level: text("level"),
    address: text("address"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("student_profile_wilayaCode_idx").on(table.wilayaCode),
    index("student_profile_departmentId_idx").on(table.departmentId),
  ],
)

export const studentSkill = pgTable(
  "student_skill",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    skillTagId: text("skill_tag_id")
      .notNull()
      .references(() => skillTag.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.skillTagId] }),
    index("student_skill_skillTagId_idx").on(table.skillTagId),
  ],
)
