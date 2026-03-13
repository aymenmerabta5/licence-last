import type postgres from "postgres"

type MaintenancePostgresOptions = Pick<
  postgres.Options<Record<string, postgres.PostgresType>>,
  "max" | "prepare" | "onnotice"
>

export function getMaintenancePostgresOptions(): MaintenancePostgresOptions {
  return {
    max: 1,
    prepare: false,
    // Postgres emits NOTICEs for expected CASCADE drops; keep maintenance
    // scripts quiet by swallowing them explicitly on their dedicated client.
    onnotice: (_notice) => {},
  }
}
