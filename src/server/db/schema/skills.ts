import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core"

export const skillTag = pgTable(
  "skill_tag",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    category: text("category"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("skill_tag_slug_idx").on(table.slug),
    index("skill_tag_name_idx").on(table.name),
  ],
)
