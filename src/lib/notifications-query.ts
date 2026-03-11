export const notificationsQueryKeys = {
  root: (viewerId: string) => ["notifications", viewerId] as const,
  list: (viewerId: string, limit: number) =>
    ["notifications", viewerId, "list", limit] as const,
}
