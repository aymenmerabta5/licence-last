import { z } from "zod"

const publicUrlSchema = z.string().url()

export function getPublicAppUrl(): string {
  return publicUrlSchema.parse(process.env.NEXT_PUBLIC_BETTER_AUTH_URL)
}
