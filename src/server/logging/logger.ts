import pino from "pino"

/**
 * Base configuration for the pino logger
 * Using type assertion for redact option which is supported but not in v5 types
 *
 * NOTE: Uses process.env directly (not @/env) so standalone scripts
 * (db:reset, db:seed) can import this without Next.js runtime.
 */
const loggerConfig = {
  level: process.env.LOG_LEVEL ?? "info",
  base: {
    service: "internex",
    runtime: "nextjs",
    env: process.env.NODE_ENV ?? "development",
  },
  redact: {
    paths: [
      "authorization",
      "cookie",
      "password",
      "token",
      "api_key",
      "secret",
      "*.password",
      "*.token",
      "*.apiKey",
      "*.secret",
    ],
    remove: true,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
} as pino.LoggerOptions & { redact: { paths: string[]; remove: boolean } }

/**
 * Root logger instance
 */
export const logger = pino(loggerConfig)

/**
 * Create a child logger with additional context bindings
 */
export function createLogger(bindings: Record<string, unknown>): pino.Logger {
  return logger.child(bindings)
}

/**
 * Module-scoped logger factory helper
 * Usage: const log = createModuleLogger("email/sendEmail")
 */
export function createModuleLogger(module: string): pino.Logger {
  return createLogger({ module })
}
