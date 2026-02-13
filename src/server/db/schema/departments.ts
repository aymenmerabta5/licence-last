import {
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { university } from "./universities"

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
