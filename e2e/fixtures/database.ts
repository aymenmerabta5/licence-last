import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

const E2E_ENV_FILES = [
  ".env.e2e.local",
  ".env.e2e",
  ".env.development.local",
  ".env.development",
]

const LOCAL_DATABASE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "host.docker.internal",
])

interface E2EDatabaseTarget {
  protocol: string
  host: string
  port: string
  database: string
  isLocal: boolean
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "")
}

function readEnvVarFromFile(filePath: string, key: string): string | undefined {
  const envLines = readFileSync(filePath, "utf8").split(/\r?\n/)
  const prefix = `${key}=`

  const rawLine = envLines.find((line) => line.startsWith(prefix))
  if (!rawLine) {
    return undefined
  }

  return stripQuotes(rawLine.slice(prefix.length))
}

function readDatabaseUrlFromKnownEnvFiles(): string | undefined {
  for (const fileName of E2E_ENV_FILES) {
    const envPath = join(process.cwd(), fileName)
    if (!existsSync(envPath)) {
      continue
    }

    const fromE2EVar = readEnvVarFromFile(envPath, "E2E_DATABASE_URL")
    if (fromE2EVar) {
      return fromE2EVar
    }

    const fromDefaultVar = readEnvVarFromFile(envPath, "DATABASE_URL")
    if (fromDefaultVar) {
      return fromDefaultVar
    }
  }

  return undefined
}

function readFlagFromKnownEnvFiles(key: string): string | undefined {
  for (const fileName of E2E_ENV_FILES) {
    const envPath = join(process.cwd(), fileName)
    if (!existsSync(envPath)) {
      continue
    }

    const value = readEnvVarFromFile(envPath, key)
    if (value !== undefined) {
      return value
    }
  }

  return undefined
}

function isPrivateIpv4Address(hostname: string): boolean {
  const parts = hostname.split(".")
  if (parts.length !== 4) {
    return false
  }

  const octets = parts.map((part) => Number(part))
  if (
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return false
  }

  if (octets[0] === 10 || octets[0] === 127) {
    return true
  }

  if (octets[0] === 192 && octets[1] === 168) {
    return true
  }

  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) {
    return true
  }

  return false
}

function isLikelyLocalHost(hostname: string): boolean {
  if (LOCAL_DATABASE_HOSTS.has(hostname)) {
    return true
  }

  if (hostname.endsWith(".local")) {
    return true
  }

  if (isPrivateIpv4Address(hostname)) {
    return true
  }

  // Single-label hosts (for example "postgres") are typically local Docker
  // or LAN aliases.
  if (hostname.length > 0 && !hostname.includes(".")) {
    return true
  }

  return false
}

function parseDatabaseTarget(databaseUrl: string): E2EDatabaseTarget {
  let parsed: URL

  try {
    parsed = new URL(databaseUrl)
  } catch {
    throw new Error(
      `Invalid database URL for E2E: "${databaseUrl}". Provide a valid postgres URL.`,
    )
  }

  const protocol = parsed.protocol
  if (protocol !== "postgresql:" && protocol !== "postgres:") {
    throw new Error(
      `Unsupported database protocol "${protocol}" for E2E. Expected postgres or postgresql.`,
    )
  }

  const database = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""))
  if (!database) {
    throw new Error(
      "E2E database URL must include a database name in the path segment.",
    )
  }

  return {
    protocol,
    host: parsed.hostname,
    port: parsed.port || "5432",
    database,
    isLocal: isLikelyLocalHost(parsed.hostname),
  }
}

export function resolveE2EDatabaseUrl(): string {
  const runtimeValue = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL
  if (runtimeValue) {
    return stripQuotes(runtimeValue)
  }

  const fromEnvFiles = readDatabaseUrlFromKnownEnvFiles()
  if (fromEnvFiles) {
    return fromEnvFiles
  }

  throw new Error(
    [
      "Missing E2E database URL.",
      "Set E2E_DATABASE_URL (preferred) or DATABASE_URL.",
      "You can also define it in .env.e2e or .env.development.",
    ].join("\n"),
  )
}

export function assertSafeE2EDatabaseResetTarget(
  databaseUrl: string,
): E2EDatabaseTarget {
  const target = parseDatabaseTarget(databaseUrl)
  if (target.isLocal) {
    return target
  }

  const allowNonLocalReset =
    process.env.E2E_ALLOW_NON_LOCAL_DATABASE_RESET ??
    readFlagFromKnownEnvFiles("E2E_ALLOW_NON_LOCAL_DATABASE_RESET")

  if (allowNonLocalReset === "1") {
    return target
  }

  throw new Error(
    [
      "Refusing to reset a non-local database from E2E setup.",
      `Target: ${target.host}:${target.port}/${target.database}`,
      "Set E2E_DATABASE_URL to a local test database, or set",
      "E2E_ALLOW_NON_LOCAL_DATABASE_RESET=1 only for isolated disposable DBs.",
    ].join("\n"),
  )
}
