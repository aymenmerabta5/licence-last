import { defineConfig } from "drizzle-kit"

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      [
        `Missing required environment variable: ${name}`,
        "",
        "Set it in your shell, or run Drizzle with an env file (bunx needs --bun):",
        "  bun --env-file=.env.development x --bun drizzle-kit push",
        "  bun --env-file=.env.production x --bun drizzle-kit migrate",
        "",
        "Or use the package scripts:",
        "  bun db:push",
        "  bun db:migrate:prod",
      ].join("\n"),
    )
  }

  return value
}

export default defineConfig({
  out: "./src/server/db/migrations",
  schema: "./src/server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: requireEnv("DATABASE_URL"),
  },
})
