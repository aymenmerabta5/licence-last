import postgres from "postgres"

const db = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false })

const placements = await db`
  select p.id, p.start_date, p.end_date, p.application_id, a.student_user_id, a.offer_id
  from placement p
  join application a on p.application_id = a.id
  where p.end_date < now()
  limit 10
`
console.log("Past placements:", placements)

const docs = await db`
  select d.id, d.placement_id, d.type, d.status, d.locale, d.border_style
  from document d
  where d.type = 'certificate'
  limit 10
`
console.log("Existing certificate docs:", docs)

await db.end({ timeout: 5 })
