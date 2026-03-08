import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { documentStatusEnum, documentTypeEnum } from "@/server/db/schema/enums"

export const placement = pgTable(
  "placement",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => application.id, { onDelete: "cascade" }),
    validatedByUserId: text("validated_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    validatedAt: timestamp("validated_at").defaultNow().notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("placement_applicationId_uidx").on(table.applicationId),
    index("placement_validatedAt_idx").on(table.validatedAt),
    index("placement_validatedByUserId_idx").on(table.validatedByUserId),
  ],
)

export const placementDocument = pgTable(
  "document",
  {
    id: text("id").primaryKey(),
    placementId: text("placement_id")
      .notNull()
      .references(() => placement.id, { onDelete: "cascade" }),
    type: documentTypeEnum("type").notNull(),
    status: documentStatusEnum("status").default("pending").notNull(),
    storageKey: text("storage_key"),
    url: text("url"),
    verificationCode: text("verification_code"),
    snapshotData: jsonb("snapshot_data"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("document_placement_type_uidx").on(
      table.placementId,
      table.type,
    ),
    uniqueIndex("document_verification_code_uidx").on(table.verificationCode),
    index("document_placementId_idx").on(table.placementId),
    index("document_type_idx").on(table.type),
    index("document_status_idx").on(table.status),
    index("document_storageKey_idx").on(table.storageKey),
  ],
)
