import { interpolate, Easing } from "remotion"

// ═══════════════════════════════════════════════════════════════════
// Stag.io Design System — Animation Tokens
// Ease curve from src/lib/animations.ts: [0.4, 0, 0.2, 1]
// ═══════════════════════════════════════════════════════════════════

export const editorialEase = [0.4, 0, 0.2, 1] as const

export const easeOutSmooth = Easing.bezier(0.4, 0, 0.2, 1)
export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1)

// ── Color tokens (Dark / Night Edition) ──
export const colors = {
  bg: "oklch(0.145 0.01 60)",
  foreground: "oklch(0.87 0.016 75)",
  heading: "oklch(0.94 0.018 80)",
  primary: "oklch(0.577 0.198 40)",
  mutedFg: "oklch(0.63 0.014 65)",
  border: "oklch(0.28 0.012 58)",
  card: "oklch(0.195 0.013 57)",
  muted: "oklch(0.215 0.015 58)",
} as const

// ── Typography ──
export const fonts = {
  serif: "'DM Serif Display', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
} as const

// ── Standard reveal (opacity + slideUp) ──
export function reveal(
  frame: number,
  startFrame: number,
  durationInFrames: number,
) {
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutSmooth,
    },
  )

  return {
    opacity: progress,
    y: 20 * (1 - progress),
  }
}

// ── Fade only ──
export function fadeIn(
  frame: number,
  startFrame: number,
  durationInFrames: number,
) {
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutSmooth,
    },
  )
}

export function fadeOut(
  frame: number,
  startFrame: number,
  durationInFrames: number,
) {
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutSmooth,
    },
  )
}

// ── Slide up ──
export function slideUp(
  frame: number,
  startFrame: number,
  durationInFrames: number,
  distance: number = 20,
) {
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [distance, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutSmooth,
    },
  )
}

// ── Scale in ──
export function scaleIn(
  frame: number,
  startFrame: number,
  durationInFrames: number,
) {
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0.96, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutSmooth,
    },
  )
}

// ── ScaleX underline animation ──
export function scaleXReveal(
  frame: number,
  startFrame: number,
  durationInFrames: number,
) {
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutExpo,
    },
  )
}

// ── Draw line (width 0→full) ──
export function drawLine(
  frame: number,
  startFrame: number,
  durationInFrames: number,
) {
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutExpo,
    },
  )
}

// ── Count up ──
export function countUp(
  frame: number,
  startFrame: number,
  durationInFrames: number,
  from: number,
  to: number,
) {
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOutExpo,
    },
  )
}

// ── Marquee scroll ──
export function marqueeScroll(frame: number, speed: number = 1) {
  return -(frame * speed) % 100
}
