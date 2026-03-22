import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

describe("logical utility regressions", () => {
  afterEach(() => {
    cleanup()
  })

  test("uses logical inline positioning for avatar badges", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>ST</AvatarFallback>
        <AvatarBadge>•</AvatarBadge>
      </Avatar>,
    )

    const badge = container.querySelector('[data-slot="avatar-badge"]')
    expect(badge?.className).toContain("end-0")
    expect(badge?.className).not.toContain("right-0")
  })

  test("uses logical inline offsets for vertical tabs indicators", () => {
    render(
      <Tabs orientation="vertical" value="overview" onValueChange={() => {}}>
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
      </Tabs>,
    )

    const trigger = screen.getByRole("tab", { name: "Overview" })
    expect(trigger.className).toContain("after:-end-1")
    expect(trigger.className).not.toContain("after:-right-1")
  })

  test("uses logical radii and borders for horizontal toggle groups", () => {
    render(
      <ToggleGroup
        aria-label="View selector"
        defaultValue={["board"]}
        onValueChange={() => {}}
      >
        <ToggleGroupItem value="board" variant="outline">
          Board
        </ToggleGroupItem>
        <ToggleGroupItem value="list" variant="outline">
          List
        </ToggleGroupItem>
      </ToggleGroup>,
    )

    const board = screen.getByRole("button", { name: "Board" })
    expect(board.className).toContain("first:rounded-s-lg")
    expect(board.className).toContain("first:border-s")
    expect(board.className).not.toContain("first:rounded-l-lg")
    expect(board.className).not.toContain("first:border-l")

    const list = screen.getByRole("button", { name: "List" })
    expect(list.className).toContain("last:rounded-e-lg")
    expect(list.className).not.toContain("last:rounded-r-lg")
  })
})
