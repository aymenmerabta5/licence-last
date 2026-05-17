import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export const skillCategory = pgTable("skill_category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  status: text({ enum: ["active", "deprecated"] })
    .default("active")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const skillTag = pgTable(
  "skill_tag",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    category: text("category"),
    categoryId: integer("category_id")
      .notNull()
      .references(() => skillCategory.id),
    description: text("description"),
    status: text({ enum: ["active", "deprecated"] })
      .default("active")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdBy: text("created_by"),
  },
  (table) => [
    index("skill_tag_slug_idx").on(table.slug),
    index("skill_tag_name_idx").on(table.name),
    index("skill_tag_category_id_idx").on(table.categoryId),
  ],
)
