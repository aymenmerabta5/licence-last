import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const siteSettings = pgTable("site_settings", {
  id: text("id")
    .primaryKey()
    .$default(() => "singleton"),
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
