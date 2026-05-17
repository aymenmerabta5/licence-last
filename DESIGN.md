---
name: Stag.io
description: A university-company internship matching platform with editorial warmth and professional precision.
colors:
  primary: '#C7562C'
  primary-foreground: '#F9F5EF'
  secondary: '#252525'
  secondary-foreground: '#F9F5EF'
  background: '#F9F5EF'
  foreground: '#252525'
  heading: '#252525'
  card: '#F9F5EF'
  card-foreground: '#252525'
  muted: '#EFEAE3'
  muted-foreground: '#746E68'
  accent: '#EFEAE3'
  accent-foreground: '#252525'
  destructive: '#C23B29'
  border: '#25252519'
  input: '#25252526'
  popover: '#F9F5EF'
  popover-foreground: '#252525'
  ring: '#C7562C'
  dark-background: '#1F1E1B'
  dark-foreground: '#DCD7CE'
  dark-card: '#2B2A27'
  dark-heading: '#E8E3D9'
  dark-muted: '#373530'
  dark-border: '#46433E'
typography:
  display:
    fontFamily: DM Serif Display, Georgia, serif
    fontSize: clamp(2rem, 5vw, 3.5rem)
    fontWeight: 400
    lineHeight: 1
    letterSpacing: normal
  headline:
    fontFamily: DM Serif Display, Georgia, serif
    fontSize: clamp(1.5rem, 3vw, 2.25rem)
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.01em
  title:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: normal
  body:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: normal
  label:
    fontFamily: DM Sans, system-ui, sans-serif
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.05em
rounded:
  none: 0px
  sm: 4px
  md: 6px
  default: 8px
  lg: 8px
  xl: 12px
  2xl: 16px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    rounded: '{rounded.default}'
    padding: 8px 20px
    height: 32px
  button-primary-hover:
    backgroundColor: '{colors.primary}CC'
  button-editorial:
    backgroundColor: transparent
    textColor: '{colors.secondary}'
    rounded: '{rounded.none}'
    padding: 10px 20px
    height: 40px
  button-editorial-hover:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.secondary-foreground}'
  card-default:
    backgroundColor: '{colors.card}'
    textColor: '{colors.card-foreground}'
    rounded: '{rounded.xl}'
    padding: 16px
  card-editorial:
    backgroundColor: transparent
    textColor: '{colors.card-foreground}'
    rounded: '{rounded.none}'
    padding: 24px
  input-default:
    backgroundColor: transparent
    textColor: '{colors.foreground}'
    rounded: '{rounded.none}'
    padding: 4px 10px
    height: 32px
  badge-default:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    rounded: 9999px
    padding: 2px 8px
    height: 20px
---

# Design System: Stag.io

## 1. Overview

**Creative North Star: The Atelier Desk**

A master drafting table: paper, brass instruments, clean lines. Work is visible, organized, and beautiful in its precision — but never decorative for its own sake. Serious work happens here, and the interface treats that work with respect.

Stag.io serves three very different users — anxious students, time-constrained recruiters, bureaucratic university admins — but all of them need the same thing from the interface: confidence that the system knows what it is doing. The visual system therefore privileges clarity over cleverness, precision over play, and warmth over whimsy. Where the homepage invites with editorial elegance, the dashboard must function as an instrument.

This design system operates in two registers from the same token set. The **brand register** (homepage, marketing pages, about) uses serif display type, sharper corners, and more generous whitespace — it is the invitation. The **product register** (dashboards, forms, pipelines, tables) uses the same colors and type families but composes them with more density, consistent rounded corners, and functional hierarchy — it is the instrument. The tokens never change; the composition does.

**Key Characteristics:**
- Warm parchment base with ink-black text and a single terracotta accent. No cool tones, no secondary accent colors.
- Serif for display headlines only; sans-serif for everything else. The serif sets editorial tone on marketing pages but never appears inside dense functional surfaces.
- Sharp editorial corners (0px radius) reserved for brand surfaces and a few signature interactions. Product surfaces use 8px consistently.
- Elevation through tonal layering, not shadow. Dark mode uses a true layered surface stack.
- Motion is smooth deceleration only. No bounce, no elastic, no choreographed sequencing in product surfaces.

## 2. Colors: The Parchment and Ink Palette

A warm, paper-forward palette with a single confident accent. OKLCH is the canonical format; hex values in the frontmatter are approximations for tooling compatibility.

### Primary
- **Burned Terracotta** (oklch(57.7% 0.198 40) / ~#C7562C): The only accent color on screen at any time. Reserved for primary actions, active states, focus rings, and key data highlights. Used on <=10% of any functional surface. Its rarity is the point.

### Secondary
- **Ink Black** (oklch(14.5% 0 0) / ~#252525): The structural color. Used for secondary buttons, strong borders, headings, and the dark mode background. In light mode it is text; in dark mode it becomes the canvas.

### Neutral
- **Warm Parchment** (oklch(97.5% 0.008 85) / ~#F9F5EF): The primary background. A warm, tinted cream that avoids clinical white. Every neutral is tilted toward the brand hue.
- **Muted Ash** (oklch(94% 0.012 85) / ~#EFEAE3): Secondary surface for cards, input backgrounds, dividers, and disabled states.
- **Warm Grey** (oklch(51% 0.01 70) / ~#746E68): Tertiary text, placeholders, secondary labels, timestamps.
- **Subtle Border** (oklch(14.5% 0 0 / 10%)): Structural dividers and input borders. Never used as a decorative accent.

### Dark Mode: The Night Edition
- **Leather Bound** (oklch(14.5% 0.01 60) / ~#1F1E1B): Deep warm black background. Not pure #000; intentionally tinted warm to avoid the void.
- **Candlelight** (oklch(87% 0.016 75) / ~#DCD7CE): Primary text in dark mode. Warm, not cold.
- **Waxed Paper** (oklch(19.5% 0.013 57) / ~#2B2A27): Elevated card surfaces. The dark mode surface stack is strictly layered: bg(14.5) -> sidebar(16.5) -> card(19.5) -> muted(21.5) -> popover(22.5).

### Named Rules
**The One Accent Rule.** The primary terracotta appears on <=10% of any functional screen. Never use it for decorative backgrounds, hover fills on large areas, or border accents. Its presence should mean this is the action or this is the priority.

## 3. Typography

**Display Font:** DM Serif Display (400 weight only), with Georgia fallback
**Body Font:** DM Sans (300, 400, 500, 600, 700), with system-ui fallback
**Arabic Font:** Noto Sans Arabic (300-700), with DM Sans fallback for Latin script within Arabic text

**Character:** A confident editorial pairing rooted in the printed page. DM Serif Display classical proportions evoke quality publishing; DM Sans humanist geometry keeps functional text readable at small sizes. The pairing works at the density required by dashboards because the serif is restricted to display roles.

### Hierarchy
- **Display** (400, clamp(2rem-3.5rem), line-height 1): Hero headlines on the homepage and marketing pages only. Maximum two display-sized elements per page.
- **Headline** (400, clamp(1.5rem-2.25rem), line-height 1.1): Page titles, section headers. In product surfaces, use sans-serif at 600 weight instead of serif.
- **Title** (600, 1.125rem, line-height 1.3): Card titles, form section headers, dialog titles. The workhorse of product hierarchy.
- **Body** (400, 0.875rem, line-height 1.6): All body copy, descriptions, table cells, labels. Capped at 65-75ch per line for readability.
- **Label** (500, 0.75rem, line-height 1.4, letter-spacing 0.05em): Badges, tags, form labels, metadata. Uppercase for category labels and status badges only.

### Named Rules
**The Serif Reservation Rule.** DM Serif Display appears only in the brand register (homepage, about, for-students, for-companies) and in dialog titles. Never in tables, forms, cards, pipelines, or admin dashboards. In product surfaces, headline hierarchy is expressed through weight and scale, not through font family change.

## 4. Elevation

The system is flat-by-default. Depth is conveyed through tonal layering (background -> card -> muted -> popover), not through shadow. Shadows appear only as transient state responses — hover, focus, and modal overlay — never as permanent structural elements.

### Shadow Vocabulary
- **Modal Overlay** (bg-black/10 + backdrop-filter: blur(2px)): Behind dialogs, drawers, and sheets. Extremely subtle; the background is never fully obscured.
- **Popover / Dropdown** (shadow-xl on bg-background/95 backdrop-blur-xl): Floating menus use a combination of translucency, backdrop blur, and a soft shadow to lift above the page without heavy lifting.

### Named Rules
**The No-Card-Shadow Rule.** Cards, containers, and panels do not carry shadow at rest. Their elevation is communicated by background color shift (muted or card tones) or by a 1px ring at 10% foreground opacity. Shadows appear only on hover or when the element is actively floating (popover, modal).

## 5. Components

### Buttons
- **Shape:** Two radius systems coexist by register. Product surfaces: gently curved edges (8px / rounded-lg). Brand surfaces: sharp corners (0px / rounded-none) for editorial buttons.
- **Primary:** Burned terracotta background (#C7562C) with parchment text. Hovered at 80% opacity. The dominant action in any group.
- **Secondary / Outline:** Transparent background with ink border; on hover, muted ash fill. For secondary actions that need visual presence without dominance.
- **Ghost:** Transparent with no border; muted ash fill on hover. For tertiary actions inside dense interfaces (table row actions, inline edits).
- **Editorial (brand-only):** Sharp corners (rounded-none), 2px border, uppercase with 0.15em tracking. Ink border and text; on hover, ink fill with parchment text. Never used inside dashboards or admin views.
- **Destructive:** Subtle red tint background (destructive at 10%) with red text. Not a solid red block — the alarm should be legible, not shouting.

### Badges / Chips
- **Default:** Rounded-full, terracotta background, uppercase label. Used for status indicators where the status is positive or active.
- **Secondary:** Rounded-full, ink background, parchment text. Used for neutral states or role labels.
- **Outline:** Rounded-full, transparent with border. Used for filter tags or selectable options.
- **Editorial (brand-only):** Sharp corners, uppercase, heavy tracking. Used for category labels and section tags on marketing pages only.

### Cards / Containers
- **Default:** 12px radius (rounded-xl), 1px ring at 10% opacity, parchment background, 16px internal padding. The standard container for dashboard content.
- **Editorial (brand-only):** Transparent background, 1px border, no border-radius, 24px padding. Hover reveals a muted ash fill. Used on homepage feature grids and marketing pages. Never nested inside default cards.
- **Ghost:** Transparent, no border, no radius. Used when the container itself should not read as a surface (e.g., grouped form sections inside a settings page).

### Inputs / Fields
- **Style:** Transparent background, 1px border at input opacity (15%), no border-radius (0px) in current code. Redesign target: adopt 6px radius (rounded-md) for product inputs to unify with the rest of the product surface.
- **Focus:** Border shifts to ring color (terracotta) with a 3px focus ring at 50% opacity. Visible, unambiguous, keyboard-first.
- **Error:** Border and ring shift to destructive red. Error text appears below the input, not as a tooltip.
- **Disabled:** 50% opacity, muted background, not-allowed cursor.

### Navigation
- **Navbar:** Transparent background with 1px bottom border. Serif brand mark (DM Serif Display, 1.5rem). Nav links in sans-serif, 0.875rem, medium weight, muted text that shifts to terracotta on hover.
- **Sidebar:** Muted ash background in light mode, dark leather in dark mode. Nav items are sans-serif, 0.875rem. Active state: terracotta text with a subtle left-border indicator (1px, not a heavy stripe).
- **Mobile:** Sheet drawer from the appropriate edge (logical start/end per locale). Background at 95% opacity with backdrop blur.

### Dialogs / Modals
- **Shape:** Sharp corners (0px radius) across all registers. A deliberate design choice: dialogs interrupt workflow, and their sharp edges signal precision and finality.
- **Overlay:** Barely-there black at 10% with 2px backdrop blur. The page behind is still visible; the user is not lost.
- **Header:** Serif title (DM Serif Display, 1.25rem) — the only place serif appears inside product surfaces. This is the exception that proves the rule: a modal title is a moment of pause, and the serif signals pay attention.
- **Footer:** Muted ash background, top border, action buttons aligned end. Rounded-bottom-none to maintain the sharp-corner discipline.

## 6. Do and Don't

### Do:
- **Do** use DM Serif Display for display headlines on marketing pages and modal titles only. It is a scarce resource; scarcity creates impact.
- **Do** cap body text at 65-75ch. Long lines are hard to track, especially in dense dashboard tables.
- **Do** use the terracotta accent on <=10% of any functional screen. Its restraint makes it powerful.
- **Do** respect the surface stack in dark mode: bg -> sidebar -> card -> muted -> popover. Layered surfaces create depth without shadow.
- **Do** use logical CSS properties (start/end, inline/block) for all layout. RTL Arabic support is first-class, not retrofitted.
- **Do** collapse all motion to instant state changes when prefers-reduced-motion is set. No choreographed entrances, no fade delays.
- **Do** pair color with icon or text label for every status indicator. Color alone fails accessibility for colorblind users.

### Don't:
- **Don't** use DM Serif Display inside tables, forms, candidate pipelines, or admin dashboards. The brand register belongs on the homepage; the product register serves workflow.
- **Don't** use rounded-none on inputs, buttons, or cards inside dashboard surfaces. Sharp corners signal editorial brand pages; functional surfaces use consistent 6-8px curvature.
- **Don't** use the terracotta accent for decorative hover backgrounds on large cards, sidebar items, or table rows. That color means action or priority, not decoration.
- **Don't** use gradient text, gradient backgrounds, or glassmorphism anywhere. These are training-data clichés that fight the warm-parchment-and-ink identity.
- **Don't** use side-stripe borders (border-start or border-end >1px) as colored accents on cards, alerts, or list items. Use full borders, background tints, or leading icons instead.
- **Don't** use the hero-metric template (big number + small label + gradient) for dashboard stats. Express metrics through clean typography and context, not through scale for its own sake.
- **Don't** use identical card grids with icon + heading + text repeated endlessly. Vary density, use tables where appropriate, and let different surfaces feel purpose-built.
- **Don't** reach for a modal before exhausting inline or progressive alternatives. Modals interrupt flow; inline editing, expandable rows, and step-by-step wizards preserve context.
- **Don't** use em dashes in any copy. Use commas, colons, semicolons, periods, or parentheses.
