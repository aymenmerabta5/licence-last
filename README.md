# Internex

A Next.js 16 application connecting university students with company internship programs through an elegant, editorial-inspired interface.

## Features

- **Editorial Design Aesthetic** — "Morning Press / Night Edition" warm design system with parchment backgrounds and sophisticated typography
- **Responsive Hero Section** — Magazine-style layout showcasing internship opportunities
- **Animated Marquee Ribbon** — Continuous scrolling content with partner/company highlights
- **Dynamic Stats Bar** — Key metrics display with animated counters
- **Dark Mode Support** — Seamless theme switching between light and dark modes
- **shadcn/ui Components** — Polished, accessible UI components (Button, Card, Input, Select, Dialog, etc.)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with custom theme variables
- **UI Components**: shadcn/ui (base-nova style)
- **Animation**: motion (Framer Motion successor)
- **Icons**: lucide-react
- **Fonts**: DM Sans, DM Serif Display

## Getting Started

### Prerequisites

- Bun package manager
- Node.js 18+

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Create production build
bun run build

# Start production server
bun run start
```

### Linting

```bash
# Run ESLint
bun run lint
```

## Project Structure

```
app/
├── page.tsx              # Home page with Hero, Marquee, and Stats
├── layout.tsx            # Root layout with fonts and theme provider
├── globals.css           # Global styles, theme variables, custom utilities
└── _components/          # Route-specific components
    ├── HeroSection.tsx   # Main hero with CTA
    ├── MarqueeRibbon.tsx # Scrolling content ribbon
    └── StatsBar.tsx      # Statistics display

components/
├── ui/                   # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── ...
├── Navbar.tsx            # Navigation with theme toggle
└── ThemeToggle.tsx       # Dark/light mode switch

lib/
└── utils.ts              # Utility functions (cn, etc.)
```

## Design System

### Colors
- `--color-background` — Parchment/warm backgrounds
- `--color-foreground` — Ink/dark text
- `--color-primary` — Primary accent
- `--color-secondary` — Secondary elements
- `--color-heading` — Editorial headlines
- `--color-muted` — Subtle text
- `--color-accent` — Highlight accents

### Typography
- **Headlines**: DM Serif Display (serif)
- **Body**: DM Sans (sans-serif)

### Custom Utilities
- `.ed-smooth` — Smooth theme transitions
- `.ed-underline` — Animated underline effect
- `.ed-marquee` — Continuous scroll animation
- `.ed-hero-glow` — Ambient background glow (dark mode)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [motion](https://motion.dev)

## License

Private — Internex Project
