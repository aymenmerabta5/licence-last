import { Window } from "happy-dom"

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

// Additional properties for testing-library
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

// @ts-expect-error bun:test is not a module
import { expect } from "bun:test"
import * as matchers from "@testing-library/jest-dom/matchers"

expect.extend(matchers)
