import { Bell } from "lucide-react"

export function NotificationTrigger({ unreadCount }: { unreadCount: number }) {
  return (
    <>
      <Bell className="h-5 w-5 text-current opacity-80 transition-[color,opacity] duration-300 group-hover:opacity-100" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center justify-center ring-2 ring-background">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </>
  )
}
