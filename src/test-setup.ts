import { Window } from "happy-dom"

// Ensure required client env vars exist for modules importing `src/env.ts` in tests.
if (!process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "http://localhost:3000"
}

// Initialize happy-dom before any imports
const window = new Window({
  url: "http://localhost:3000",
})

// Set up global DOM APIs with type assertions
// @ts-expect-error happy-dom Window type differs from browser Window
global.window = window
// @ts-expect-error happy-dom Document type differs from browser Document
global.document = window.document
// @ts-expect-error happy-dom Navigator type differs from browser Navigator
global.navigator = window.navigator

// Add missing globals that React/testing-library expect
// @ts-expect-error happy-dom type mismatch
global.HTMLElement = window.HTMLElement
// @ts-expect-error happy-dom type mismatch
global.Element = window.Element
// @ts-expect-error happy-dom type mismatch
global.Node = window.Node
// @ts-expect-error happy-dom type mismatch
global.Document = window.Document
// @ts-expect-error happy-dom type mismatch
global.DocumentFragment = window.DocumentFragment
// @ts-expect-error happy-dom type mismatch
global.Text = window.Text
// @ts-expect-error happy-dom type mismatch
global.Comment = window.Comment
// @ts-expect-error happy-dom type mismatch
global.MouseEvent = window.MouseEvent
// @ts-expect-error happy-dom type mismatch
global.KeyboardEvent = window.KeyboardEvent
// @ts-expect-error happy-dom type mismatch
global.Event = window.Event
// @ts-expect-error happy-dom type mismatch
global.CustomEvent = window.CustomEvent
// @ts-expect-error happy-dom type mismatch
global.FocusEvent = window.FocusEvent
// @ts-expect-error happy-dom type mismatch
global.InputEvent = window.InputEvent
// @ts-expect-error happy-dom type mismatch
global.UIEvent = window.UIEvent
// @ts-expect-error happy-dom type mismatch
global.URL = window.URL
// @ts-expect-error happy-dom type mismatch
global.location = window.location


// @ts-expect-error happy-dom type mismatch - getComputedStyle signature differs
global.getComputedStyle = window.getComputedStyle.bind(window)
global.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 16)
global.cancelAnimationFrame = (id: number) => clearTimeout(id)

// Mock matchMedia if not present
if (!window.matchMedia) {
  // @ts-expect-error happy-dom type mismatch
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

import { expect, mock } from "bun:test"
import * as matchers from "@testing-library/jest-dom/matchers"

// Next.js "server-only" guard throws at runtime; in unit tests we treat it as a no-op.
mock.module("server-only", () => ({}))

// Next.js cacheLife/cacheTag require the cacheComponents runtime; stub them for unit tests.
mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
  revalidatePath: () => {},
  unstable_cache: (fn: Function) => fn,
}))

expect.extend(matchers)
