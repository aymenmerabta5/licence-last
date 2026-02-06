# CLAUDE.md — Project Context for Claude

This file contains project-specific knowledge and patterns for Claude to reference.

---

## Project Overview

**Internex** — A Next.js 16 + React 19 application connecting companies with university students for internships.

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Design**: Editorial "Morning Press / Night Edition" aesthetic
- **i18n**: next-intl (EN, FR, AR)

---

## Key Architectural Decisions

### 1. App Router with i18n
All routes are under `app/[locale]/` for internationalization support.

```
app/
├── [locale]/
│   ├── layout.tsx      (with RTL support)
│   ├── page.tsx
│   └── _components/
├── layout.tsx          (root redirector)
└── page.tsx            (redirects to /en)
```

### 2. RTL Support for Arabic
The app automatically handles RTL when locale is 'ar':
- `dir="rtl"` on `<html>` element
- Arabic font: Noto Sans Arabic
- Logical CSS properties throughout

### 3. Editorial Design System
- Warm color palette (parchment, ink)
- Serif headlines (DM Serif Display)
- Sans-serif body (DM Sans / Noto Sans Arabic)
- Generous whitespace
- Asymmetrical layouts

---

## RTL & Logical CSS Properties (CRITICAL)

When writing Tailwind classes for RTL support, **ALWAYS use logical properties**:

### Spacing
```tsx
// ✅ CORRECT - works for LTR and RTL
<div className="ms-4 me-6 ps-2 pe-4">

// ❌ WRONG - breaks in RTL
<div className="ml-4 mr-6 pl-2 pr-4">
```

### Text Alignment
```tsx
// ✅ CORRECT
<p className="text-start"> or <p className="text-end">

// ❌ WRONG
<p className="text-left"> or <p className="text-right">
```

### Borders
```tsx
// ✅ CORRECT
<div className="border-s border-e rounded-s rounded-e">

// ❌ WRONG
<div className="border-l border-r rounded-l rounded-r">
```

### Positioning
```tsx
// ✅ CORRECT
<div className="start-0 end-0 inset-inline-start-4">

// ❌ WRONG
<div className="left-0 right-0 left-4">
```

---

## Translation Patterns

### Server Components
```typescript
import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("namespace")
  return <h1>{t("key.subkey")}</h1>
}
```

### Client Components
```typescript
"use client"
import { useTranslations } from "next-intl"

export function Component() {
  const t = useTranslations("namespace")
  return <h1>{t("key.subkey")}</h1>
}
```

### Translation Structure
```
messages/
├── metadata    → title, description
├── nav         → discover, forStudents, forRecruiters, about, getStarted
├── hero        → volume, headline, description1, description2, cta
├── features    → studentSpace, companyPortal, adminDashboard
├── marquee     → items[]
├── stats       → students, companies, universities, placementRate
└── language    → switcher labels
```

---

## Common Patterns

### Language Switcher
```typescript
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

// Always include in Navbar, next to ThemeToggle
<div className="flex items-center gap-3">
  <LanguageSwitcher />
  <ThemeToggle />
</div>
```

### Navigation with Locale
```typescript
import { usePathname, useRouter } from "@/i18n/routing"

const router = useRouter()
const pathname = usePathname()

// Change locale
router.replace(pathname, { locale: "ar" })
```

### Detecting RTL
```typescript
import { useLocale } from "next-intl"

const locale = useLocale()
const isRTL = locale === "ar"
```

---

## File Conventions

- **Components**: PascalCase (`HeroSection.tsx`)
- **Utilities**: camelCase (`utils.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Imports**: Always use `@/` aliases
- **CSS**: Use logical properties for RTL

---

## Design Tokens

Access via CSS variables:
- `--color-background`, `--color-foreground`
- `--color-primary`, `--color-secondary`
- `--font-sans`, `--font-serif`, `--font-arabic`
- Custom utilities: `.ed-smooth`, `.ed-underline`, `.ed-marquee`

---

## Build Commands

```bash
bun run dev      # Development
bun run build    # Production build
bun run lint     # ESLint
bun run typecheck # TypeScript check
```
