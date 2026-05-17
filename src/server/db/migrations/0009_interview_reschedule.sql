DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'reschedule_requested'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'interview_status')
  ) THEN
    ALTER TYPE interview_status ADD VALUE 'reschedule_requested';
  END IF;
END $$;

ALTER TABLE interview
  ADD COLUMN IF NOT EXISTS reschedule_note TEXT,
  ADD COLUMN IF NOT EXISTS reschedule_requested_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reschedule_requested_by_user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL;
