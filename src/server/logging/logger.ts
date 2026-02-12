import "server-only"

import pino from "pino"
import { env } from "@/env"

/**
 * Base configuration for the pino logger
 * Using type assertion for redact option which is supported but not in v5 types
 */
const loggerConfig = {
  level: env.LOG_LEVEL,
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
