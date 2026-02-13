import { useTheme } from "next-themes"
import { Check, Monitor, Moon, Sun } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function PreferencesTab() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="p-8">
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <Monitor className="h-6 w-6 text-primary" /> Visual Identity
          </CardTitle>
          <CardDescription className="font-medium">
            Personalize how Internex looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Theme Selection
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${theme === "light" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/40 bg-secondary/10 hover:border-border"}`}
              >
                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  <Sun className="h-6 w-6 text-orange-500" />
                </div>
                <span className="text-sm font-bold">Light Edition</span>
                {theme === "light" && (
                  <Check className="h-4 w-4 text-primary mt-1" />
                )}
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${theme === "dark" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/40 bg-secondary/10 hover:border-border"}`}
              >
                <div className="h-12 w-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center shadow-lg">
                  <Moon className="h-6 w-6 text-amber-500" />
                </div>
                <span className="text-sm font-bold">Night Edition</span>
                {theme === "dark" && (
                  <Check className="h-4 w-4 text-primary mt-1" />
                )}
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${theme === "system" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/40 bg-secondary/10 hover:border-border"}`}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white to-black flex items-center justify-center shadow-lg">
                  <Monitor className="h-6 w-6 text-slate-500" />
                </div>
                <span className="text-sm font-bold">System Default</span>
                {theme === "system" && (
                  <Check className="h-4 w-4 text-primary mt-1" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
