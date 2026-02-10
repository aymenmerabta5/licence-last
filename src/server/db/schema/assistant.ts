import { pgTable, text, timestamp, index, jsonb } from "drizzle-orm/pg-core"

import { assistantMessageRoleEnum } from "./enums"
import { user } from "./auth"
import { company } from "./companies"

export const assistantConversation = pgTable(
  "assistant_conversation",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    model: text("model").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("assistant_conversation_companyId_idx").on(table.companyId),
    index("assistant_conversation_createdByUserId_idx").on(table.createdByUserId),
    index("assistant_conversation_updatedAt_idx").on(table.updatedAt),
  ],
)

export const assistantMessage = pgTable(
  "assistant_message",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => assistantConversation.id, { onDelete: "cascade" }),
    role: assistantMessageRoleEnum("role").notNull(),
    // Plain-text projection for quick rendering/search; the full UI parts are persisted in `parts`.
    text: text("text"),
    parts: jsonb("parts").$type<unknown[]>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("assistant_message_conversationId_createdAt_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  ],
)
