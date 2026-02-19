import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"

export const offerMessageThread = pgTable(
  "offer_message_thread",
  {
    id: text("id").primaryKey(),
    offerId: text("offer_id")
      .notNull()
      .references(() => internshipOffer.id, { onDelete: "cascade" }),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    studentUserId: text("student_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("offer_message_thread_offer_student_uidx").on(
      table.offerId,
      table.studentUserId,
    ),
    index("offer_message_thread_companyId_idx").on(table.companyId),
    index("offer_message_thread_studentUserId_idx").on(table.studentUserId),
    index("offer_message_thread_lastMessageAt_idx").on(table.lastMessageAt),
  ],
)

export const offerMessage = pgTable(
  "offer_message",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => offerMessageThread.id, { onDelete: "cascade" }),
    offerId: text("offer_id")
      .notNull()
      .references(() => internshipOffer.id, { onDelete: "cascade" }),
    senderUserId: text("sender_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("offer_message_threadId_createdAt_idx").on(
      table.threadId,
      table.createdAt,
    ),
    index("offer_message_offerId_idx").on(table.offerId),
    index("offer_message_senderUserId_idx").on(table.senderUserId),
  ],
)

export const offerMessageReadState = pgTable(
  "offer_message_read_state",
  {
    threadId: text("thread_id")
      .notNull()
      .references(() => offerMessageThread.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lastReadMessageId: text("last_read_message_id").references(
      () => offerMessage.id,
      {
        onDelete: "set null",
      },
    ),
    lastReadAt: timestamp("last_read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("offer_message_read_state_thread_user_uidx").on(
      table.threadId,
      table.userId,
    ),
    index("offer_message_read_state_userId_idx").on(table.userId),
  ],
)
