-- Migration: Make content column nullable (R2 migration)
-- Date: 2025-10-28
-- Description: After R2 migration, content column should be nullable since content is stored in R2

-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table

-- 1. Create new table with nullable content
CREATE TABLE articles_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,  -- Changed from NOT NULL to nullable
  content_key TEXT,
  content_size INTEGER,
  content_hash TEXT,
  memo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL
);

-- 2. Copy data from old table to new table
INSERT INTO articles_new (id, title, content, content_key, content_size, content_hash, memo, created_at, updated_at, deleted_at)
SELECT id, title, content, content_key, content_size, content_hash, memo, created_at, updated_at, deleted_at
FROM articles;

-- 3. Drop old table
DROP TABLE articles;

-- 4. Rename new table to original name
ALTER TABLE articles_new RENAME TO articles;

-- 5. Recreate indexes
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON articles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_content_key ON articles(content_key);
