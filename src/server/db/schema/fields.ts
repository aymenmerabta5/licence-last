import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { skillTag } from "@/server/db/schema/skills"

export const field = pgTable(
  "field",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("field_slug_idx").on(table.slug),
    index("field_name_idx").on(table.name),
  ],
)

export const fieldSkill = pgTable(
  "field_skill",
  {
    fieldId: text("field_id")
      .notNull()
      .references(() => field.id, { onDelete: "cascade" }),
    skillTagId: text("skill_tag_id")
      .notNull()
      .references(() => skillTag.id, { onDelete: "cascade" }),
    isCore: boolean("is_core").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.fieldId, table.skillTagId] }),
    index("field_skill_skillTagId_idx").on(table.skillTagId),
  ],
)
