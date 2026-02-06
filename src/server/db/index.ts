import { drizzle } from "drizzle-orm/bun-sql"

import { env } from "@/env"
import * as schema from "@/server/db/schema"

export const db = drizzle(env.DATABASE_URL, { schema })
