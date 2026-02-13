import "server-only"

/**
 * Safe alphabet: A-Z minus O/I + digits 2-9 (no 0/1)
 * Avoids ambiguous characters on printed documents.
 */
const SAFE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/**
 * Generates a branded verification code in format INTX-XXXX-XXXX
 * Uses crypto.getRandomValues() for cryptographic randomness.
 * ~1.1 trillion possible codes (32^8).
 */
export function generateVerificationCode(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)

  const chars = Array.from(bytes, (b) => SAFE_ALPHABET[b % SAFE_ALPHABET.length])

  return `INTX-${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}`
}

/**
 * Validates that a string looks like a valid verification code format.
 */
export function isValidVerificationCodeFormat(code: string): boolean {
  return /^INTX-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(code)
}
