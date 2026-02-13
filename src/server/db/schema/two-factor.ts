import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { user } from "./auth"

/**
 * Better Auth twoFactor plugin table.
 * Stores TOTP secrets and backup codes per user.
 */
export const twoFactor = pgTable("two_factor", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
