"use client"

/**
 * Minimal profile background that respects the site's theme.
 * Uses the standard background color with a very subtle warm gradient overlay.
 */
export function ProfileBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none bg-background" />
  )
}
