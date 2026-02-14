import { useTheme } from "next-themes"
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const THEMES = [
  {
    id: "light",
    label: "Morning Press",
    hint: "Warm parchment tones",
    icon: Sun,
    iconColor: "text-orange-500",
    preview: {
      bg: "bg-[#faf8f5]",
      bar: "bg-[#1a1a1a]",
      accent: "bg-[#c17f3e]",
      text: "bg-[#1a1a1a]/70",
    },
  },
  {
    id: "dark",
    label: "Night Edition",
    hint: "Deep ink on charcoal",
    icon: Moon,
    iconColor: "text-amber-500",
    preview: {
      bg: "bg-[#141414]",
      bar: "bg-[#f5f0e8]",
      accent: "bg-[#c17f3e]",
      text: "bg-[#f5f0e8]/50",
    },
  },
  {
    id: "system",
    label: "Auto",
    hint: "Match your device",
    icon: Monitor,
    iconColor: "text-slate-500",
    preview: {
      bg: "bg-gradient-to-br from-[#faf8f5] to-[#141414]",
      bar: "bg-gradient-to-r from-[#1a1a1a] to-[#f5f0e8]",
      accent: "bg-[#c17f3e]",
      text: "bg-gradient-to-r from-[#1a1a1a]/60 to-[#f5f0e8]/40",
    },
  },
] as const

export function PreferencesTab() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm pt-0">
        <CardHeader className="relative overflow-hidden px-8 pt-0 pt-7 pb-5 border-b border-border/15 bg-gradient-to-b from-secondary/10 to-transparent">
          <div
            className="absolute inset-y-0 end-8 flex items-center opacity-[0.03] pointer-events-none"
            aria-hidden="true"
          >
            <Palette className="h-24 w-24" />
          </div>

          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Palette className="h-3.5 w-3.5 text-primary" />
            </span>
            <CardTitle className="font-serif text-2xl tracking-tight">
              Visual Identity
            </CardTitle>
          </div>
          <CardDescription className="font-medium ps-10">
            Choose how Internex looks on your device.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {THEMES.map((t) => {
              const Icon = t.icon
              const isActive = theme === t.id

              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "group relative p-5 rounded-2xl border-2 text-start transition-all duration-300",
                    isActive
                      ? "border-primary bg-primary/[0.04] shadow-sm shadow-primary/10"
                      : "border-border/30 hover:border-border/60 bg-secondary/5 hover:bg-secondary/10",
                  )}
                >
                  {/* Active check */}
                  {isActive && (
                    <span className="absolute top-3 end-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}

                  {/* Mini preview mockup */}
                  <div
                    className={cn(
                      "w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 border border-border/10",
                      t.preview.bg,
                    )}
                  >
                    <div className="p-3 h-full flex flex-col gap-2">
                      <div className={cn("h-1.5 w-8 rounded-full", t.preview.bar)} />
                      <div className={cn("h-1 w-12 rounded-full", t.preview.text)} />
                      <div className="flex-1" />
                      <div className="flex gap-1.5">
                        <div className={cn("h-2 w-6 rounded-sm", t.preview.accent)} />
                        <div className={cn("h-2 w-10 rounded-sm opacity-40", t.preview.text)} />
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", t.iconColor)} />
                    <span className="text-sm font-bold">{t.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 ps-6">
                    {t.hint}
                  </p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
