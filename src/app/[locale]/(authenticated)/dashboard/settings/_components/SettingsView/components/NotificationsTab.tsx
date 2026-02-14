import { Bell, Mail } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface NotificationsTabProps {
  email: string
}

export function NotificationsTab({ email }: NotificationsTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm pt-0">
        <CardHeader className="relative overflow-hidden px-8 pt-7 pb-5 border-b border-border/15 bg-gradient-to-b from-secondary/10 to-transparent">
          <div
            className="absolute inset-y-0 end-8 flex items-center opacity-[0.03] pointer-events-none"
            aria-hidden="true"
          >
            <Bell className="h-24 w-24" />
          </div>

          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </span>
            <CardTitle className="font-serif text-2xl tracking-tight">
              Notifications
            </CardTitle>
            <Badge className="bg-secondary/50 text-muted-foreground border-none font-bold uppercase tracking-widest text-[9px] px-2 py-0.5">
              Soon
            </Badge>
          </div>
          <CardDescription className="font-medium ps-10">
            Fine-tune how and when you receive updates.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <div className="flex items-start gap-3.5 rounded-2xl bg-secondary/10 border border-border/15 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 mt-0.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Email notifications are active
              </p>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Important updates such as application status changes and new messages
                are delivered to <span className="font-medium text-foreground">{email}</span>.
                Granular notification preferences will be available soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
