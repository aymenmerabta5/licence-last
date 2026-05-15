-- Create skillCategory table
CREATE TABLE skill_category (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Backfill existing categories from unique skillTag.category values
INSERT INTO skill_category (name, slug)
SELECT DISTINCT category, LOWER(REPLACE(category, ' ', '-'))
FROM skill_tag
WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Add category_id, status, and created_by to skill_tag
ALTER TABLE skill_tag
ADD COLUMN category_id INTEGER REFERENCES skill_category(id),
ADD COLUMN status TEXT DEFAULT 'active' NOT NULL,
ADD COLUMN created_by TEXT;

-- Populate category_id from backfilled skillCategory
UPDATE skill_tag st
SET category_id = sc.id
FROM skill_category sc
WHERE st.category = sc.name;

-- Make category_id NOT NULL after backfill
ALTER TABLE skill_tag ALTER COLUMN category_id SET NOT NULL;

-- Create department_category junction table
CREATE TABLE department_category (
  id SERIAL PRIMARY KEY,
  department_id TEXT NOT NULL REFERENCES department(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES skill_category(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE (department_id, category_id)
);

-- Create index for fast lookup
CREATE INDEX idx_department_category_department_id ON department_category(department_id);

-- Add GIN index on skillTag.name for pg_trgm fuzzy search
CREATE INDEX idx_skill_tag_name_trgm ON skill_tag USING gin (name gin_trgm_ops);
