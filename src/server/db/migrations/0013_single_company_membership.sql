WITH ranked_memberships AS (
  SELECT
    company_id,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at ASC, company_id ASC
    ) AS rank
  FROM company_member
)
DELETE FROM company_member AS membership
USING ranked_memberships AS ranked
WHERE membership.company_id = ranked.company_id
  AND membership.user_id = ranked.user_id
  AND ranked.rank > 1;

DROP INDEX IF EXISTS "company_member_userId_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "company_member_userId_uidx" ON "company_member" ("user_id");
