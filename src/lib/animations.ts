import type { Variants, Transition } from "motion"

/**
 * Standard reveal animation for form elements and content blocks.
 * Used with motion components: `<motion.div {...reveal} transition={{ duration: 0.6, ease, delay: 0.1 }} />`
 */
export const reveal: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

/**
 * Editorial ease curve — smooth deceleration for a premium feel.
 * Matches the design system's animation timing.
 */
export const ease: Transition["ease"] = [0.4, 0, 0.2, 1] as const

/**
 * Pre-configured reveal transition for common use cases.
 */
export const revealTransition: Transition = {
  duration: 0.6,
  ease,
} as const

/**
 * Creates a reveal transition with custom delay.
 */
export function revealWithDelay(delay: number): Transition {
  return { duration: 0.6, ease, delay }
}

/**
 * Reduced-motion transition baseline used to avoid long transform animations.
 */
export const reducedMotionTransition: Transition = {
  duration: 0.01,
  delay: 0,
} as const

/**
 * Returns fade-only reveal when reduced motion is preferred.
 */
export function getRevealVariants(prefersReducedMotion: boolean): Variants {
  return prefersReducedMotion ? fadeIn : reveal
}

/**
 * Collapses animation duration/delay when reduced motion is preferred.
 */
export function getTransition(
  transition: Transition,
  prefersReducedMotion: boolean,
): Transition {
  if (!prefersReducedMotion) {
    return transition
  }

  return {
    ...transition,
    ...reducedMotionTransition,
  }
}

/**
 * Fade-in animation for subtle element appearances.
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
}

/**
 * Slide-up animation without fade (for transforms only).
 */
export const slideUp: Variants = {
  initial: { y: 20 },
  animate: { y: 0 },
}
