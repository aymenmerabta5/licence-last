import {
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { user } from "@/server/db/schema/auth"
import { field } from "@/server/db/schema/fields"
import { skillCategory, skillTag } from "@/server/db/schema/skills"
import { university } from "@/server/db/schema/universities"

export const department = pgTable(
  "department",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => university.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    fieldId: text("field_id").references(() => field.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("department_name_university_uidx").on(
      table.name,
      table.universityId,
    ),
    index("department_universityId_idx").on(table.universityId),
  ],
)

export const departmentSkill = pgTable(
  "department_skill",
  {
    departmentId: text("department_id")
      .notNull()
      .references(() => department.id, { onDelete: "cascade" }),
    skillTagId: text("skill_tag_id")
      .notNull()
      .references(() => skillTag.id, { onDelete: "cascade" }),
    action: text("action").notNull().default("add"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.departmentId, table.skillTagId] }),
    index("department_skill_skillTagId_idx").on(table.skillTagId),
  ],
)

export const departmentCategory = pgTable(
  "department_category",
  {
    id: serial("id").primaryKey(),
    departmentId: text("department_id")
      .notNull()
      .references(() => department.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => skillCategory.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("department_category_department_category_uidx").on(
      table.departmentId,
      table.categoryId,
    ),
    index("department_category_department_id_idx").on(table.departmentId),
  ],
)
