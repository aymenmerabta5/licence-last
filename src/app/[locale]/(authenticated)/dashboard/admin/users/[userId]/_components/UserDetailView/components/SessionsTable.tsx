"use client"

import { useTranslations } from "next-intl"
import { Loader2, X } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
interface SessionItem {
  id: string
  token: string
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string | Date
  expiresAt: string | Date
}

interface SessionsTableProps {
  sessions: SessionItem[]
  isLoading: boolean
  onRevoke: (token: string) => void
  isRevoking: boolean
}

export function SessionsTable({ sessions, isLoading, onRevoke, isRevoking }: SessionsTableProps) {
  const t = useTranslations("dashboard.superAdmin.userDetail")

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="border border-border/60 bg-white dark:bg-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/40">
        <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {t("sessions.title")} ({sessions.length})
        </h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("sessions.ip")}</TableHead>
            <TableHead>{t("sessions.userAgent")}</TableHead>
            <TableHead>{t("sessions.created")}</TableHead>
            <TableHead>{t("sessions.expires")}</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                {t("sessions.none")}
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-xs">{s.ipAddress ?? "—"}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">
                  {s.userAgent ?? "—"}
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(s.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(s.expiresAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={isRevoking}
                    onClick={() => onRevoke(s.token)}
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
  )
}
