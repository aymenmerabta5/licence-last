import { Window } from "happy-dom"

;(process.env as Record<string, string | undefined>).NODE_ENV ??= "test"

// Ensure required client env vars exist for modules importing `src/env.ts` in tests.
if (!process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "http://localhost:3000"
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://localhost:5432/test"
}
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET =
    "test-secret-key-that-is-long-enough-for-testing-now"
}
if (!process.env.POE_API_KEY) {
  process.env.POE_API_KEY = "test-poe-api-key"
}
if (!process.env.ARCADE_API_KEY) {
  process.env.ARCADE_API_KEY = "test-arcade-api-key"
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
global.requestAnimationFrame = (callback: FrameRequestCallback) =>
  setTimeout(callback, 16)
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

import { afterEach, expect, mock } from "bun:test"
import * as matchers from "@testing-library/jest-dom/matchers"

function applyGlobalModuleMocks() {
  // Next.js "server-only" guard throws at runtime; in unit tests we treat it as a no-op.
  mock.module("server-only", () => ({}))

  // Cloudflare Turnstile - mock both the raw library and our wrapper component
  // so tests don't hit useLocale()/useTheme() outside providers.
  mock.module("@marsidev/react-turnstile", () => ({
    Turnstile: () => null,
  }))
  mock.module("@/components/TurnstileWidget", () => ({
    TurnstileWidget: () => null,
  }))

  // Next.js cacheLife/cacheTag require the cacheComponents runtime; stub them for unit tests.
  mock.module("next/cache", () => ({
    cacheLife: () => {},
    cacheTag: () => {},
    revalidateTag: () => {},
    revalidatePath: () => {},
    updateTag: () => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unstable_cache: (fn: (...args: any[]) => any) => fn,
  }))

  // Logger imports read validated env at module load time; stub them in tests.
  mock.module("@/server/logging", () => {
    const createMockLogger = () => ({
      fatal: () => {},
      error: () => {},
      warn: () => {},
      info: () => {},
      debug: () => {},
      trace: () => {},
      child: () => createMockLogger(),
    })

    const logger = createMockLogger()
    return {
      logger,
      createLogger: () => createMockLogger(),
      createModuleLogger: () => createMockLogger(),
    }
  })

  // Mock next-intl/server for page component tests
  mock.module("next-intl/server", () => ({
    getTranslations: mock(() => Promise.resolve((key: string) => key)),
    getLocale: mock(() => Promise.resolve("en")),
    getMessages: mock(() => Promise.resolve({})),
    getTimeZone: mock(() => Promise.resolve("UTC")),
    getNow: mock(() => Promise.resolve(new Date())),
  }))
}

applyGlobalModuleMocks()

// `mock.module()` state is process-global in Bun. Reset between tests so
// file-local mocks cannot leak into later suites.
afterEach(() => {
  mock.restore()
  applyGlobalModuleMocks()
})

expect.extend(matchers)
