/**
 * Centralized string utility functions for the Internex application.
 */

/**
 * Generate initials from a name string.
 * Returns up to 2 uppercase characters from the first letters of each word.
 * Useful for avatar fallbacks.
 *
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Alice") // "A"
 * getInitials("John Michael Doe") // "JM"
 * getInitials(null) // "?"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a price with currency
 *
 * @example
 * formatPrice(1000, "DZD") // "1,000 DZD"
 */
export function formatPrice(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}
