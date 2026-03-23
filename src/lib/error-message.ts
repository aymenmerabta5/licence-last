interface TranslationValues {
  [key: string]: string | number | Date
}

type TranslationFn = ((
  key: string,
  values?: TranslationValues,
) => string) & {
  has?: (key: string) => boolean
}

interface ErrorDetails {
  code?: string
  message?: string
  status?: number
  meta?: TranslationValues
}

interface ResolveLocalizedErrorOptions {
  t: TranslationFn
  fallbackKey: string
  fallbackValues?: TranslationValues
  codeMap?: Record<string, string>
  messageMap?: Record<string, string>
  statusMap?: Record<number, string>
}

export const AUTH_ERROR_MESSAGE_KEYS: Record<string, string> = {
  "missing captcha response": "errors.auth.captchaRequired",
  "invalid credentials": "auth.login.error",
  "invalid email or password": "auth.login.error",
  "email already exists": "errors.auth.emailAlreadyExists",
  "user already exists": "errors.auth.emailAlreadyExists",
  "invalid code": "auth.login.twoFactor.invalidCode",
  "invalid backup code": "auth.login.twoFactor.invalidCode",
  "invalid token": "auth.resetPassword.invalidOrExpired",
  "token expired": "auth.resetPassword.invalidOrExpired",
}

export const AUTH_ERROR_STATUS_KEYS: Record<number, string> = {
  429: "errors.auth.rateLimitExceeded",
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object"
}

function toTranslationValues(value: unknown): TranslationValues | undefined {
  if (!isRecord(value)) return undefined

  const entries = Object.entries(value).filter(([, current]) => {
    return (
      typeof current === "string" ||
      typeof current === "number" ||
      current instanceof Date
    )
  })

  if (entries.length === 0) return undefined

  return Object.fromEntries(entries) as TranslationValues
}

function extractDetailsFromRecord(record: Record<string, unknown>): ErrorDetails {
  const details: ErrorDetails = {}

  if (typeof record.code === "string") {
    details.code = record.code
  }
  if (typeof record.message === "string") {
    details.message = record.message
  }
  if (typeof record.status === "number") {
    details.status = record.status
  }
  if (isRecord(record.error) && typeof record.error.message === "string") {
    details.message ??= record.error.message
  } else if (typeof record.error === "string") {
    details.message ??= record.error
  }
  if (isRecord(record.meta)) {
    details.meta = toTranslationValues(record.meta)
  }

  for (const key of ["data", "shape"] as const) {
    const nested = record[key]
    if (!isRecord(nested)) continue

    if (typeof nested.code === "string") {
      details.code = nested.code
    }
    if (typeof nested.message === "string") {
      details.message ??= nested.message
    }
    if (typeof nested.status === "number") {
      details.status ??= nested.status
    }
    if (isRecord(nested.meta)) {
      details.meta = toTranslationValues(nested.meta)
    }
  }

  return details
}

function normalizeMessage(value: string): string {
  return value.trim().toLowerCase()
}

function translateKey(
  t: TranslationFn,
  key: string,
  values?: TranslationValues,
): string | null {
  try {
    if (typeof t.has === "function" && !t.has(key)) {
      return null
    }

    const translated = t(key, values)
    return translated === key ? null : translated
  } catch {
    return null
  }
}

/**
 * Extracts a human-readable error message from unknown error types.
 * Use this for logging/debugging. Prefer `resolveLocalizedError` for UI copy.
 */
export function getErrorMessage(
  err: unknown,
  fallback = "An error occurred",
): string {
  const details = getErrorDetails(err)

  if (details.message) {
    return details.message
  }

  if (typeof err === "string") return err

  return fallback
}

export function getErrorDetails(err: unknown): ErrorDetails {
  if (err instanceof Error) {
    const details = extractDetailsFromRecord(err as unknown as Record<string, unknown>)
    return {
      ...details,
      message: details.message ?? err.message,
    }
  }

  if (isRecord(err)) {
    return extractDetailsFromRecord(err)
  }

  if (typeof err === "string") {
    return { message: err }
  }

  return {}
}

export function resolveLocalizedError(
  err: unknown,
  {
    t,
    fallbackKey,
    fallbackValues,
    codeMap,
    messageMap,
    statusMap,
  }: ResolveLocalizedErrorOptions,
): string {
  const details = getErrorDetails(err)
  const values = details.meta

  if (details.code) {
    const mappedKey = codeMap?.[details.code] ?? `errors.codes.${details.code}`
    const translated = translateKey(t, mappedKey, values)
    if (translated) {
      return translated
    }
  }

  if (typeof details.status === "number" && statusMap?.[details.status]) {
    const translated = translateKey(t, statusMap[details.status], values)
    if (translated) {
      return translated
    }
  }

  if (details.message && messageMap) {
    const messageKey = messageMap[normalizeMessage(details.message)]
    if (messageKey) {
      const translated = translateKey(t, messageKey, values)
      if (translated) {
        return translated
      }
    }
  }

  return t(fallbackKey, fallbackValues)
}
