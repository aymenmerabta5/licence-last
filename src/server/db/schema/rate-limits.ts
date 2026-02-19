import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export const rateLimitBucket = pgTable(
  "rate_limit_bucket",
  {
    bucketKey: text("bucket_key").notNull(),
    windowMs: integer("window_ms").notNull(),
    windowStart: timestamp("window_start").notNull(),
    count: integer("count").default(0).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: "rate_limit_bucket_pk",
      columns: [table.bucketKey, table.windowMs, table.windowStart],
    }),
    index("rate_limit_bucket_updated_at_idx").on(table.updatedAt),
  ],
)
