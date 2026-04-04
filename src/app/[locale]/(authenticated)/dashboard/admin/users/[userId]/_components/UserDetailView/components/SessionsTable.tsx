"use client"

import { Loader2, Monitor, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SessionItem {
  id: string
  tokenPrefix: string | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string | Date
  expiresAt: string | Date
}

interface SessionsTableProps {
  sessions: SessionItem[]
  isLoading: boolean
  onRevoke: (sessionId: string) => void
  isRevoking: boolean
}

export function SessionsTable({
  sessions,
  isLoading,
  onRevoke,
  isRevoking,
}: SessionsTableProps) {
  const t = useTranslations("dashboard.superAdmin.userDetail")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Loading sessions
        </span>
      </div>
    )
  }

  return (
    <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
        <Monitor className="h-4 w-4 text-primary" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {t("sessions.title")}
        </h3>
        <span className="inline-flex h-5 min-w-5 items-center justify-center bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
          {sessions.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-widest font-medium text-foreground/60 h-10">
                {t("sessions.ip")}
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-medium text-foreground/60 h-10">
                {t("sessions.userAgent")}
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-medium text-foreground/60 h-10">
                {t("sessions.created")}
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-medium text-foreground/60 h-10">
                {t("sessions.expires")}
              </TableHead>
              <TableHead className="w-[50px] h-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-sm font-light text-muted-foreground"
                >
                  {t("sessions.none")}
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((s) => (
                <TableRow
                  key={s.id}
                  className="border-b border-border/40 hover:bg-primary/[0.02]"
                >
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {s.ipAddress ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate text-muted-foreground">
                    {s.userAgent ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.expiresAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isRevoking}
                      onClick={() => onRevoke(s.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
