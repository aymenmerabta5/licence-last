"use client"

import { Globe, Loader2, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Domain {
  id: string
  domain: string
  status: string
}

interface DomainManagerProps {
  domains: Domain[]
  onAdd: (domain: string) => void
  onRemove: (domainId: string) => void
  isAdding: boolean
  isRemoving: boolean
}

export function DomainManager({
  domains,
  onAdd,
  onRemove,
  isAdding,
  isRemoving,
}: DomainManagerProps) {
  const t = useTranslations("dashboard.universityProfile")
  const [newDomain, setNewDomain] = useState("")

  const handleAdd = () => {
    if (!newDomain.trim()) return
    onAdd(newDomain.trim())
    setNewDomain("")
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">
            {t("newDomain")}
          </label>
          <div className="relative">
            <Globe className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder={t("domainPlaceholder")}
              className="ps-9 h-10 border-border/40 bg-background text-sm"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="editorial-outline"
          size="editorial-sm"
          onClick={handleAdd}
          disabled={isAdding || !newDomain.trim()}
          className="gap-2"
        >
          {isAdding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          {t("addDomain")}
        </Button>
      </div>

      {domains.length > 0 && (
        <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {t("domainsTitle")}
            </h3>
          </div>
          <div className="divide-y divide-border/40">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between px-6 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-sm font-medium">{domain.domain}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${
                      domain.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-400/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/40"
                        : domain.status === "rejected"
                          ? "bg-rose-50 text-rose-700 border-rose-400/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/40"
                          : "bg-amber-50 text-amber-700 border-amber-400/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/40"
                    }`}
                  >
                    {domain.status}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(domain.id)}
                  disabled={isRemoving}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">{t("removeDomain")}</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
