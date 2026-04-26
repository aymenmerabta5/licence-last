import type { ComponentType, ReactNode } from "react"
import { createElement } from "react"

interface MotionMockProps extends Record<string, unknown> {
  children?: ReactNode
}

export function createMotionReactClientMock() {
  const componentCache = new Map<string, ComponentType<MotionMockProps>>()
  const supportedTags = [
    "a",
    "article",
    "button",
    "div",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "header",
    "input",
    "label",
    "li",
    "main",
    "nav",
    "p",
    "section",
    "span",
    "ul",
  ] as const

  const getComponent = (tag: string) => {
    const existing = componentCache.get(tag)
    if (existing) {
      return existing
    }

    const component = ({ children, ...props }: MotionMockProps) =>
      createElement(tag, props, children)

    componentCache.set(tag, component)
    return component
  }

  const motionNamespace = Object.fromEntries(
    supportedTags.map((tag) => [tag, getComponent(tag)]),
  ) as Record<string, ComponentType<MotionMockProps>>

  return {
    __esModule: true,
    ...motionNamespace,
    motion: motionNamespace,
  }
}
