# AGENTS.md — Coding Guidelines for AI Agents

> Last updated: 2025-02-06  
> Project: Internex — A Next.js 16 + React 19 application with editorial design aesthetic, for linking companies internship programs with university students

---

## Build & Development Commands

```bash
# Development server
bun run dev

# Production build
bun run build

# Production server (after build)
bun run start

# Linting (ESLint with Next.js config)
bun run lint
```

**Note:** This project uses Bun as the package manager (`bun.lock` present).

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| React | 19.2.3 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 + `@theme inline` |
| UI Components | shadcn/ui (base-nova style) |
| Animation | motion (Framer Motion successor) |
| Icons | lucide-react |
| Fonts | DM Sans, DM Serif Display (Google Fonts) |

---

## Code Style Guidelines

### Imports & Path Aliases

- **Always use `@/` aliases** — never relative imports:
  - `@/components/ui/button`
  - `@/lib/utils`
  - `@/app/_components/HeroSection`

- **Import order** (separate groups with blank line):
  1. React/Next built-ins
  2. Third-party libraries
  3. `@/` aliases (components, lib, hooks)
  4. Local styles

```typescript
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { ThemeProvider } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import "./globals.css"
```

### TypeScript Conventions

- Use `type` for type imports: `import type { Metadata }`
- Props interfaces use descriptive names:
  ```typescript
  interface ButtonProps extends VariantProps<typeof buttonVariants> {
    className?: string
  }
  ```
- Prefer `interface` over `type` for object shapes
- Use `React.ReactNode` for children
- Strict mode enabled — no implicit any

### Naming Conventions

- **Components**: PascalCase (`HeroSection`, `ThemeToggle`)
- **Files**: PascalCase for components, camelCase for utilities
- **Constants**: UPPER_SNAKE_CASE for module-level constants
  ```typescript
  const NAV_ITEMS = ["Discover", "For Students", "For Recruiters", "About"]
  ```
- **Variants**: Use `cva` (class-variance-authority) with descriptive variant names
- **Hooks**: camelCase starting with `use` (if any custom hooks added)

### Component Structure

```typescript
"use client" // If needed (must be first line)

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 1. Variant definitions
const componentVariants = cva("base classes", {
  variants: {
    variant: { /* ... */ },
    size: { /* ... */ },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

// 2. Component function
function ComponentName({
  className,
  variant = "default",
  size = "default",
  ...props
}: ComponentPrimitive.Props & VariantProps<typeof componentVariants>) {
  return (
    <ComponentPrimitive
      data-slot="component-name"
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// 3. Exports
export { ComponentName, componentVariants }
```

### Tailwind CSS Conventions

- **Use `@theme inline`** — all design tokens defined in `globals.css` as CSS variables
- **Color tokens** (use these, not hardcoded values):
  - `--color-background`, `--color-foreground`
  - `--color-primary`, `--color-secondary`
  - `--color-heading` (for editorial headlines)
  - `--color-muted`, `--color-accent`
- **Radius tokens**: `--radius-sm`, `--radius-md`, `--radius-lg`, etc.
- **Typography**: `--font-sans` (DM Sans), `--font-serif` (DM Serif)

- **Utility classes** via `cn()` from `@/lib/utils`:
  ```typescript
  className={cn(buttonVariants({ variant, size, className }))}
  ```

### Editorial Design System

This project follows a "Morning Press / Night Edition" editorial aesthetic:

- **Warm color palette**: Parchment backgrounds, ink foregrounds
- **Typography**: Serif for headlines (`font-serif`), sans for body (`font-sans`)
- **Spacing**: Generous whitespace, editorial magazine feel
- **Custom utilities** (defined in `globals.css`):
  - `.ed-smooth` — smooth theme transitions
  - `.ed-underline` — animated underline effect
  - `.ed-marquee` — continuous scroll animation
  - `.ed-hero-glow` — ambient background glow (dark mode)

### File Organization

```
app/
├── page.tsx              # Route pages
├── layout.tsx            # Root layout
├── globals.css           # Global styles + theme variables
└── _components/          # Route-specific components (private)
    ├── HeroSection.tsx
    └── StatsBar.tsx

components/
├── ui/                   # shadcn/ui components (auto-generated)
│   ├── button.tsx
│   └── card.tsx
├── Navbar.tsx            # Shared components (top-level)
└── ThemeToggle.tsx

lib/
└── utils.ts              # cn() utility only

public/                   # Static assets
```

### Error Handling

- Use early returns for guard clauses
- Prefer explicit error types over `any`
- Client components: Handle loading/error states with UI feedback
- Server components: Let errors bubble to error boundaries

### Accessibility

- Always include `aria-label` on interactive elements without visible text
- Use semantic HTML (`nav`, `main`, `article`)
- Support `prefers-reduced-motion` (already handled in globals.css)
- Ensure proper color contrast (design system maintains WCAG compliance)

---

## Linting

This project uses ESLint with Next.js core-web-vitals and TypeScript configs:

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
```

Run `bun run lint` before committing. No custom rules — follow Next.js defaults.

---

## Design Philosophy

This codebase prioritizes **editorial elegance** over generic UI:

- **Warm, human aesthetic** — not cold corporate design
- **Intentional asymmetry** — magazine-style layouts
- **Smooth, purposeful motion** — animations that enhance, not distract
- **Typography-driven hierarchy** — serif headlines, clean body text
- **Dark mode as first-class** — "Night Edition" theme is equally refined

When adding features, maintain this editorial voice. Avoid generic component libraries unless they fit the warm, refined aesthetic.

---

## Internationalization (i18n) with next-intl

This project supports **three languages**: English (en), French (fr), and Arabic (ar). All components must be i18n-ready.

### Setup
- **Configuration**: `i18n/routing.ts`, `i18n/request.ts`
- **Messages**: `messages/{en,fr,ar}.json`
- **Middleware**: `middleware.ts` (handles auto-detection)
- **Routing**: All pages under `app/[locale]/`

### Server Components
```typescript
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("namespace")
  return <h1>{t("key")}</h1>
}
```

### Client Components
```typescript
"use client"
import { useTranslations } from "next-intl"

export function Component() {
  const t = useTranslations("namespace")
  return <h1>{t("key")}</h1>
}
```

### RTL (Right-to-Left) Support for Arabic

**CRITICAL**: When styling components that support RTL languages (Arabic), **always use logical CSS properties** instead of physical ones:

| ❌ Physical (Avoid) | ✅ Logical (Use) | Description |
|---------------------|------------------|-------------|
| `ml-*` / `mr-*` | `ms-*` / `me-*` | Margin start/end |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` | Padding start/end |
| `left-*` / `right-*` | `start-*` / `end-*` | Positioning |
| `text-left` / `text-right` | `text-start` / `text-end` | Text alignment |
| `border-l` / `border-r` | `border-s` / `border-e` | Borders |
| `rounded-l` / `rounded-r` | `rounded-s` / `rounded-e` | Border radius |

**Examples:**
```tsx
// Good - logical properties work for both LTR and RTL
<div className="ps-4 pe-6 border-s border-e">

// Bad - physical properties break in RTL
<div className="pl-4 pr-6 border-l border-r">
```

### RTL Font Support
- Arabic uses **Noto Sans Arabic** font
- Automatically applied when `dir="rtl"` is set on `<html>`
- CSS variable: `--font-arabic`

### Navigation with i18n
```typescript
import { usePathname, useRouter } from "@/i18n/routing"

const router = useRouter()
const pathname = usePathname()

// Navigate preserving locale
router.push(pathname)

// Navigate with different locale
router.replace(pathname, { locale: "ar" })
```

### Language Switcher
Use the built-in `LanguageSwitcher` component:
```typescript
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

// Place next to ThemeToggle
<div className="flex items-center gap-3">
  <LanguageSwitcher />
  <ThemeToggle />
</div>
```

### Translation Keys Organization
```
messages/
├── metadata    (page title, description)
├── nav         (navigation labels)
├── hero        (headline, descriptions, CTAs)
├── features    (feature cards)
├── marquee     (scrolling items)
├── stats       (statistics labels)
└── language    (language switcher labels)
```
