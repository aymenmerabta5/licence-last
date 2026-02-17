import {
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core"

import { university } from "@/server/db/schema/universities"
import { skillTag } from "@/server/db/schema/skills"

export const department = pgTable(
  "department",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => university.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    headName: text("head_name"),
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.departmentId, table.skillTagId] }),
    index("department_skill_skillTagId_idx").on(table.skillTagId),
  ],
)
